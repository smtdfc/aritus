import { ArtiusSchema } from './schema.js';
import { ArtiusToolResult } from './tool.js';

import { ZodTypeAny } from 'zod';

export type ArtiusSupportedMimeTypes =
  | 'text/plain'
  | 'application/pdf'
  | 'image/png'
  | 'image/jpeg';

export interface ArtiusInput {
  prompt: string;
  files?: string[];
  images?: string[];
  responseWithSchema?: boolean;
  responseSchema?: ArtiusSchema<ZodTypeAny> | undefined;
  toolCallResult?: ArtiusToolResult;
}
