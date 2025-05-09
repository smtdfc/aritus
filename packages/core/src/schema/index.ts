import { z, ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ArtiusSchemaPack } from '../types/index.js';

export const zod = z;
export function defineSchema < T extends ZodTypeAny > (schema: T): ArtiusSchemaPack {
  return {
    zod: schema,
    json: zodToJsonSchema(schema),
  };
}


