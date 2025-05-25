import { ArtiusToolCall } from './tool.js';

export interface ArtiusModelResponse {
  text: string;
  original: any;
  toolCalls?: ArtiusToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseWithJson: boolean;
  json?: any;
  model?: string;
  provider?: string;
}
