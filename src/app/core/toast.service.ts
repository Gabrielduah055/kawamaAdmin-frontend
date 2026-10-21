import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  readonly id: number;
  readonly tone: 'success' | 'error' | 'info';
  readonly text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly state = signal<readonly ToastMessage[]>([]);
  readonly messages = this.state.asReadonly();

  success(text: string): void {
    this.add('success', text);
  }

  error(text: string): void {
    this.add('error', text);
  }

  info(text: string): void {
    this.add('info', text);
  }

  dismiss(id: number): void {
    this.state.update((messages) => messages.filter((message) => message.id !== id));
  }

  private add(tone: ToastMessage['tone'], text: string): void {
    const message = { id: this.nextId++, tone, text } as const;
    this.state.update((messages) => [...messages, message]);
    window.setTimeout(() => this.dismiss(message.id), 4500);
  }
}
