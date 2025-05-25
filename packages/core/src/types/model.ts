export interface ArtiusModelGenerationConfig {
  topK?: number;
  topP?: number;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ArtiusProviderConfig {
  modelName: string;
  apiKey: string;
  baseURL?: string;
}

export interface ArtiusModelConfig {
  provider?: ArtiusProviderConfig;
  systemInstruction?: string;
  generation?: ArtiusModelGenerationConfig;
}
