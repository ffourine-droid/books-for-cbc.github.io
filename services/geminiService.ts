
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

// Updated initialization according to guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTutorResponse = async (
  history: ChatMessage[],
  context: { grade: number; topic: string; lessonContent?: string }
) => {
  // Using gemini-3-pro-preview for complex reasoning tasks like math tutoring
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are "MathMaster AI", an expert, friendly math tutor. 
    The student is in Grade ${context.grade}.
    Currently studying: ${context.topic}.
    Current lesson context: ${context.lessonContent || 'General math overview'}.
    
    Guidelines:
    1. Be encouraging and patient.
    2. Don't just give the answer; guide the student through steps.
    3. Use simple, clear language appropriate for a Grade ${context.grade} student.
    4. If they ask for an explanation, use relatable analogies.
    5. Format your output in clean Markdown.
  `;

  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    
    // Using .text property directly as per guidelines
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having a little trouble thinking right now. Can we try that again?";
  }
};
