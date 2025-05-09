import { ArtiusBaseProvider } from '../provider.js';
import {
  ArtiusModelWrapperInput,
  ArtiusModelGenerationConfig,
  ArtiusModelResponse
} from '../types/index.js';


export interface ArtiusModelWrapperOptions {
  apiKey ? : string,
  generation ? : ArtiusModelGenerationConfig
};

export class ArtiusModelWrapper < T extends ArtiusBaseProvider > {
  
  constructor(
    public provider: T,
    public options: ArtiusModelWrapperOptions = {}
  ) {}
  
  getName(): string {
    return "No model implementation ";
  }
  
 async generate(
    input: ArtiusModelWrapperInput
  ): Promise <ArtiusModelResponse>{
    return this.provider.generate(
      input,
      this.options.generation ?? {},
      input.options
    );
  }
  
  async generateStream(
    input: ArtiusModelWrapperInput,
    callback: (chunk: ArtiusModelResponse) => void,
  ): Promise <void>{
   this.provider.generateStream(
      input,
      callback,
      this.options.generation ?? {},
      input.options
    );
  }
  
}