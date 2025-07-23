
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("API_KEY environment variable not set. Gemini API features will be unavailable.");
}

export const generateText = async (prompt: string): Promise<string> => {
  if (!ai) {
    console.error("Gemini AI client not initialized.");
    return "Gemini AI not available. API Key missing.";
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    return `Error from AI: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

export const startChat = async (): Promise<Chat | null> => {
  if (!ai) {
    console.error("Gemini AI client not initialized.");
    return null;
  }
  try {
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash', 
      config: {
        systemInstruction: 'You are an expert study assistant for university students. Be encouraging, clear, and focused on helping the user learn and understand their course material. Break down complex topics into simple, digestible parts.',
      },
    });
    return chat;
  } catch(e) {
      console.error("Error creating chat:", e);
      return null;
  }
};

export const sendMessage = async (chat: Chat, message: string): Promise<string> => {
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch(e) {
        console.error("Error sending message:", e);
        if (e instanceof Error) {
            return `I'm sorry, I ran into an issue: ${e.message}`;
        }
        return "I'm sorry, an unknown error occurred.";
    }
}
