import { Router, Request, Response } from "express";
import { GoogleGenAI, Modality } from "@google/genai";
import crypto from "crypto";

export const translationRouter = Router();

// --- Gemini Initialization (Lazy) ---
let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it to use translation features.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// --- Types ---
interface TranslationRequest {
  rideId: string;
  senderId: string;
  senderRole: 'chauffeur' | 'passenger';
  inputType: 'text' | 'audio';
  content: string; // Text or Base64 Audio
  sourceLang: 'en' | 'es';
  targetLang: 'en' | 'es';
}

// --- Mock DB Store ---
const conversations: any[] = [];

// --- Helper: Transcribe & Translate (Gemini Multimodal) ---
async function processInput(content: string, inputType: 'text' | 'audio', sourceLang: string, targetLang: string) {
  const model = "gemini-2.5-flash-latest"; // Using latest Flash model for speed/context
  
  let prompt = "";
  let parts: any[] = [];

  if (inputType === 'audio') {
    // Audio Input: Transcribe AND Translate in one go
    prompt = `
      You are a professional interpreter for a luxury chauffeur service.
      Task:
      1. Transcribe the audio (spoken in ${sourceLang === 'es' ? 'Spanish' : 'English'}).
      2. Translate it to ${targetLang === 'es' ? 'Spanish' : 'English'}.
      3. Maintain professional, polite tone. Handle driving jargon correctly (e.g., "pickup" -> "punto de recogida").
      4. Output JSON: { "original": "...", "translated": "..." }
    `;
    parts = [
      { text: prompt },
      { inlineData: { mimeType: "audio/wav", data: content } } // Assuming WAV from frontend
    ];
  } else {
    // Text Input: Translate directly
    prompt = `
      You are a professional interpreter for a luxury chauffeur service.
      Task:
      1. Translate the following text from ${sourceLang === 'es' ? 'Spanish' : 'English'} to ${targetLang === 'es' ? 'Spanish' : 'English'}.
      2. Maintain professional, polite tone. Handle driving jargon correctly.
      3. Output JSON: { "original": "${content}", "translated": "..." }
    `;
    parts = [{ text: prompt }];
  }

  try {
    const result = await getAI().models.generateContent({
      model: model,
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Failed to process translation.");
  }
}

// --- Helper: Text-to-Speech (Gemini TTS) ---
async function generateSpeech(text: string, language: string) {
  const model = "gemini-2.5-flash-preview-tts";
  
  // Voice Selection: 'Kore' (Female/Soft) or 'Fenrir' (Male/Deep)
  // Mapping 'Journey'/'Studio' request to available Gemini voices
  const voiceName = language === 'en' ? 'Fenrir' : 'Kore'; 

  try {
    const response = await getAI().models.generateContent({
      model: model,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio generated");
    
    return audioData; // Base64
  } catch (error) {
    console.error("TTS Error:", error);
    throw new Error("Failed to generate speech.");
  }
}

// --- Route: The Language Bridge ---
translationRouter.post("/speak", async (req: Request, res: Response) => {
  const { rideId, senderId, senderRole, inputType, content, sourceLang, targetLang }: TranslationRequest = req.body;

  try {
    console.log(`[LANGUAGE_BRIDGE] Processing ${inputType} from ${senderRole} (${sourceLang} -> ${targetLang})`);

    // 1. Process Input (Transcribe + Translate)
    const { original, translated } = await processInput(content, inputType, sourceLang, targetLang);
    
    if (!translated) {
      throw new Error("Translation failed to produce output.");
    }

    // 2. Generate Speech (TTS) for the Translated Text
    const audioBase64 = await generateSpeech(translated, targetLang);

    // 3. Log to DB (Audit)
    const conversationId = crypto.randomUUID();
    conversations.push({
      id: conversationId,
      rideId,
      senderId,
      senderRole,
      originalText: original,
      translatedText: translated,
      sourceLang,
      targetLang,
      timestamp: new Date()
    });

    // 4. Return Response
    res.json({
      conversationId,
      originalText: original,
      translatedText: translated,
      audioBase64: audioBase64 // Frontend plays this immediately
    });

  } catch (error: any) {
    console.error("Language Bridge Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// --- Route: Get History ---
translationRouter.get("/history/:rideId", (req: Request, res: Response) => {
  const history = conversations.filter(c => c.rideId === req.params.rideId);
  res.json(history);
});
