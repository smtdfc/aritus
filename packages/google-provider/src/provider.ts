import { GoogleGenAI } from '@google/genai';
import {
  ArtiusBaseProvider,
  ArtiusModelConfig,
  ArtiusInput,
  ArtiusModelResponse,
  ArtiusProviderError,
  ArtiusToolMap,
  ArtiusToolCall,
  ArtiusChat,
  ArtiusChatHistory,
  execTool,
} from 'artius';

import {
  createContent,
  normalizeToolCall,
  normalizeModelMessage,
} from './helpers/google';
import { normalizeGenConfig } from './utils/index.js';

export class ArtiusGoogleProvider extends ArtiusBaseProvider {
  private client: GoogleGenAI;

  constructor(modelName: string, config: ArtiusModelConfig = {}) {
    super(modelName, config);

    if (!config.provider?.apiKey) {
      throw new ArtiusProviderError('Cannot setup provider without API Key!');
    }

    this.name = 'google_provider';
    this.modelName = modelName;
    this.client = new GoogleGenAI({
      apiKey: config.provider.apiKey,
    });
  }

  private normalizeResponse(response: any): ArtiusModelResponse {
    const toolCalls = response.functionCalls?.length
      ? normalizeToolCall(response.functionCalls)
      : [];

    const dataResponse: Partial<ArtiusModelResponse> = {
      original: response,
      text: response.text ?? '',
      model: this.modelName,
      provider: this.name,
      toolCalls,
    };

    try {
      dataResponse.data = JSON.parse(response.text);
      dataResponse.responseWithJson = true;
    } catch {
      dataResponse.responseWithJson = false;
    }

    return dataResponse as ArtiusModelResponse;
  }

  async execTool(calls: ArtiusToolCall[], tools: ArtiusToolMap) {
    return execTool(calls, tools);
  }

  async generate(
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ): Promise<ArtiusModelResponse> {
    let shouldContinue = true;
    const history: any[] = [];
    let result!: ArtiusModelResponse;

    while (shouldContinue) {
      history.push(await createContent(this.client, input));

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: history,
        config: normalizeGenConfig(input, this.config, tools),
      });

      result = this.normalizeResponse(response);

      if (result.toolCalls?.length && tools) {
        const toolCallResult = await this.execTool(result.toolCalls, tools);
        input = { prompt: '', toolCallResult };
        history.push(normalizeModelMessage(result));
      } else {
        shouldContinue = false;
      }
    }

    return result;
  }

  async normalizeHistory(history: ArtiusChatHistory) {
    const result = [];
    for (const msg of history) {
      result.push(
        msg.role === 'user'
          ? await createContent(this.client, msg.content as ArtiusInput)
          : normalizeModelMessage(msg.content as ArtiusModelResponse)
      );
    }
    return result;
  }

  async generateFromHistory(
    currentHistory: ArtiusChatHistory,
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ): Promise<ArtiusModelResponse> {
    const history = await this.normalizeHistory(currentHistory);
    let shouldContinue = true;
    let result!: ArtiusModelResponse;

    while (shouldContinue) {
      history.push(await createContent(this.client, input));
      currentHistory.push(ArtiusChat.createMessage('user', input));

      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: history,
        config: normalizeGenConfig(input, this.config, tools),
      });

      result = this.normalizeResponse(response);

      if (result.toolCalls?.length && tools) {
        input = {
          prompt: '',
          toolCallResult: await this.execTool(result.toolCalls, tools),
        };
        history.push(normalizeModelMessage(result));
      } else {
        shouldContinue = false;
      }

      currentHistory.push(ArtiusChat.createMessage('model', result));
    }

    return result;
  }
}
