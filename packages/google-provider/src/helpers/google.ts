import { createUserContent, createPartFromUri } from '@google/genai';
import { ArtiusInput, ArtiusToolCall, ArtiusModelResponse } from 'artius';

export async function prepareImage(client: any, filePath: string) {
  return client.files.upload({ file: filePath });
}

export async function createContent(client: any, input: ArtiusInput) {
  if (input.toolCallResult) {
    return createUserContent(
      input.toolCallResult.map(({ name, result }) => ({
        functionResponse: {
          name,
          response: { result },
        },
      }))
    );
  }

  if (!input.files && !input.images) {
    return createUserContent([input.prompt]);
  }

  const parts = [];
  for (const img of input.images || []) {
    const meta = await prepareImage(client, img);
    parts.push(createPartFromUri(meta.uri, meta.mimeType));
  }

  return createUserContent([input.prompt, ...parts]);
}

export function normalizeToolCall(toolCalls: any[]): ArtiusToolCall[] {
  return toolCalls.map((t) => ({
    id: Date.now().toString(16),
    name: t.name,
    args: t.args,
  }));
}

export function normalizeModelMessage(response: ArtiusModelResponse) {
  return {
    role: 'model',
    parts: response.toolCalls?.length
      ? response.toolCalls.map((call) => ({
          functionCall: {
            name: call.name,
            args: call.args,
          },
        }))
      : [{ text: response.text }],
  };
}
