import { Injectable, signal } from '@angular/core';

export type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private list = signal<Toast[]>([]);
  private id = 1;

  toasts$ = this.list;

  push(message: string, type: Toast['type'] = 'info', timeout = 3500) {
    const toast: Toast = { id: this.id++, message, type };
    this.list.update((t) => [...t, toast]);
    if (timeout > 0) setTimeout(() => this.remove(toast.id), timeout);
  }

  remove(id: number) {
    this.list.update((t) => t.filter((x) => x.id !== id));
  }
}
