
import { GoogleGenAI, Type } from "@google/genai";
import { Job, Student, ReminderType } from "../types";

export const generateWhatsAppTemplateParams = async (
  job: Job,
  student: Student,
  type: ReminderType
): Promise<string[]> => {
  // Initialize GoogleGenAI with named parameter as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a WhatsApp Business API Specialist.
    Map the following job data to 5 template variables ({{1}} to {{5}}).
    
    Student: ${student.name}
    Job: ${job.title} at ${job.company}
    Deadline: ${job.deadline}
    Link: ${job.link}
    Context: ${type}

    Return a JSON array of exactly 5 strings. 
    {{1}}: Student's first name.
    {{2}}: Job title.
    {{3}}: Company name.
    {{4}}: Deadline.
    {{5}}: Application URL.
  `;

  try {
    // Using gemini-3-pro-preview for complex reasoning and structural mapping tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        // Implementing responseSchema as the recommended way to get structured JSON output
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "An array of 5 strings for WhatsApp template parameters"
        }
      }
    });
    
    // Accessing .text property directly (not as a method)
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Mapping Error:", error);
    return [student.name, job.title, job.company, job.deadline, job.link];
  }
};

// Legacy support for free-text messages
export const generateWhatsAppMessage = async (
  job: Job,
  student: Student,
  type: ReminderType
): Promise<string> => {
  // Initialize GoogleGenAI with named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a professional WhatsApp message for ${student.name} about ${job.title} at ${job.company}. Type: ${type}.`;
  try {
    // Using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Accessing .text property directly
    return response.text || "Error generating message.";
  } catch (e) {
    return `Hi ${student.name}, check out ${job.title} at ${job.company}!`;
  }
};
