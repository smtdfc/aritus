import {
  createPartFromUri,
  createUserContent,
  createModelContent
} from '@google/genai';
import { ArtiusChatHistory, ArtiusModelGenerationOptions, ArtiusModelResponse } from 'artius';

export function normalizeChatHistory(history: ArtiusChatHistory): any[] {
  const messages: any[] = [];
  
  for (const chatData of history) {
    if (chatData.type === "human") {
      const files = (chatData.files || []).map(f => createPartFromUri(f.uri, f.mimeType));
      
      if (!chatData.functionCallResult || Object.keys(chatData.functionCallResult).length === 0) {
        messages.push(createUserContent([chatData.content.prompt, ...files]));
      } else {
        for (const fn in chatData.functionCallResult) {
          messages.push({
            role: "user",
            parts: [{
              functionResponse: {
                name: fn,
                response: { result: chatData.functionCallResult[fn] }
              }
            }]
          });
        }
      }
    }
    
    if (chatData.type === "model") {
      if (chatData.functionCall.length > 0) {
        for (const fn of chatData.functionCall) {
          messages.push({
            role: "model",
            parts: [{ functionCall: { name: fn.name, args: fn.args } }]
          });
        }
      } else {
        const files = (chatData.files || []).map(f => createPartFromUri(f.uri, f.mimeType));
        messages.push(createModelContent([chatData.content.text, ...files]));
      }
    }
  }
  
  return messages;
}

export function normalizeChatResponse(response: any, options: ArtiusModelGenerationOptions = {}): ArtiusModelResponse {
  return {
    original: response,
    text: response.functionCalls?.length ? "" : response.text,
    schema: {},
    functionCall: response.functionCalls || []
  };
}