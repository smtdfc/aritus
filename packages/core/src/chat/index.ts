import { ArtiusModelWrapper } from '../wrapper/index.js';
import {
  ArtiusChatData,
  ArtiusChatHistory,
  ArtiusModelWrapperInput,
  ArtiusModelResponse,
  ArtiusModelGenerationOptions,
  
} from '../types/index.js';

import { ArtiusBaseProvider } from '../provider.js';

export interface ArtiusChatOptions {
  
}

export class ArtiusChat < T extends ArtiusBaseProvider > {
  public history: ArtiusChatHistory;
  constructor(
    public model: ArtiusModelWrapper < T > ,
    public options: ArtiusChatOptions = {}
  ) {
    this.history = [];
  }
  
  async send(
    input: ArtiusModelWrapperInput,

  ): Promise < ArtiusModelResponse > {
    if (!this.model.provider) {
      throw Error("Cannot find model provider !");
    }
    
    let response = await this.model.provider.generateFromHistory(
      this.history,
      input,
      this.model.options.generation ?? {},
      input.options
    );
    
    return response;
  }
  
}