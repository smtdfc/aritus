import {
  GoogleGenAI,
  GenerateContentConfig,
  createUserContent,
  createPartFromUri
} from "@google/genai";

import {
  ArtiusBaseProvider,
  ArtiusModelWrapperInput,
  ArtiusModelResponse,
  ArtiusModelGenerationConfig,
  ArtiusChatHistory,
  ArtiusChatDataFile,
  ArtiusModelGenerationOptions,
  ArtiusToolMap
} from "artius";

import {
  normalizeChatHistory,
  normalizeChatResponse,
  createGenerateOptions,
  createGenerateConfig,
  createToolConfig,
  jsonSchemaToVertexSchema
} from "./helpers/index.js";

export interface ArtiusGoogleProviderOptions {
  apiKey: string;
}

export class ArtiusGoogleProvider extends ArtiusBaseProvider {
  public ai: GoogleGenAI;
  
  constructor(public modelName: string, public options: ArtiusGoogleProviderOptions) {
    super();
    this.ai = new GoogleGenAI({ apiKey: options.apiKey });
  }
  
  private async uploadFile(imgPath: string): Promise < ArtiusChatDataFile > {
    const file = await this.ai.files.upload({ file: imgPath });
    return { uri: file.uri ?? "", mimeType: file.mimeType ?? "" };
  }
  
  private async uploadImages(imagePaths ? : string[]): Promise < ArtiusChatDataFile[] > {
    if (!imagePaths?.length) return [];
    return Promise.all(imagePaths.map((path) => this.uploadFile(path)));
  }
  
  private async buildContents(input: ArtiusModelWrapperInput) {
    const files = await this.uploadImages(input.images);
    const parts = files.map((f) => createPartFromUri(f.uri, f.mimeType));
    return {
      parts: [createUserContent([input.prompt ?? "", ...parts])],
      files,
    };
  }
  
  private async prepareRequest(
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions,
    tools ? : ArtiusToolMap,
    useHistory ? : ArtiusChatHistory,
    functionCallResult ? : any
  ) {
    const { parts, files } = await this.buildContents(input);
    const opts = options ? createGenerateOptions(options) : {};
    const toolsOpts = tools ? createToolConfig(tools) : {};
    const config: GenerateContentConfig = {
      ...createGenerateConfig(generationConfig ?? {}),
      ...opts,
      ...toolsOpts,
    };
    
    let contents = parts;
    
    if (useHistory) {
      useHistory.push({
        type: "human",
        options: {},
        content: input,
        files,
        functionCallResult,
      });
      contents = normalizeChatHistory(useHistory);
    }
    
    return { contents, config, files, history: useHistory };
  }
  
  private async generateCore(contents: any[], config: GenerateContentConfig) {
    return this.ai.models.generateContent({ model: this.modelName, contents, config });
  }
  
  private async handleFunctionCallIfNeeded(
    response: ArtiusModelResponse,
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions,
    tools ? : ArtiusToolMap,
    history ? : ArtiusChatHistory
  ): Promise < ArtiusModelResponse > {
    let currentResponse = response;
    let currentFunctionResult = this.handleFunctionCall(currentResponse, tools ?? {});
    let currentInput = input;
    
    while (currentResponse.functionCall?.length > 0) {
      const { contents, config } = await this.prepareRequest({ prompt: "" },
        generationConfig,
        options,
        tools,
        history,
        currentFunctionResult
      );
      
      const followUp = await this.generateCore(contents, config);
      const normalized = normalizeChatResponse(followUp, options);
      
      if (history) {
        history.push({
          type: "model",
          options: {},
          content: normalized,
          functionCall: normalized.functionCall,
        });
      }
      
      currentResponse = normalized;
      currentFunctionResult = this.handleFunctionCall(currentResponse, tools ?? {});
    }
    
    return currentResponse;
  }
  
  async generate(
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions,
    tools ? : ArtiusToolMap
  ): Promise < ArtiusModelResponse > {
    const { contents, config } = await this.prepareRequest(input, generationConfig, options, tools);
    const response = await this.generateCore(contents, config);
    const normalized = normalizeChatResponse(response, options);
    return this.handleFunctionCallIfNeeded(normalized, input, generationConfig, options, tools);
  }
  
  async generateStream(
    input: ArtiusModelWrapperInput,
    callback: (chunk: ArtiusModelResponse) => void,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions,
    tools ? : ArtiusToolMap
  ): Promise < void > {
    const { contents, config } = await this.prepareRequest(input, generationConfig, options, tools);
    const stream = await this.ai.models.generateContentStream({ model: this.modelName, contents, config });
    
    for await (const chunk of stream) {
      const normalized = normalizeChatResponse(chunk, options);
      const result = await this.handleFunctionCallIfNeeded(normalized, input, generationConfig, options, tools);
      callback(result);
    }
  }
  
  async generateFromHistory(
    history: ArtiusChatHistory,
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions,
    tools ? : ArtiusToolMap
  ): Promise < ArtiusModelResponse > {
    const { contents, config } = await this.prepareRequest(input, generationConfig, options, tools, history);
    const initial = await this.generateCore(contents, config);
    const normalized = normalizeChatResponse(initial, options);
    
    history.push({
      type: "model",
      options: {},
      content: normalized,
      functionCall: normalized.functionCall,
    });
    
    const result = await this.handleFunctionCallIfNeeded(normalized, input, generationConfig, options, tools, history);
    if (result !== normalized) {
      history.push({
        type: "model",
        options: {},
        content: result,
        functionCall: result.functionCall,
      });
    }
    
    return result;
  }
  
  handleFunctionCall(response: ArtiusModelResponse, tools: ArtiusToolMap): Record < string, any > {
    const result: Record < string, any > = {};
    for (const tool of response.functionCall) {
      if (tools[tool.name]) {
        result[tool.name] = tools[tool.name].callback?.(tool.args);
      }
    }
    return result;
  }
}