import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Image Generation (Nano Banana) ---
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  // Using gemini-2.5-flash-image for standard generation
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
        // Nano banana doesn't support responseMimeType
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// --- Image Editing (Nano Banana) ---
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    const ai = getClient();
    // Using gemini-2.5-flash-image for editing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1], // Remove data:image/png;base64, prefix
              mimeType: 'image/png', // Assuming PNG, but API handles common types
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
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image generated");
  };

// --- Text to Speech ---
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Soft, friendly voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- Video Generation (Veo) ---
export const generateVeoVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  const ai = getClient();
  
  // Note: Assuming window.aistudio key selection happened before this call if required
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Fetch the actual video blob using the API key
  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  if (!response.ok) throw new Error("Failed to download video");
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// --- Logic/Puzzle Helper ---
export const generatePuzzleLogic = async (): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Create a simple math sequence puzzle for a 5 year old using emojis (Cat, Bear, Rabbit). Return ONLY the sequence like 'Cat, Bear, Cat' and the numerical answer.",
    });
    return response.text || "Cat, Cat, Bear";
}
