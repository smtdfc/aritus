import { 
  ArtiusChatHistory,
  ArtiusModelResponse,
  ArtiusModelGenerationConfig
} from 'artius';

import { 
  GoogleGenAI, 
  GenerateContentConfig,
  createPartFromUri, 
  createUserContent,
  createModelContent,
} from '@google/genai';

export function normalizeChatHistory(history: ArtiusChatHistory): any[] {
  return history.map(chatData => {
    if (chatData.type === "human") {
      const fileData = (chatData.files || []).map(file => (createPartFromUri(file.uri, file.mimeType)));
      return createUserContent([
        chatData.content.prompt,
        ...fileData
      ]);
    };
    
    if (chatData.type === "model") {
      const fileData = (chatData.files || []).map(file => (createPartFromUri(file.uri, file.mimeType)));
      return createModelContent([
        chatData.content.text,
        ...fileData
      ]);
    };
  }).filter(Boolean);
}

export function normalizeChatResponse(response: any): ArtiusModelResponse {
  return {
    original: response,
    text: response?.text ?? ""
  };
}

export function createGenerateConfig(
  config: Partial < ArtiusModelGenerationConfig >
  
): GenerateContentConfig {
  return {
    maxOutputTokens: config.maxOutputTokens ?? 1024,
    temperature: config.temperature ?? 0.7,
    topP: config.topP ?? 1.0,
    topK: config.topK ?? 40,
  };
}

