import React from "react";
import { GenerateContentRequest, GoogleGenerativeAI, Part } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function generateText(prompt: string) {
    const result = await model.generateContent("Given the following info, create a checklist. Only respond in checklist form." + prompt + "");
    return result.response.text();
}



