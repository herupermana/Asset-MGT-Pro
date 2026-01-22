
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

// Encoding/Decoding helpers as per requirements
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Custom PCM decoding logic as required by SDK guidelines for Live API
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  // Gemini 3 Flash for fast text tasks (Translation)
  async translateText(text: string, targetLanguage: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following technical asset management text into ${targetLanguage}. Keep technical IDs as they are. Return ONLY the translated text: "${text}"`,
      });
      return response.text?.trim() || null;
    } catch (error) {
      console.error("Translation failed:", error);
      return null;
    }
  }

  // Gemini 2.5 Flash Image for Editing
  async editAssetImage(base64Image: string, prompt: string, mimeType: string = 'image/jpeg'): Promise<string | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image editing failed:", error);
      throw error;
    }
  }

  // Connect to Live Audio API
  connectLive(callbacks: {
    onOpen?: () => void,
    onAudioData?: (base64Audio: string) => void,
    onTranscription?: (text: string, isUser: boolean) => void,
    onInterrupted?: () => void,
    onError?: (error: any) => void,
    onClose?: () => void
  }) {
    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => callbacks.onOpen?.(),
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && callbacks.onAudioData) {
            callbacks.onAudioData(base64Audio);
          }
          if (message.serverContent?.interrupted) {
            callbacks.onInterrupted?.();
          }
          if (message.serverContent?.outputTranscription) {
            callbacks.onTranscription?.(message.serverContent.outputTranscription.text, false);
          } else if (message.serverContent?.inputTranscription) {
            callbacks.onTranscription?.(message.serverContent.inputTranscription.text, true);
          }
        },
        onerror: (e) => callbacks.onError?.(e),
        onclose: () => callbacks.onClose?.(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are an intelligent asset management assistant. You help users manage corporate assets, maintenance schedules, and repair orders. Keep responses concise and professional.',
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      }
    });

    return sessionPromise;
  }
}

export const gemini = new GeminiService();
