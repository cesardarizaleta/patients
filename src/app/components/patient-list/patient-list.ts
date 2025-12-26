import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient';
import { ModalService } from '../../services/modal';
import { UiIcon } from '../ui-icon/ui-icon';

@Component({
  selector: 'app-patient-list',
  imports: [DatePipe, UiIcon],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css',
})
export class PatientList implements OnInit {
  private patientService = inject(PatientService);
  private modal = inject(ModalService);

  patients = signal<Patient[]>([]);
  loading = signal(false);

  reloadTrigger = input<number>(0);

  addPatient = output();
  editPatient = output<Patient>();

  constructor() {
    effect(() => {
      this.reloadTrigger(); // Trigger reload
      this.loadPatients();
    });
  }

  async ngOnInit(): Promise<void> {
    // Initial load is handled by effect
  }

  async loadPatients(): Promise<void> {
    this.loading.set(true);
    try {
      const patients = await this.patientService.getAllPatients();
      this.patients.set(patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async deletePatient(id: number): Promise<void> {
    try {
      const ok = await this.modal.confirm(
        'Delete patient',
        'Are you sure you want to delete this patient?',
      );
      if (!ok) return;
      await this.patientService.deletePatient(id);
      await this.loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      await this.modal.alert('Error', 'Could not delete patient');
    }
  }

  onAddPatient(): void {
    this.addPatient.emit();
  }

  onEditPatient(patient: Patient): void {
    this.editPatient.emit(patient);
  }
}
