
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  // Try multiple env variable sources for deployment compatibility
  const key = import.meta.env.VITE_API_KEY ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);

  if (!key) {
    console.warn("HostelX: API Key is missing. AI features will be simulated.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

/**
 * AI Smart Auto Draft: Analyzes an image and generates a technical complaint description.
 */
export const draftComplaintDescription = async (imageBase64: string) => {
  const ai = getAIClient();
  const model = 'gemini-2.0-flash';

  if (!ai) {
    return "AI simulation: Leaking pipe detected under sink unit 4B. (Simulated Response)";
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: "ACT AS A HOSTEL FACILITY INSPECTOR. Analyze the provided image of a maintenance issue. Generate a concise, formal, and technical description of the problem (max 40 words). Focus on exactly what is broken or needs attention." },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1] || imageBase64
            }
          }
        ]
      }
    });
    return response.text || "No description could be drafted. Manual entry required.";
  } catch (error) {
    console.error("Auto-drafting failed", error);
    return "AI Node error. Please describe manually.";
  }
};

/**
 * Analyzes a complaint using multimodal input.
 */
export const analyzeComplaint = async (text: string, imageBase64?: string) => {
  const ai = getAIClient();
  const model = 'gemini-2.0-flash';

  if (!ai) {
    return {
      category: "Maintenance",
      priority: "MEDIUM",
      analysis: "AI Simulation: Issue categorized based on keywords. Priority set to standard. (Simulated)"
    };
  }

  const parts: any[] = [{
    text: `CRITICAL SYSTEM AUDIT: Analyze this hostel complaint: "${text}". 
    Evaluate severity and categorize. 
    Return ONLY a JSON object with: 
    "category" (one of: Plumbing, Electrical, Furniture, Internet, Mess, Other), 
    "priority" (LOW, MEDIUM, HIGH), 
    "analysis" (concise 1-sentence summary).`
  }];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
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
    return response.text?.trim() ? JSON.parse(response.text) : { category: "General", priority: "MEDIUM", analysis: "AI generated an empty response." };
  } catch (error) {
    console.error("AI Audit Protocol Failed", error);
    return { category: "General", priority: "MEDIUM", analysis: "AI node offline. Manual audit required." };
  }
};

export const chatAssistant = async (query: string, history: { role: string, content: string }[]) => {
  const ai = getAIClient();
  const model = 'gemini-2.0-flash';

  if (!ai) {
    return "I am running in simulation mode. Please configure VITE_API_KEY to enable full neural link. I cannot process real-time queries without it.";
  }

  const systemInstruction = `You are the HostelX Core AI. You assist users within a high-tech hostel management environment. 
  Keep responses under 3 sentences. Use technical but helpful tone. 
  Refer to the system as "The Grid".`;

  try {
    const validHistory = history.filter((h, idx) => !(idx === 0 && h.role !== 'user'));

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...validHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    console.error("Chat terminal failure", error);
    return "Communication link unstable. Please retry terminal uplink.";
  }
};

export const refineAnnouncement = async (draft: string) => {
  const ai = getAIClient();
  const model = 'gemini-2.0-flash';

  if (!ai) return draft;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `RE-FORMAT FOR OFFICIAL BROADCAST: "${draft}". Output ONLY the text.`,
    });
    return response.text;
  } catch (error) {
    return draft;
  }
};

export const analyzeSymptoms = async (symptoms: string) => {
  const ai = getAIClient();
  const model = 'gemini-2.0-flash'; // High speed for interactive medical

  if (!ai) {
    return {
      condition: "Simulation Mode: Common Cold",
      advice: "Rest, hydration, and steam inhalation.",
      medicines: ["Paracetamol", "Vitamin C"],
      disclaimer: "SIMULATION ONLY. CONSULT A DOCTOR."
    };
  }

  const prompt = `ACT AS A FIRST-AID MEDICAL ASSISTANT. Analyze: "${symptoms}".
  Identify potential common conditions (mild/hostel level).
  Suggest FIRST-AID advice and OTC medicines only.
  NEVER PRESCRIBE ANTIBIOTICS or restricted drugs.
  Respond in valid JSON:
  {
    "condition": "Possible condition",
    "advice": "Short advice",
    "medicines": ["Med1", "Med2"],
    "disclaimer": "Consult doctor if symptoms persist."
  }`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: { role: 'user', parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    return result.text ? JSON.parse(result.text) : null;
  } catch (e) {
    console.error("Medical AI Failed", e);
    return null;
  }
};
