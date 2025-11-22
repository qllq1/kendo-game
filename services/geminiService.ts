import { GoogleGenAI } from "@google/genai";
import { TurnResult, PlayerState } from "../types";

// Initialize API safely
let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const getShinpanCommentary = async (
  result: TurnResult,
  p1: PlayerState,
  cpu: PlayerState
): Promise<string> => {
  if (!ai) return "API Key missing. Good strike!";

  try {
    const prompt = `
      You are a high-ranking Kendo Sensei and Referee (Shinpan).
      Analyze this turn in a match between Red (Player) and White (CPU).
      
      Context:
      - Red Stance: ${p1.stance}
      - White Stance: ${cpu.stance}
      - Red Move: ${result.p1Action}
      - White Move: ${result.cpuAction}
      - Winner of turn: ${result.winner === 'p1' ? 'Red' : result.winner === 'cpu' ? 'White' : 'None (Draw)'}
      - Was it Ippon (Point)? ${result.ippon ? 'Yes' : 'No'}
      - Narrative: ${result.narrative}

      Write a ONE SHORT sentence (max 20 words) of spirited commentary or advice in the style of a wise Japanese sword master. Use Japanese kendo terms if appropriate (Ki-Ken-Tai-Ichi, Zanshin, Maai).
      If it was a point, shout it out enthusiastically.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 50,
      }
    });

    return response.text || "A fierce exchange!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Focus your spirit! (Network Error)";
  }
};
