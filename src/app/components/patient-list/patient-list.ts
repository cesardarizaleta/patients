import { Component, effect, inject, input, OnInit, output, signal, computed } from '@angular/core';
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
  searchTerm = signal('');

  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.patients();
    return this.patients().filter(patient => {
      return Object.values(patient).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (value instanceof Date) {
          return value.toLocaleDateString().toLowerCase().includes(term);
        }
        return false;
      });
    });
  });

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
      if (!id || isNaN(id) || id <= 0) {
        await this.modal.alert('Error', 'ID de paciente inválido');
        return;
      }

      const ok = await this.modal.confirm(
        'Eliminar paciente',
        '¿Está seguro de que desea eliminar este paciente?',
      );
      if (!ok) return;

      // Verificar que el paciente existe antes de intentar eliminarlo
      const existingPatient = await this.patientService.getPatientById(id);
      if (!existingPatient) {
        await this.modal.alert('Error', 'El paciente no existe o ya fue eliminado');
        await this.loadPatients(); // Recargar la lista por si acaso
        return;
      }

      const deleted = await this.patientService.deletePatient(id);
      if (deleted) {
        // Pequeño delay para asegurar que la persistencia se complete
        await new Promise(resolve => setTimeout(resolve, 100));
        await this.loadPatients();
        // Mostrar mensaje de éxito
        await this.modal.alert('Éxito', 'Paciente eliminado correctamente');
      } else {
        await this.modal.alert('Error', 'No se pudo eliminar el paciente de la base de datos');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      await this.modal.alert('Error', 'No se pudo eliminar el paciente');
    }
  }

  onAddPatient(): void {
    this.addPatient.emit();
  }

  onEditPatient(patient: Patient): void {
    this.editPatient.emit(patient);
  }
}
