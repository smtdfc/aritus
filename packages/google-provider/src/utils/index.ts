import { covertSchemaToJson } from 'artius';
import type { ArtiusInput, ArtiusToolMap } from 'artius';

export function normalizeToolConfig(tools: ArtiusToolMap) {
  return {
    tools: [
      {
        functionDeclarations: Object.values(tools).map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: covertSchemaToJson(tool.parameters),
        })),
      },
    ],
  };
}

export function normalizeGenConfig(
  input: ArtiusInput,
  config: any,
  tools?: ArtiusToolMap
) {
  const toolConfig = tools ? normalizeToolConfig(tools) : {};

  const schemaConfig = input.responseWithSchema
    ? {
        responseMimeType: 'application/json',
        responseSchema: covertSchemaToJson(input.responseSchema!),
      }
    : {};

  return {
    maxOutputTokens: config?.generation?.maxOutputTokens,
    topK: config?.generation?.topK,
    topP: config?.generation?.topP,
    temperature: config?.generation?.temperature,
    systemInstruction: config?.systemInstruction,
    ...toolConfig,
    ...schemaConfig,
  };
}
