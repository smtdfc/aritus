import {
  ArtiusModelWrapperInput,
  ArtiusModelResponse
} from './model.js';

export interface ArtiusChatDataFile {
  uri: string,
  mimeType: string
}

export interface ArtiusChatDataHuman {
  type: "human";
  content: ArtiusModelWrapperInput;
  options ? : any;
  files ? : ArtiusChatDataFile[];
  functionCallResult: Record < string,
  any > ;
}

export interface ArtiusChatDataOther {
  type: "model" | "system";
  content: ArtiusModelResponse;
  options ? : any;
  files ? : ArtiusChatDataFile[];
  functionCall: any[];
}

export type ArtiusChatData = ArtiusChatDataHuman | ArtiusChatDataOther;

export type ArtiusChatHistory = ArtiusChatData[];