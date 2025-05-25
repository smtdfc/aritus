import type { Artius } from './base.js';
import {
  ArtiusChatHistory,
  ArtiusChatMessage,
  ArtiusInput,
  ArtiusModelResponse,
  ArtiusChatRole,
} from './types/index.js';

export class ArtiusChat {
  public history: ArtiusChatHistory;

  constructor(public base: Artius) {
    this.history = [];
  }

  addMessgae(message: ArtiusChatMessage): void {
    this.history.push(message);
  }

  async send(input: ArtiusInput): Promise<ArtiusModelResponse> {
    return this.base.provider.generateFromHistory(
      this.history,
      input,
      this.base.tools
    );
  }

  clearHistory(): void {
    this.history = [];
  }

  getLastMessage(): ArtiusChatMessage | undefined {
    return this.history.at(-1);
  }

  getHistory(): ArtiusChatHistory {
    return this.history;
  }

  getHistoryByRole(role: ArtiusChatRole): ArtiusChatMessage[] {
    return this.history.filter((msg) => msg.role === role);
  }

  updateLastMessage(content: ArtiusInput | ArtiusModelResponse): void {
    if (this.history.length === 0) return;
    this.history[this.history.length - 1].content = content;
  }

  removeLastMessage(): void {
    this.history.pop();
  }

  countMessages(): number {
    return this.history.length;
  }

  reset(input?: ArtiusInput): void {
    this.clearHistory();
    if (input) {
      this.addMessgae(ArtiusChat.createMessage('user', input));
    }
  }

  static createMessage(
    role: ArtiusChatRole,
    content: ArtiusInput | ArtiusModelResponse
  ): ArtiusChatMessage {
    return {
      id: Date.now().toString(32),
      time: Date.now().toString(),
      role,
      content,
    };
  }
}
