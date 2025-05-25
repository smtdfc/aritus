import {
  ArtiusModelConfig,
  ArtiusInput,
  ArtiusModelResponse,
  ArtiusToolMap,
  ArtiusChatHistory,
} from './types/index.js';

import { ArtiusGenerationError } from './errors/index.js';

export class ArtiusBaseProvider {
  public name = 'unknown_provider';

  constructor(
    public modelName: string,
    protected config: ArtiusModelConfig = {}
  ) {}

  setModelConfig(config: ArtiusModelConfig): void {
    this.config = config;
  }

  async generate(
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ): Promise<ArtiusModelResponse> {
    throw new ArtiusGenerationError(
      `This provider not implementation method !`
    );
  }

  async generateFromHistory(
    history: ArtiusChatHistory,
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ): Promise<ArtiusModelResponse> {
    throw new ArtiusGenerationError(
      `This provider not implementation method !`
    );
  }
}
