import { GoogleGenAI } from "@google/genai";
import { generatePromptForRun } from "../data/promptGrammar";

export async function generatePuzzleImage(runSeed: string): Promise<string> {
  const prompt = generatePromptForRun(runSeed);
  
  let apiKey = '';
  try {
     apiKey = process.env.GEMINI_API_KEY || '';
  } catch(e) {}
  
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found, falling back to mock generation for demo purposes.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `https://placehold.co/512x512/2e1065/e879f9/png?text=${encodeURIComponent(runSeed)}`;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // "nano banana"
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Generation timed out after 30 seconds.")), 30000);
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);

    let imageUrl = '';
    // The response candidates could have parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
       for (const part of parts) {
          if (part.inlineData) {
             imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
       }
    }

    if (!imageUrl) {
        throw new Error("No image data returned from model");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    // Fallback if generation fails
    return `https://placehold.co/512x512/2e1065/ef4444/png?text=Generation+Failed`;
  }
}
