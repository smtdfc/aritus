import { ArtiusModelWrapper } from '../wrapper/index.js';
import {
  ArtiusChatData,
  ArtiusChatHistory,
  ArtiusModelWrapperInput,
  ArtiusModelResponse,
  ArtiusModelGenerationOptions,
  ArtiusToolDecaration,
  ArtiusToolMap
  
} from '../types/index.js';

import { ArtiusBaseProvider } from '../provider.js';

export interface ArtiusChatOptions {
  
}

export class ArtiusChat<T extends ArtiusBaseProvider> {
  public history: ArtiusChatHistory;
  public tools: ArtiusToolMap;

  constructor(
    public model: ArtiusModelWrapper<T>,
    public options: ArtiusChatOptions = {}
  ) {
    this.history = [];
    this.tools = {};
  }

  useTool(tool: ArtiusToolDecaration): void {
    this.tools[tool.name] = tool;
  }


  clearHistory(): void {
    this.history = [];
  }


  addTool(name: string, tool: ArtiusToolDecaration): void {
    this.tools[name] = tool;
  }


  removeTool(name: string): void {
    delete this.tools[name];
  }


  getChatHistory(): ArtiusChatHistory {
    return this.history;
  }

  resetTools(): void {
    this.tools = {};
  }

  async send(
    input: ArtiusModelWrapperInput,
  ): Promise<ArtiusModelResponse> {
    if (!this.model.provider) {
      throw new Error("Cannot find model provider!");
    }

    let response = await this.model.provider.generateFromHistory(
      this.history,
      input,
      this.model.options.generation ?? {},
      input.options,
      { ...this.tools, ...this.model.tools }
    );

    return response;
  }
}