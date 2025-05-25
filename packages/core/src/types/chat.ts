import { ArtiusInput } from './input.js';
import { ArtiusModelResponse } from './response.js';

export type ArtiusChatRole = 'model' | 'user';

export interface ArtiusChatMessage {
  time: string;
  id: string;
  role: ArtiusChatRole;
  content: ArtiusInput | ArtiusModelResponse;
}

export type ArtiusChatHistory = Array<ArtiusChatMessage>;
