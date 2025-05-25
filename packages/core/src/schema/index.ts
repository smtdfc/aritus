import { z, ZodTypeAny } from 'zod';
import { ArtiusSchema } from '../types/index.js';

export * from './json.js';
export const zod = z;

export function createSchema<T extends ZodTypeAny>(
  name: string,
  schema: T
): ArtiusSchema<T> {
  return {
    name,
    zodSchema: schema,
  };
}
