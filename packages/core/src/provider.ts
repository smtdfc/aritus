import {
  ArtiusChatHistory,
  ArtiusModelWrapperInput,
  ArtiusModelGenerationConfig,
  ArtiusModelResponse,
  ArtiusModelGenerationOptions,
  ArtiusToolMap
} from './types/index.js';

export abstract class ArtiusBaseProvider {

  abstract generate(
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options?:ArtiusModelGenerationOptions,
    tools?:ArtiusToolMap
  ): ArtiusModelResponse | Promise < ArtiusModelResponse > ;
  
  abstract generateStream(
    input: ArtiusModelWrapperInput,
    callback: (chunk: ArtiusModelResponse) => void,
    generationConfig ? : ArtiusModelGenerationConfig,
    options?:ArtiusModelGenerationOptions,
    tools?: ArtiusToolMap
  ): ArtiusModelResponse | Promise < void > ;
  
  abstract generateFromHistory(
    history: ArtiusChatHistory,
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options?:ArtiusModelGenerationOptions,
    tools?:ArtiusToolMap
  ): ArtiusModelResponse | Promise < ArtiusModelResponse >;

}