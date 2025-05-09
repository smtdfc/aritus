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
    config: ArtiusModelWrapperInput
  ): Promise <ArtiusModelResponse>{
    return this.provider.generate(
      config,
      this.options.generation ?? {}
    );
  }
  
  async generateStream(
    config: ArtiusModelWrapperInput,
    callback: (chunk: ArtiusModelResponse) => void,
  ): Promise <ArtiusModelResponse>{
    return this.provider.generateStream(
      config,
      callback,
      this.options.generation ?? {}
    );
  }
  
}