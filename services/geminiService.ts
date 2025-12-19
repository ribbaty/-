import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDateIdeas = async (
  currentMood: string = "浪漫",
  count: number = 5
): Promise<string[]> => {
  try {
    const prompt = `为情侣生成 ${count} 个${currentMood}的简短约会活动建议。每个建议不超过8个字。例如：'一起做陶艺'，'去海边看日落'。请直接返回一个字符串数组。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      const ideas = JSON.parse(response.text);
      return Array.isArray(ideas) ? ideas : [];
    }
    return [];
  } catch (error) {
    console.error("Error generating date ideas:", error);
    // Fallback ideas in case of error
    return ["去看午夜电影", "一起做顿大餐", "公园野餐", "拼乐高", "城市夜骑"];
  }
};