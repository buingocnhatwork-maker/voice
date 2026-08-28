import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to convert raw 16-bit PCM buffer to a valid WAV buffer with standard 44-byte header
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000, numChannels: number = 1, bitDepth: number = 16): Buffer {
  // Check if buffer is already a RIFF WAV container
  if (
    pcmBuffer.length >= 12 &&
    pcmBuffer.toString("ascii", 0, 4) === "RIFF" &&
    pcmBuffer.toString("ascii", 8, 12) === "WAVE"
  ) {
    return pcmBuffer;
  }

  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const outBuffer = Buffer.alloc(totalSize);

  // RIFF identifier
  outBuffer.write("RIFF", 0, 4, "ascii");
  // File size - 8
  outBuffer.writeUInt32LE(totalSize - 8, 4);
  // WAVE identifier
  outBuffer.write("WAVE", 8, 4, "ascii");
  // fmt chunk
  outBuffer.write("fmt ", 12, 4, "ascii");
  outBuffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  outBuffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  outBuffer.writeUInt16LE(numChannels, 22);
  outBuffer.writeUInt32LE(sampleRate, 24);
  outBuffer.writeUInt32LE(byteRate, 28);
  outBuffer.writeUInt16LE(blockAlign, 32);
  outBuffer.writeUInt16LE(bitDepth, 34);
  // data chunk
  outBuffer.write("data", 36, 4, "ascii");
  outBuffer.writeUInt32LE(dataSize, 40);

  // Copy raw PCM audio samples
  pcmBuffer.copy(outBuffer, 44);

  return outBuffer;
}

// Lazy-initialized Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please ensure it is set in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Single-speaker & multi-speaker Text-to-Speech API
app.post("/api/tts/generate", async (req, res) => {
  try {
    const {
      text,
      voice = "Kore",
      style = "natural",
      speed = 1.0,
      mode = "single",
      speakers, // Array of { speaker: string, voice: string } for multi-speaker
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text prompt is required and cannot be empty." });
    }

    const ai = getGeminiClient();

    let audioBase64: string | undefined;
    let mimeType = "audio/wav";

    if (mode === "multi" && Array.isArray(speakers) && speakers.length === 2) {
      // Multi-speaker generation
      const speakerConfigs = speakers.map((sp: { speaker: string; voice: string }) => ({
        speaker: sp.speaker,
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: sp.voice || "Kore" },
        },
      }));

      const multiPrompt = text.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: multiPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: speakerConfigs,
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        audioBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
      }
    } else {
      // Single speaker generation with tone/style direction
      let directedPrompt = text.trim();

      // Apply style directives if specific tone is selected
      if (style && style !== "natural") {
        switch (style) {
          case "cheerful":
            directedPrompt = `Say cheerfully and warmly: ${directedPrompt}`;
            break;
          case "serious":
            directedPrompt = `Say in a professional, clear news anchor tone: ${directedPrompt}`;
            break;
          case "calm":
            directedPrompt = `Say in a gentle, relaxing, meditative tone: ${directedPrompt}`;
            break;
          case "dramatic":
            directedPrompt = `Say in a dramatic, epic cinematic narration tone: ${directedPrompt}`;
            break;
          case "whisper":
            directedPrompt = `Say in an intimate, soft whisper: ${directedPrompt}`;
            break;
          case "enthusiastic":
            directedPrompt = `Say with high excitement and enthusiasm: ${directedPrompt}`;
            break;
          case "storyteller":
            directedPrompt = `Read expressively like a captivating bedtime storyteller: ${directedPrompt}`;
            break;
          default:
            directedPrompt = text.trim();
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: directedPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData?.data) {
        audioBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: "No audio data received from Gemini TTS model. Please try again with different text or voice.",
      });
    }

    // Convert raw PCM to proper WAV buffer if necessary
    const rawBuffer = Buffer.from(audioBase64, "base64");
    const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");
    const audioDataUrl = `data:audio/wav;base64,${wavBase64}`;

    return res.json({
      success: true,
      audioUrl: audioDataUrl,
      format: "audio/wav",
      sampleRate: 24000,
      charCount: text.length,
      voice: mode === "multi" ? "Multi-Speaker" : voice,
      style: style || "natural",
    });
  } catch (err: any) {
    console.error("TTS generation error:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate text-to-speech audio.",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TTS Server listening on http://localhost:${PORT}`);
  });
}

startServer();
