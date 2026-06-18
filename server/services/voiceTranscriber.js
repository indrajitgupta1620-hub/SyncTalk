import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

/**
 * Transcribe an audio file to text.
 * Tries multiple Gemini models if one is unavailable.
 * Returns a placeholder if no API key is configured.
 *
 * @param {string} filePath - Absolute path to the audio file
 * @returns {Promise<string>} Transcribed text
 */
export const transcribeAudio = async (filePath) => {
  const genAI = getClient();

  if (!genAI) {
    // Fallback: return a placeholder when no API key
    return '[Transcription unavailable — configure GEMINI_API_KEY for voice-to-text]';
  }

  // Read audio file as base64
  const audioData = fs.readFileSync(filePath);
  const audioBase64 = audioData.toString("base64");

  // Try each model in sequence
  for (const modelName of GEMINI_MODELS) {
    try {
      console.log(`Trying transcription with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "audio/webm", // Multer saves voice uploads as webm
            data: audioBase64
          }
        },
        { text: "Please transcribe this audio exactly as it is spoken. Do not add any extra text, markdown, or comments." },
      ]);

      const transcription = result.response.text().trim();
      if (transcription) {
        console.log(`Transcription succeeded with model: ${modelName}`);
        return transcription;
      }
    } catch (error) {
      console.warn(`Transcription model ${modelName} failed: ${error.message}`);
      // Continue to next model
    }
  }

  // All models failed
  throw new Error('Voice transcription failed — all AI models are currently unavailable. Please try again later.');
};

