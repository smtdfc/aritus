import {ArtiusSchemaPack} from './schema.js';

export interface ArtiusModelWrapperInput {
  prompt: string,
  images?: string[],
  options?:ArtiusModelGenerationOptions
}

export interface ArtiusModelResponse {
  original?: any,
  text: string,
  schema?:any
}

export interface ArtiusModelGenerationConfig {
  maxOutputTokens ? : number
  temperature ? : number
  topK ? : number
  topP ? : number
}

export interface ArtiusModelGenerationOptions{
  schemaGenertion?:boolean,
  schema?: ArtiusSchemaPack
}