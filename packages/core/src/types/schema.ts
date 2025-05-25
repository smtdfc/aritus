import { z, ZodTypeAny } from 'zod';

export interface ArtiusSchema<T extends ZodTypeAny> {
  name: string;
  zodSchema: T;
}
