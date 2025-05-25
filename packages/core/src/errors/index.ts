export class ArtiusProviderError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ArtiusProviderError';
  }
}

export class ArtiusGenerationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ArtiusGenerationError';
  }
}

export class ArtiusToolError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ArtiusToolError';
  }
}
