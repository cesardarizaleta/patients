import { Component, input } from '@angular/core';
import {
  LucideAngularModule,
  Edit,
  Plus,
  Download,
  Upload,
  Phone,
  Calendar,
  Trash2,
  X,
  Save,
} from 'lucide-angular';

@Component({
  selector: 'app-ui-icon',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './ui-icon.html',
  styleUrl: './ui-icon.css',
})
export class UiIcon {
  name = input.required<string>();
  size = input<string | number>(16);
  class = input<string>('');

  // Map of icon names to their imports
  icons = {
    Edit,
    Plus,
    Download,
    Upload,
    Phone,
    Calendar,
    Trash2,
    X,
    Save,
  };

  getIcon() {
    return this.icons[this.name() as keyof typeof this.icons] || Edit;
  }
}
