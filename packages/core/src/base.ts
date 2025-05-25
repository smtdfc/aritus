import { ArtiusBaseProvider } from './provider.js';
import {
  ArtiusModelConfig,
  ArtiusInput,
  ArtiusModelResponse,
  ArtiusProviderConstructor,
  ArtiusToolMap,
  ArtiusToolDeclaration,
} from './types/index.js';

import { ArtiusChat } from './chat.js';
import { ArtiusProviderError, ArtiusToolError } from './errors/index.js';

export class Artius {
  public provider: ArtiusBaseProvider;
  public tools: ArtiusToolMap = {};
  constructor(
    public providerConstructor: ArtiusProviderConstructor,
    public config: ArtiusModelConfig = {}
  ) {
    if (!config.provider?.modelName) {
      throw new ArtiusProviderError(
        'Cannot setup provider without model name  !'
      );
    }

    this.provider = new this.providerConstructor(
      config.provider?.modelName,
      config
    );

    this.provider.setModelConfig(config);
  }

  useTool(tool: ArtiusToolDeclaration<any>) {
    if (this.tools[tool.name]) {
      throw new ArtiusToolError('The tool that already exists !');
    }

    this.tools[tool.name] = tool;
  }

  async generate(input: ArtiusInput): Promise<ArtiusModelResponse> {
    return this.provider.generate(input, this.tools);
  }

  createChat(): ArtiusChat {
    return new ArtiusChat(this);
  }
}
