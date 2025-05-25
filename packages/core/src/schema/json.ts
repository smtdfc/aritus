import {
  ZodTypeAny,
  ZodObject,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodArray,
  ZodOptional,
  ZodNullable,
  ZodLiteral,
  ZodEnum,
  ZodUnion,
  ZodType,
} from 'zod';
import { ArtiusSchema } from '../types/index.js';

function zodToJsonSchema(zodSchema: ZodTypeAny): any {
  if (zodSchema instanceof ZodString) {
    const def = zodSchema._def;
    const json: any = { type: 'string' };
    if (def.checks) {
      for (const check of def.checks) {
        if (check.kind === 'min') json.minLength = check.value;
        if (check.kind === 'max') json.maxLength = check.value;
        if (check.kind === 'email') json.format = 'email';
      }
    }
    return json;
  }

  if (zodSchema instanceof ZodNumber) {
    const def = zodSchema._def;
    const json: any = { type: 'number' };
    if (def.checks) {
      for (const check of def.checks) {
        if (check.kind === 'min') json.minimum = check.value;
        if (check.kind === 'max') json.maximum = check.value;
        if (check.kind === 'int') json.type = 'integer';
      }
    }
    return json;
  }

  if (zodSchema instanceof ZodBoolean) return { type: 'boolean' };
  if (zodSchema instanceof ZodLiteral) return { const: zodSchema._def.value };
  if (zodSchema instanceof ZodEnum)
    return { type: 'string', enum: zodSchema._def.values };
  if (zodSchema instanceof ZodArray)
    return { type: 'array', items: zodToJsonSchema(zodSchema._def.type) };
  if (zodSchema instanceof ZodObject) {
    const shape = zodSchema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const key in shape) {
      const prop = shape[key];
      properties[key] = zodToJsonSchema(prop);
      if (!(prop instanceof ZodOptional || prop instanceof ZodNullable))
        required.push(key);
    }
    return {
      type: 'object',
      properties,
      required: required.length ? required : undefined,
    };
  }
  if (zodSchema instanceof ZodOptional)
    return zodToJsonSchema(zodSchema._def.innerType);
  if (zodSchema instanceof ZodNullable)
    return {
      anyOf: [zodToJsonSchema(zodSchema._def.innerType), { type: 'null' }],
    };
  if (zodSchema instanceof ZodUnion)
    return {
      anyOf: zodSchema._def.options.map((opt: ZodTypeAny) =>
        zodToJsonSchema(opt)
      ),
    };
  return {};
}

export function covertSchemaToJson<T extends ZodTypeAny>(
  schema: ArtiusSchema<T>
): any {
  return {
    title: schema.name,
    ...zodToJsonSchema(schema.zodSchema),
  };
}
