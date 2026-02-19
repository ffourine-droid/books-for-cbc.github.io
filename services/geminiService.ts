
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTutorResponse = async (
  history: ChatMessage[],
  context: { grade: number; topic: string; lessonContent?: string }
) => {
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
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having a little trouble thinking right now. Can we try that again?";
  }
};

export const generateBulkContent = async (prompt: string, grade: number) => {
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a detailed lesson plan for Grade ${grade} based on this request: ${prompt}. 
               Provide a single Topic title and at least 3 distinct Lessons for that topic.
               Include both explanations and questions (MCQ and text input).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topicTitle: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Must be 'explanation' or 'question'" },
                content: { type: Type.STRING },
                question_type: { type: Type.STRING, description: "Only for type 'question'. Must be 'input' or 'mcq'" },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for 'mcq'" },
                correct_answer: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "Feedback for the student" }
              },
              required: ["type", "content"]
            }
          }
        },
        required: ["topicTitle", "lessons"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse AI bulk response", e);
    throw new Error("The AI returned a malformed response. Please try again.");
  }
};
