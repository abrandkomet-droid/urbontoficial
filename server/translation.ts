import { Router, Request, Response } from "express";
import { GoogleGenAI, Modality } from "@google/genai";
import Groq from "groq-sdk";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

export const translationRouter = Router();

// --- Clients Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// --- Helper: Process with Groq (STT & Translation) ---
async function processWithGroq(content: string, inputType: 'text' | 'audio', sourceLang: string, targetLang: string) {
  try {
    let originalText = "";
    let translatedText = "";

    if (inputType === 'audio') {
      // 1. STT with Groq Whisper
      const tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.wav`);
      fs.writeFileSync(tempFilePath, Buffer.from(content, 'base64'));

      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-large-v3",
        language: sourceLang,
        response_format: "json",
      });

      originalText = transcription.text;
      fs.unlinkSync(tempFilePath); // Cleanup
    } else {
      originalText = content;
    }

    // 2. Translation with Groq Llama 3
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional interpreter for a luxury chauffeur service. 
          Translate the following text from ${sourceLang === 'es' ? 'Spanish' : 'English'} to ${targetLang === 'es' ? 'Spanish' : 'English'}. 
          Maintain a professional, polite tone. Handle driving jargon correctly (e.g., "pickup" -> "punto de recogida").
          Output ONLY the translated text.`
        },
        {
          role: "user",
          content: originalText
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    translatedText = chatCompletion.choices[0]?.message?.content || "";

    return { original: originalText, translated: translatedText };
  } catch (error) {
    console.error("Groq Processing Error:", error);
    // Fallback to Gemini if Groq fails
    return { original: content, translated: "Translation unavailable (Groq Error)" };
  }
}

// --- Helper: Text-to-Speech (Gemini TTS) ---
async function generateSpeech(text: string, language: string) {
  const model = "gemini-2.5-flash-preview-tts";
  const voiceName = language === 'en' ? 'Fenrir' : 'Kore'; 

  try {
    const response = await ai.models.generateContent({
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
    return null;
  }
}

// --- Route: The Language Bridge ---
translationRouter.post("/speak", async (req: Request, res: Response) => {
  const { rideId, senderId, senderRole, inputType, content, sourceLang, targetLang }: TranslationRequest = req.body;

  try {
    console.log(`[LANGUAGE_BRIDGE] Processing ${inputType} from ${senderRole} (${sourceLang} -> ${targetLang})`);

    // 1. Process Input (Transcribe + Translate)
    const { original, translated } = await processWithGroq(content, inputType, sourceLang, targetLang);
    
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
