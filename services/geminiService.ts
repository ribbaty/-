import { GoogleGenAI, Type } from "@google/genai";

export const generateDateIdeas = async (
  currentMood: string = "浪漫",
  count: number = 5
): Promise<string[]> => {
  try {
    // 每次调用时实例化，确保获取最新的 process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const prompt = `为情侣生成 ${count} 个${currentMood}的今天可以做的具体活动建议。
    要求：
    1. 格式必须严格遵守：'主题：具体要做的事'。
    2. 严禁出现“约会”这两个字。
    3. 主题4-6字，具体说明不超过15个字。
    4. 场景设定为两人尚未同居。
    5. 直接返回字符串数组。请用中文回答。`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    // 降级方案
    return [
      "微光影院：找一部老电影关灯一起看",
      "美食探店：去附近评价最高的甜品店",
      "手作时光：一起画一幅画或者拼乐高",
      "漫步时刻：去附近的公园走走拍拍照",
      "秘密厨艺：挑战用冰箱现有食材做新菜"
    ];
  }
};