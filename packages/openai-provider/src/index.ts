import {
  ArtiusBaseProvider,
  ArtiusModelConfig,
  ArtiusInput,
  ArtiusModelResponse,
  ArtiusProviderError,
  ArtiusGenerationError,
  ArtiusToolMap,
  ArtiusToolCall,
  ArtiusToolResult,
  ArtiusChatHistory,
  ArtiusChat,
  covertSchemaToJson,
  execTool,
} from 'artius';

import OpenAI from 'openai';
import {
  ChatCompletionTool,
  ChatCompletion,
} from 'openai/resources/chat/completions';

export class ArtiusOpenAIProvider extends ArtiusBaseProvider {
  private client: OpenAI;

  constructor(modelName: string, config: ArtiusModelConfig = {}) {
    super(modelName, config);
    if (!config.provider?.apiKey) {
      throw new ArtiusProviderError('Cannot setup provider without API Key!');
    }

    this.name = 'openai_provider';
    this.modelName = modelName;
    this.client = new OpenAI({
      apiKey: config.provider.apiKey,
      baseURL: config.provider.baseURL,
    });
  }

  private async createContent(input: ArtiusInput): Promise<any> {
    if (input.toolCallResult) {
      const toolMessages = input.toolCallResult.map((toolResult) => ({
        role: 'tool',
        tool_call_id: toolResult.info.id,
        content: toolResult.result,
      }));
      return toolMessages;
    }

    if (!input.images && !input.files) {
      return [{ role: 'user', content: input.prompt || '' }];
    }

    const imageMessages =
      input.images?.map((img) => ({
        role: 'user',
        content: [
          { type: 'text', text: input.prompt || '' },
          {
            type: 'image_url',
            image_url: {
              url: img.startsWith('data:')
                ? img
                : `data:image/png;base64,${img}`,
            },
          },
        ],
      })) || [];

    return imageMessages;
  }

  private normalizeToolConfig(tools: ArtiusToolMap): {
    tools: ChatCompletionTool[];
  } {
    const functions: ChatCompletionTool[] = Object.entries(tools).map(
      ([name, config]) => ({
        type: 'function',
        function: {
          name: config.name,
          description: config.description,
          parameters: covertSchemaToJson(config.parameters),
        },
      })
    );

    return { tools: functions };
  }

  private normalizeToolCall(toolCalls: any[]): ArtiusToolCall[] {
    return toolCalls.map((call) => ({
      id: call.id,
      name: call.function.name,
      args: JSON.parse(call.function.arguments),
    }));
  }

  private normalizeResponse(
    response: OpenAI.Chat.ChatCompletion
  ): ArtiusModelResponse {
    const choice = response.choices[0];
    const message = choice.message;

    let toolCalls: ArtiusToolCall[] = [];
    let jsonParsed = false;
    let data = undefined;

    if (message.tool_calls) {
      toolCalls = this.normalizeToolCall(message.tool_calls);
    }

    try {
      data = JSON.parse(message.content || '');
      jsonParsed = true;
    } catch (e) {}

    return {
      original: response,
      text: message.content || '',
      model: this.modelName,
      provider: this.name,
      toolCalls,
      json: data,
      responseWithJson: jsonParsed,
    };
  }

  private normalizeModelMessage(response: ArtiusModelResponse): any {
    if (response.toolCalls && response.toolCalls.length > 0) {
      return {
        role: 'assistant',
        tool_calls: response.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.args),
          },
        })),
      };
    }
    return { role: 'assistant', content: response.text };
  }

  async execTool(
    calls: ArtiusToolCall[],
    tools: ArtiusToolMap
  ): Promise<ArtiusToolResult> {
    return execTool(calls, tools);
  }

  async normalizeHistory(history: ArtiusChatHistory): Promise<any[]> {
    const result = [];
    for (const msg of history) {
      if (msg.role === 'user') {
        const content = await this.createContent(msg.content as ArtiusInput);
        result.push(...content);
      } else {
        result.push(
          this.normalizeModelMessage(msg.content as ArtiusModelResponse)
        );
      }
    }
    return result;
  }

  private buildRequestPayload(
    messages: any[],
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ) {
    const functions = tools ? this.normalizeToolConfig(tools).tools : undefined;

    return {
      model: this.modelName,
      messages,
      temperature: this.config?.generation?.temperature,
      top_p: this.config?.generation?.topP,
      max_tokens: this.config?.generation?.maxOutputTokens,
      tools: functions,
      stream: false,
    };
  }

  async generate(
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ): Promise<ArtiusModelResponse> {
    let shouldContinue = true;
    let normalizedRes: ArtiusModelResponse;
    let toolCallResult: ArtiusToolResult;
    let messages = await this.createContent(input);

    while (shouldContinue) {
      const response = await this.client.chat.completions.create(
        this.buildRequestPayload(messages, input, tools)
      );

      normalizedRes = this.normalizeResponse(response as ChatCompletion);

      if (
        normalizedRes.toolCalls &&
        normalizedRes.toolCalls.length > 0 &&
        tools
      ) {
        toolCallResult = await this.execTool(normalizedRes.toolCalls, tools);
        input = { prompt: '', toolCallResult };
        messages.push(this.normalizeModelMessage(normalizedRes));
        messages.push(...(await this.createContent(input)));
      } else {
        shouldContinue = false;
      }
    }

    return normalizedRes!;
  }

  async generateFromHistory(
    currentHistory: ArtiusChatHistory,
    input: ArtiusInput,
    tools?: ArtiusToolMap
  ): Promise<ArtiusModelResponse> {
    const messages = await this.normalizeHistory(currentHistory);
    let shouldContinue = true;
    let normalizedRes: ArtiusModelResponse;
    let toolCallResult: ArtiusToolResult;

    messages.push(...(await this.createContent(input)));

    while (shouldContinue) {
      currentHistory.push(ArtiusChat.createMessage('user', input));

      const response = await this.client.chat.completions.create(
        this.buildRequestPayload(messages, input, tools)
      );

      normalizedRes = this.normalizeResponse(response as ChatCompletion);
      currentHistory.push(ArtiusChat.createMessage('model', normalizedRes));
      if (
        normalizedRes.toolCalls &&
        normalizedRes.toolCalls.length > 0 &&
        tools
      ) {
        toolCallResult = await this.execTool(normalizedRes.toolCalls, tools);
        input = { prompt: '', toolCallResult };
        messages.push(this.normalizeModelMessage(normalizedRes));
        messages.push(...(await this.createContent(input)));
      } else {
        shouldContinue = false;
      }
    }

    return normalizedRes!;
  }
}
