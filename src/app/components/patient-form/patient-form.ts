import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patient } from '../../models/patient';
import { PatientService } from '../../services/patient';
import { ModalService } from '../../services/modal';
import { ToastService } from '../../services/toast';
import { UiIcon } from '../ui-icon/ui-icon';

@Component({
  selector: 'app-patient-form',
  imports: [ReactiveFormsModule, UiIcon],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css',
})
export class PatientForm implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

  patient = input<Patient | null>(null);
  saved = output<Patient>();
  cancelled = output();

  form: FormGroup;
  loading = signal(false);

  constructor() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: ['', Validators.required],
      address: [''],
    });
  }

  ngOnInit(): void {
    const patient = this.patient();
    if (patient) {
      this.form.patchValue({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth.toISOString().split('T')[0], // For date input
        address: patient.address || '',
      });
    } else {
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    try {
      const formValue = this.form.value;
      const patientData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone || undefined,
        dateOfBirth: new Date(formValue.dateOfBirth),
        address: formValue.address || undefined,
      };

      let savedPatient: Patient;
      if (this.patient()) {
        savedPatient = (await this.patientService.updatePatient(
          this.patient()!.id!,
          patientData,
        )) as Patient;
      } else {
        savedPatient = await this.patientService.createPatient(patientData);
      }

      this.saved.emit(savedPatient);
      this.toast.push('Patient saved', 'success');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      if (error.message && error.message.includes('UNIQUE constraint failed: patients.email')) {
        await this.modal.alert(
          'Duplicate email',
          'A patient with this email already exists. Please use a different email.',
        );
        this.toast.push('Duplicate email', 'error');
      } else {
        await this.modal.alert('Save error', 'Error saving patient. Please try again.');
        this.toast.push('Save failed', 'error');
      }
    } finally {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
