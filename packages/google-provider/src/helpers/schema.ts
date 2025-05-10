export function parseSchema(data: string): any {
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function jsonSchemaToVertexSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return {};

  if (schema.oneOf) return { oneOf: schema.oneOf.map(jsonSchemaToVertexSchema) };
  if (schema.anyOf) return { anyOf: schema.anyOf.map(jsonSchemaToVertexSchema) };
  if (schema.allOf) return { allOf: schema.allOf.map(jsonSchemaToVertexSchema) };
  if (schema.enum) return { type: 'string', enum: schema.enum };

  switch (schema.type) {
    case 'object': {
      const props: Record<string, any> = {};
      const required = schema.required || [];
      for (const key in schema.properties) {
        props[key] = jsonSchemaToVertexSchema(schema.properties[key]);
        if (!required.includes(key)) props[key].optional = true;
      }
      return { type: 'object', properties: props };
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
    case 'boolean': return { type: 'boolean' };
    case 'null': return { type: 'null' };
    case undefined:
      if (schema.const !== undefined) return { const: schema.const };
      return { type: 'any' };
    default: return { type: schema.type };
  }
}