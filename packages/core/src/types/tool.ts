export interface ArtiusToolDecaration {
  name: string,
  description: string,
  parametersSchema:object ,
  callback: (...args: any[]) => any | void
}

export type ArtiusToolMap = Record<string,ArtiusToolDecaration>;