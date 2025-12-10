import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: "AIzaSyCj4PB9SHHPELkn_91mbBwO9lTyeE2qSxE" });

export const generateLandingPage = async (prompt: string): Promise<GenerationResponse> => {
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `
    You are a world-class Frontend Engineer and UI/UX Designer specialized in building high-converting landing pages.
    Your task is to generate a modern, aesthetically pleasing landing page based on the user's description.
    
    Design Philosophy:
    - **Theme**: "Ultra-Light & Airy". Use plenty of white space (bg-white, bg-slate-50).
    - **Typography**: Clean, readable sans-serif fonts (Inter/system-ui). Use proper hierarchy (H1, H2, p).
    - **Colors**: Use a primary color (e.g., Indigo, Blue, Violet) for actions, but keep the overall palette neutral and light.
    - **Shadows**: Use soft, diffused shadows (shadow-sm, shadow-lg) to create depth without clutter.
    - **Components**: Rounded corners (rounded-xl, rounded-2xl), prominent call-to-action buttons, clean navigation bars.
    
    Technical Requirements:
    - **Framework**: Tailwind CSS (utility-first). Avoid custom CSS unless absolutely necessary for complex animations.
    - **Responsiveness**: Mobile-first approach using Tailwind's responsive prefixes (md:, lg:).
    - **Images**: Use responsive placeholder images from https://picsum.photos/seed/{random}/WIDTH/HEIGHT.
    - **Interactivity**: Use vanilla JS for essential interactions (mobile menu toggle, smooth scroll, FAQ toggles).
    
    Output Format:
    Return a strict JSON object with the following fields:
    - 'html': The inner HTML content for the <body>. Do not include <html>, <head>, or <body> tags.
    - 'css': Minimal custom CSS (if any).
    - 'js': Vanilla JavaScript logic.
    - 'title': A compelling meta title for the page.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          html: { type: Type.STRING, description: "The inner HTML body content" },
          css: { type: Type.STRING, description: "Custom CSS styles" },
          js: { type: Type.STRING, description: "Vanilla JavaScript logic" },
          title: { type: Type.STRING, description: "The page title" },
        },
        required: ["html", "css", "js", "title"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    return JSON.parse(text) as GenerationResponse;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("AI response was not valid JSON");
  }
};