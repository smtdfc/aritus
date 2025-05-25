import { ArtiusSchema } from './schema.js';
import { ZodTypeAny } from 'zod';

export type ArtiusToolParameters = ArtiusSchema<ZodTypeAny>;
export type ArtiusToolCallback<T> = (...args: any[]) => Promise<T> | T;

export interface ArtiusToolDeclaration<T = any> {
  name: string;
  description: string;
  parameters: ArtiusToolParameters;
  callback: ArtiusToolCallback<T>;
}

export type ArtiusToolMap = Record<string, ArtiusToolDeclaration<any>>;

export interface ArtiusToolCall {
  id: string;
  name: string;
  args: any;
}

export type ArtiusToolResult = Array<{
  name: string;
  result: any;
  info: ArtiusToolCall;
}>;
