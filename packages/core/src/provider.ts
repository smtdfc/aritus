import {
  ArtiusChatHistory,
  ArtiusModelWrapperInput,
  ArtiusModelGenerationConfig,
  ArtiusModelResponse
} from './types/index.js';

export abstract class ArtiusBaseProvider {
  abstract generate(
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig
  ): ArtiusModelResponse | Promise < ArtiusModelResponse > ;
  
  abstract generateStream(
    input: ArtiusModelWrapperInput,
    callback: (chunk: ArtiusModelResponse) => void,
    generationConfig ? : ArtiusModelGenerationConfig,
  ): ArtiusModelResponse | Promise < void > ;
  
  abstract generateFromHistory(
    history: ArtiusChatHistory,
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig
  ): ArtiusModelResponse | Promise < ArtiusModelResponse >;

  
}