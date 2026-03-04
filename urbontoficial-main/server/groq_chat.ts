import { Router, Request, Response } from "express";
import crypto from "crypto";
import FormData from "form-data";

export const groqChatRouter = Router();

// ─── In-Memory Ephemeral Store ────────────────────────────────────────────────
// Maps rideId -> ChatMessage[]
interface ChatMessage {
  id: string;
  rideId: string;
  senderRole: "chauffeur" | "passenger";
  originalText: string;
  refinedText: string;
  timestamp: string;
}
const sessions: Record<string, ChatMessage[]> = {};

// ─── Groq Config ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

const GROQ_BASE = "https://api.groq.com/openai/v1";

// ─── Helper: STT via Whisper-large-v3 ────────────────────────────────────────
async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const form = new FormData();
  form.append("file", audioBuffer, {
    filename: "audio.webm",
    contentType: mimeType || "audio/webm",
  });
  form.append("model", "whisper-large-v3");
  form.append("response_format", "json");
  form.append("language", "es"); // Chauffeur speaks primarily in Spanish

  const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper STT failed: ${err}`);
  }

  const data = await res.json() as { text: string };
  return data.text?.trim() ?? "";
}

// ─── Helper: LLM Refinement via llama3-70b-8192 ──────────────────────────────
async function refineMessage(rawText: string, senderRole: "chauffeur" | "passenger"): Promise<string> {
  const systemPrompt =
    senderRole === "chauffeur"
      ? `Eres el Intérprete de Lujo de Urbont. Tu misión es transformar el mensaje del Chauffeur en una comunicación de alta cortesía para el pasajero.

Reglas estrictas:
1. Transforma frases informales en protocolos de alta cortesía.
2. Usa siempre "Estimado cliente" al inicio si el mensaje es un saludo o notificación.
3. Si el chauffeur dice "ya llegué" → "Su Chauffeur ha arribado a su ubicación actual."
4. Si dice "voy tarde" → "Estimado cliente, su Chauffeur se encuentra avanzando hacia su ubicación con una ligera demora. Agradecemos su paciencia."
5. Si dice "estamos llegando" → "Su Chauffeur se aproxima. Puede prepararse para abordaje en breve."
6. Mantén el tono formal, elegante y conciso. Máximo 2 oraciones.
7. Responde ÚNICAMENTE con el mensaje refinado, sin explicaciones.`
      : `Eres el Intérprete de Lujo de Urbont. Tu misión es transformar el mensaje del Pasajero en una comunicación clara y profesional para el Chauffeur.

Reglas:
1. Traduce al español si está en inglés.
2. Mantén el tono respetuoso.
3. Sé conciso y claro.
4. Responde ÚNICAMENTE con el mensaje refinado.`;

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: rawText },
      ],
      temperature: 0.3,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq LLM failed: ${err}`);
  }

  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? rawText;
}

// ─── Route: POST /api/groq-chat/speak  (audio → refined message) ──────────────
groqChatRouter.post("/speak", async (req: Request, res: Response) => {
  try {
    const { rideId, senderRole, audioBase64, mimeType } = req.body as {
      rideId: string;
      senderRole: "chauffeur" | "passenger";
      audioBase64: string;
      mimeType: string;
    };

    if (!rideId || !senderRole || !audioBase64) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 1. Decode Base64 audio
    const audioBuffer = Buffer.from(audioBase64, "base64");

    // 2. Transcribe via Whisper
    let rawText: string;
    try {
      rawText = await transcribeAudio(audioBuffer, mimeType || "audio/webm");
    } catch (e: any) {
      console.error("[GROQ_CHAT] STT Error:", e.message);
      return res.status(422).json({ error: "transcription_failed", message: e.message });
    }

    if (!rawText || rawText.length < 2) {
      return res.status(422).json({ error: "inaudible", message: "Audio was not intelligible." });
    }

    // 3. Refine via llama3-70b
    const refinedText = await refineMessage(rawText, senderRole);

    // 4. Store in ephemeral session
    if (!sessions[rideId]) sessions[rideId] = [];
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      rideId,
      senderRole,
      originalText: rawText,
      refinedText,
      timestamp: new Date().toISOString(),
    };
    sessions[rideId].push(msg);

    console.log(`[GROQ_CHAT] ${senderRole} → "${rawText}" → "${refinedText}"`);

    return res.json(msg);
  } catch (error: any) {
    console.error("[GROQ_CHAT] speak error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Route: POST /api/groq-chat/send  (text → refined message) ───────────────
groqChatRouter.post("/send", async (req: Request, res: Response) => {
  try {
    const { rideId, senderRole, text } = req.body as {
      rideId: string;
      senderRole: "chauffeur" | "passenger";
      text: string;
    };

    if (!rideId || !senderRole || !text?.trim()) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const refinedText = await refineMessage(text.trim(), senderRole);

    if (!sessions[rideId]) sessions[rideId] = [];
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      rideId,
      senderRole,
      originalText: text.trim(),
      refinedText,
      timestamp: new Date().toISOString(),
    };
    sessions[rideId].push(msg);

    return res.json(msg);
  } catch (error: any) {
    console.error("[GROQ_CHAT] send error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ─── Route: GET /api/groq-chat/messages/:rideId  (polling) ───────────────────
groqChatRouter.get("/messages/:rideId", (req: Request, res: Response) => {
  const messages = sessions[req.params.rideId] ?? [];
  return res.json(messages);
});

// ─── Route: DELETE /api/groq-chat/purge/:rideId  (privacy first) ─────────────
groqChatRouter.delete("/purge/:rideId", (req: Request, res: Response) => {
  const { rideId } = req.params;
  const count = sessions[rideId]?.length ?? 0;
  delete sessions[rideId];
  console.log(`[GROQ_CHAT] Purged ${count} messages for ride ${rideId}`);
  return res.json({ purged: count, rideId });
});
