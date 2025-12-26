import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-toast.html',
  styleUrls: ['./ui-toast.css'],
})
export class UiToast {
  private toast = inject(ToastService);
  toasts = this.toast.toasts$;

  dismiss(id: number) {
    this.toast.remove(id);
  }
}
