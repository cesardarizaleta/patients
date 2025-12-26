import { Injectable, signal, ComponentRef, Type } from '@angular/core';

type ModalState = {
  open: boolean;
  title?: string;
  message?: string;
  type?: 'alert' | 'confirm' | 'custom';
  component?: Type<any>;
  componentInputs?: Record<string, any>;
  componentOutputs?: Record<string, any>;
};

@Injectable({ providedIn: 'root' })
export class ModalService {
  private state = signal<ModalState>({ open: false });
  // internal resolver for the current modal promise
  private resolver: ((value: any) => void) | null = null;

  state$ = this.state;

  alert(title: string, message?: string): Promise<void> {
    this.state.set({ open: true, title, message, type: 'alert' });
    return new Promise((resolve) => {
      this.resolver = () => {
        resolve();
        this.resolver = null;
      };
    });
  }

  confirm(title: string, message?: string): Promise<boolean> {
    this.state.set({ open: true, title, message, type: 'confirm' });
    return new Promise((resolve) => {
      this.resolver = (v: boolean) => {
        resolve(!!v);
        this.resolver = null;
      };
    });
  }

  openCustom<T>(
    component: Type<T>,
    inputs?: Record<string, any>,
    outputs?: Record<string, any>,
  ): Promise<any> {
    this.state.set({
      open: true,
      type: 'custom',
      component,
      componentInputs: inputs,
      componentOutputs: outputs,
    });
    return new Promise((resolve) => {
      this.resolver = (result: any) => {
        resolve(result);
        this.resolver = null;
      };
    });
  }

  close(result?: any) {
    const r = this.resolver;
    this.state.set({ open: false });
    if (r) r(result);
  }
}
