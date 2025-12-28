
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeComplaint = async (text: string, imageBase64?: string) => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  
  const contents: any[] = [{ text: `Analyze this hostel complaint: "${text}". Provide a JSON response with category, priority (LOW, MEDIUM, HIGH), and a short expert analysis.` }];
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            analysis: { type: Type.STRING }
          },
          required: ["category", "priority", "analysis"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed", error);
    return { category: "General", priority: "MEDIUM", analysis: "AI analysis unavailable." };
  }
};

export const refineAnnouncement = async (draft: string) => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Turn this draft into a professional, clear, and authoritative hostel announcement: "${draft}". Return only the refined text.`,
    });
    return response.text;
  } catch (error) {
    return draft;
  }
};

export const getSentiment = async (feedback: string) => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Perform sentiment analysis on this student feedback: "${feedback}". Return JSON with sentiment (POSITIVE, NEGATIVE, NEUTRAL) and a brief summary of insights.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING },
            insights: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { sentiment: "NEUTRAL", insights: "Could not analyze sentiment." };
  }
};

export const chatAssistant = async (query: string, history: { role: string, content: string }[]) => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = "You are HostelX Assistant, a helpful AI for a digital hostel management system. Assist students, wardens, admins, and security with their queries about hostel rules, complaint status, mess menu, and permissions. Be concise and professional.";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

export const matchSkills = async (skills: string) => {
  const ai = getAIClient();
  const model = 'gemini-3-flash-preview';
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Based on these skills: ${skills}, suggest 3 types of hostel skill teams or event roles the student should join. Return as a JSON array of objects with 'teamName' and 'reason'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              teamName: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
