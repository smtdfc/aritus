import type { ArtiusBaseProvider } from '../provider.js';
import { ArtiusModelConfig } from './model.js';

export type ArtiusProviderConstructor = {
  new (modelName: string, config: ArtiusModelConfig): ArtiusBaseProvider;
};
