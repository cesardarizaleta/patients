import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Patients } from './components/patients/patients';
import { UiModal } from './components/ui-modal/ui-modal';
import { UiToast } from './components/ui-toast/ui-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Patients, UiModal, UiToast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('patients');
}
