import { ArtiusBaseProvider } from '../provider.js';
import {
  ArtiusModelWrapperInput,
  ArtiusModelGenerationConfig,
  ArtiusModelResponse,
  ArtiusToolDecaration,
  ArtiusToolMap
} from '../types/index.js';


export interface ArtiusModelWrapperOptions {
  apiKey ? : string,
  generation ? : ArtiusModelGenerationConfig
};

export class ArtiusModelWrapper < T extends ArtiusBaseProvider > {
  public tools:ArtiusToolMap = {};
  constructor(
    public provider: T,
    public options: ArtiusModelWrapperOptions = {}
  ) {
    
  }
  
  useTool(
    tool:ArtiusToolDecaration
  ):void{
    this.tools[tool.name] = tool;
  }
  
  getName(): string {
    return "No model implementation ";
  }
  
 async generate(
    input: ArtiusModelWrapperInput
  ): Promise <ArtiusModelResponse>{
    return this.provider.generate(
      input,
      this.options.generation ?? {},
      input.options,
      this.tools
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
      input.options,
      this.tools
    );
  }
  
}