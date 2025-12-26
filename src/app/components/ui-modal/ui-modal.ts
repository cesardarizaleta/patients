import {
  Component,
  inject,
  ComponentRef,
  ViewContainerRef,
  OnDestroy,
  effect,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ApplicationRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-modal.html',
  styleUrls: ['./ui-modal.css'],
})
export class UiModal implements OnDestroy, AfterViewInit {
  private modal = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  private cfr = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  state = this.modal.state$;
  componentRef: ComponentRef<any> | null = null;
  private viewInitialized = false;

  @ViewChild('customContent', { read: ViewContainerRef, static: false }) customContent!: ViewContainerRef;

  constructor(private vcr: ViewContainerRef) {
    effect(() => {
      const state = this.state();
      if (state.open && state.type === 'custom' && state.component && !this.componentRef) {
        // Wait a tick for DOM update then create the component
        setTimeout(() => this.createComponent(state), 0);
      } else if (!state.open && this.componentRef) {
        this.destroyComponent();
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
  }

  ngOnDestroy(): void {
    this.destroyComponent();
  }

  private createComponent(state: any): void {
    if (!state.component || !this.customContent) {
      return;
    }

    this.customContent.clear();

    try {
      const factory = this.cfr.resolveComponentFactory(state.component);
      this.componentRef = factory.create(this.customContent.injector);
      if (!this.componentRef) return;

      // Insert the component's host view into the container. Do not attach twice.
      this.customContent.insert(this.componentRef.hostView);

      // Set inputs
      if (state.componentInputs) {
        Object.keys(state.componentInputs).forEach((key) => {
          this.componentRef!.setInput(key, state.componentInputs[key]);
        });
      }

      // Set outputs - connect component outputs to modal service
      if (state.componentOutputs && this.componentRef?.instance) {
        Object.keys(state.componentOutputs).forEach((key) => {
          if (this.componentRef!.instance[key]) {
            this.componentRef!.instance[key].subscribe((value: any) => {
              state.componentOutputs[key](value);
            });
          }
        });
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error creating component:', error);
    }
  }

  private destroyComponent(): void {
    if (this.componentRef) {
      try {
        // Clear any views inserted into the container first
        if (this.customContent) this.customContent.clear();
      } catch (e) {
        // ignore - customContent may be undefined during destroy
      }
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  onOk() {
    this.modal.close(true);
  }

  onCancel() {
    this.modal.close(false);
  }
}
