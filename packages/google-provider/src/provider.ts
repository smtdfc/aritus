import {
  GoogleGenAI,
  GenerateContentConfig,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

import {
  ArtiusBaseProvider,
  ArtiusModelWrapperInput,
  ArtiusModelResponse,
  ArtiusModelGenerationConfig,
  ArtiusChatHistory,
  ArtiusChatDataFile,
  ArtiusModelGenerationOptions,
} from 'artius';

import {
  normalizeChatHistory,
  normalizeChatResponse,
  createGenerateOptions,
  createGenerateConfig
} from './helpers/index.js';


export interface ArtiusGoogleProviderOptions {
  apiKey: string;
}

export class ArtiusGoogleProvider extends ArtiusBaseProvider {
  public ai: GoogleGenAI;
  
  constructor(
    public modelName: string,
    public options: ArtiusGoogleProviderOptions
  ) {
    super();
    this.ai = new GoogleGenAI({ apiKey: options.apiKey });
  }
  
  private async uploadFile(
    imgPath: string
  ): Promise < ArtiusChatDataFile > {
    const file = await this.ai.files.upload({ file: imgPath });
    return {
      uri: file.uri ?? "",
      mimeType: file.mimeType ?? ""
    };
  }
  
  private async uploadImages(
    imagePaths ? : string[]
  ): Promise < ArtiusChatDataFile[] > {
    if (!imagePaths || imagePaths.length === 0) return [];
    return Promise.all(imagePaths.map(path => this.uploadFile(path)));
  }
  
  private async buildContents(
    input: ArtiusModelWrapperInput
  ): Promise < { parts: any[], files ? : ArtiusChatDataFile[] } > {
    const files = await this.uploadImages(input.images);
    const parts = files.map(f => createPartFromUri(f.uri, f.mimeType));
    return {
      parts: [
        createUserContent([input.prompt ?? "", ...parts])
      ],
      files
    };
  }
  
  async generateStream(
    input: ArtiusModelWrapperInput,
    callback: (chunk: ArtiusModelResponse) => void,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions
  ): Promise < void > {
    const { parts } = await this.buildContents(input);
    const response = await this.ai.models.generateContentStream({
      model: this.modelName,
      contents: parts,
      config: createGenerateConfig(generationConfig ?? {}),
    });
    
    for await (const chunk of response) {
      callback(normalizeChatResponse(response));
    }
  }
  
  async generate(
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions
  ): Promise < ArtiusModelResponse > {
    let opts = options ? createGenerateOptions(options) : {};
    
    const { parts } = await this.buildContents(input);
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: parts,
      config: {
        ...createGenerateConfig(generationConfig ?? {}),
        ...opts
      },
    });
    
    return normalizeChatResponse(response);
  }
  
  
  async generateFromHistory(
    history: ArtiusChatHistory,
    input: ArtiusModelWrapperInput,
    generationConfig ? : ArtiusModelGenerationConfig,
    options ? : ArtiusModelGenerationOptions
  ): Promise < ArtiusModelResponse > {
    let opts = options ? createGenerateOptions(options) : {};
    
    const { parts, files } = await this.buildContents(input);
    history.push({
      type: "human",
      options: {},
      content: input,
      files
    });
    
    const normalized = normalizeChatHistory(history);
    
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: normalized,
      config: {
        ...createGenerateConfig(generationConfig ?? {}),
        ...opts
      },
    });
    
    let normalizedRes = normalizeChatResponse(response)
    history.push({
      type: "model",
      options: {},
      content: normalizedRes,
    });
    
    return normalizedRes;
  }
}