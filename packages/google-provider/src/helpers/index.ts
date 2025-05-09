import { 
  ArtiusChatHistory,
  ArtiusModelResponse,
  ArtiusModelGenerationConfig,
  ArtiusModelGenerationOptions,
  ArtiusSchemaPack,
} from 'artius';

import { 
  GoogleGenAI, 
  GenerateContentConfig,
  createPartFromUri, 
  createUserContent,
  createModelContent,
} from '@google/genai';

function jsonSchemaToVertexSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return {};
  
  if (schema.oneOf) {
    return {
      oneOf: schema.oneOf.map(jsonSchemaToVertexSchema)
    };
  }
  
  if (schema.anyOf) {
    return {
      anyOf: schema.anyOf.map(jsonSchemaToVertexSchema)
    };
  }
  
  if (schema.allOf) {
    return {
      allOf: schema.allOf.map(jsonSchemaToVertexSchema)
    };
  }
  
  if (schema.enum) {
    return {
      type: 'string',
      enum: schema.enum
    };
  }
  
  switch (schema.type) {
    case 'object': {
      const properties: Record < string, any > = {};
      const required: string[] = schema.required || [];
      
      for (const key in schema.properties) {
        properties[key] = jsonSchemaToVertexSchema(schema.properties[key]);
        if (!required.includes(key)) {
          properties[key].optional = true;
        }
      }
      
      return {
        type: 'object',
        properties
      };
    }
    
    case 'array':
      return {
        type: 'array',
          items: jsonSchemaToVertexSchema(schema.items),
          minItems: schema.minItems?.toString(),
          maxItems: schema.maxItems?.toString(),
      };
      
    case 'string':
      return {
        type: 'string',
          minLength: schema.minLength?.toString(),
          maxLength: schema.maxLength?.toString(),
          format: schema.format,
          pattern: schema.pattern,
      };
      
    case 'number':
    case 'integer':
      return {
        type: schema.type,
          minimum: schema.minimum?.toString(),
          maximum: schema.maximum?.toString(),
          multipleOf: schema.multipleOf?.toString(),
      };
      
    case 'boolean':
      return { type: 'boolean' };
      
    case 'null':
      return { type: 'null' };
      
    case undefined:
      if (schema.const !== undefined) {
        return { const: schema.const };
      }
      return { type: 'any' };
      
    default:
      return { type: schema.type };
  }
}

export function normalizeChatHistory(history: ArtiusChatHistory): any[] {
  return history.map(chatData => {
    if (chatData.type === "human") {
      const fileData = (chatData.files || []).map(file => (createPartFromUri(file.uri, file.mimeType)));
      return createUserContent([
        chatData.content.prompt,
        ...fileData
      ]);
    };
    
    if (chatData.type === "model") {
      const fileData = (chatData.files || []).map(file => (createPartFromUri(file.uri, file.mimeType)));
      return createModelContent([
        chatData.content.text,
        ...fileData
      ]);
    };
  }).filter(Boolean);
}

export function normalizeChatResponse(response: any): ArtiusModelResponse {
  return {
    original: response,
    text: response?.text ?? ""
  };
}

export function createGenerateConfig(
  config: Partial < ArtiusModelGenerationConfig >
  
): GenerateContentConfig {
  return {
    maxOutputTokens: config.maxOutputTokens ?? 1024,
    temperature: config.temperature ?? 0.7,
    topP: config.topP ?? 1.0,
    topK: config.topK ?? 40,
  };
}

export function createGenerateOptions(
  config: Partial <ArtiusModelGenerationOptions>
): GenerateContentConfig {
  
  return {
    responseMimeType: config.schemaGenertion ? "application/json" : "text",
    responseSchema:config.schema ? jsonSchemaToVertexSchema(config.schema.json) : {}
  };
}

