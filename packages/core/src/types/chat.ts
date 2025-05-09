import {
  ArtiusModelWrapperInput,
  ArtiusModelResponse
} from './model.js';

export interface ArtiusChatDataFile{
  uri: string,
  mimeType:string
}

export interface ArtiusChatDataHuman {
  type: "human";
  content: ArtiusModelWrapperInput;
  options?: any;
  files?:ArtiusChatDataFile[];
}

export interface ArtiusChatDataOther {
  type: "model" | "system";
  content: ArtiusModelResponse;
  options?: any;
  files?:ArtiusChatDataFile[];
  
}

export type ArtiusChatData = ArtiusChatDataHuman | ArtiusChatDataOther;

export type ArtiusChatHistory = ArtiusChatData[];