export interface ArtiusModelWrapperInput {
  prompt: string,
  images?: string[]
}

export interface ArtiusModelResponse {
  original?: any,
  text: string
}

export interface ArtiusModelGenerationConfig {
  maxOutputTokens ? : number
  temperature ? : number
  topK ? : number
  topP ? : number
}