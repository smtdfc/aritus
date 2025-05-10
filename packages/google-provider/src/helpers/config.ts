import {
  GenerateContentConfig,
  FunctionCallingConfigMode
} from '@google/genai';
import {
  ArtiusModelGenerationConfig,
  ArtiusModelGenerationOptions,
  ArtiusToolMap
} from 'artius';
import { jsonSchemaToVertexSchema } from './schema';

export function createGenerateConfig(config: Partial < ArtiusModelGenerationConfig > ): GenerateContentConfig {
  return {
    maxOutputTokens: config.maxOutputTokens ?? 1024,
    temperature: config.temperature ?? 0.7,
    topP: config.topP ?? 1.0,
    topK: config.topK ?? 40,
    systemInstruction: config.systemInstruction ?? ""
  };
}

export function createToolConfig(tools: ArtiusToolMap): GenerateContentConfig {
  const functionDeclarations = Object.values(tools).map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: jsonSchemaToVertexSchema(tool.parametersSchema)
  }));
  
  return {
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO }
    },
    tools: [{ functionDeclarations }]
  };
}

export function createGenerateOptions(config: Partial < ArtiusModelGenerationOptions > ): GenerateContentConfig {
  return {
    responseMimeType: config.schemaGenertion ? "application/json" : "text",
    responseSchema: config.schema ? jsonSchemaToVertexSchema(config.schema.json) : {}
  };
}
