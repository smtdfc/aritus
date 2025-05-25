import {
  ArtiusToolDeclaration,
  ArtiusToolParameters,
  ArtiusToolCallback,
  ArtiusToolCall,
  ArtiusToolMap,
  ArtiusToolResult,
} from '../types/index.js';

import { ArtiusToolError } from '../errors/index.js';

export function execTool(
  calls: ArtiusToolCall[],
  map: ArtiusToolMap
): ArtiusToolResult {
  let result: ArtiusToolResult = [];
  for (let call of calls) {
    if (!map[call.name]) {
      throw new ArtiusToolError(`Tool not found: ${call.name} !`);
    }

    result.push({
      name: call.name,
      result: map[call.name].callback(call.args),
      info: call,
    });
  }

  return result;
}

export function createTool<T>(
  name: string,
  description: string,
  parameters: ArtiusToolParameters,
  callback: ArtiusToolCallback<T>
): ArtiusToolDeclaration {
  return {
    name,
    description,
    parameters,
    callback,
  };
}
