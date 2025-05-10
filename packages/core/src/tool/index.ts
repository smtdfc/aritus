import {
  ArtiusSchemaPack,
  ArtiusToolDecaration,
} from '../types/index.js';


export function createTool(
  name: string,
  description:string,
  parametersSchema:ArtiusSchemaPack,
  callback: (...args: any[]) => any | void
):ArtiusToolDecaration{
  
  return {
    name,
    description,
    parametersSchema:parametersSchema.json,
    callback
  }
}