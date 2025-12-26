import { Component, signal, inject } from '@angular/core';
import { Patient } from '../../models/patient';
import { PatientList } from '../patient-list/patient-list';
import { PatientForm } from '../patient-form/patient-form';
import { DatabaseService } from '../../services/database';
import { PatientService } from '../../services/patient';
import { ToastService } from '../../services/toast';
import { ModalService } from '../../services/modal';
import { UiIcon } from '../ui-icon/ui-icon';
import { ExportService } from '../../services/export';

@Component({
  selector: 'app-patients',
  imports: [PatientList, UiIcon],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  reloadTrigger = signal(0);

  private dbService = inject(DatabaseService);
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  private exporter = inject(ExportService);
  private patientService = inject(PatientService);

  // export format state
  exportFormat: 'excel' | 'csv' | 'pdf' | 'sqlite' = 'excel';

  onAddPatient(): void {
    this.modal.openCustom(
      PatientForm,
      {},
      {
        saved: (patient: Patient) => {
          this.modal.close();
          this.reloadTrigger.update((v) => v + 1);
          this.toast.push('Paciente creado exitosamente', 'success');
        },
        cancelled: () => {
          this.modal.close();
        },
      },
    );
  }

  onEditPatient(patient: Patient): void {
    this.modal.openCustom(
      PatientForm,
      { patient },
      {
        saved: (savedPatient: Patient) => {
          this.modal.close();
          this.reloadTrigger.update((v) => v + 1);
          this.toast.push('Paciente actualizado exitosamente', 'success');
        },
        cancelled: () => {
          this.modal.close();
        },
      },
    );
  }

  onExportSelect(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    if (val === 'excel' || val === 'csv' || val === 'pdf' || val === 'sqlite') {
      this.exportFormat = val;
    }
  }

  async triggerExport(): Promise<void> {
    try {
      if (this.exportFormat === 'sqlite') {
        const data = this.dbService.exportDatabase();
        if (!data) {
          this.toast.push('No hay base de datos para exportar', 'error');
          return;
        }
        // create blob and download
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const blob = new Blob([arrayBuffer as ArrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patients-${new Date().toISOString().slice(0, 10)}.sqlite`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.toast.push('Base de datos exportada', 'success');
        return;
      }

      // fetch data
  const patients = await this.patientService.getAllPatients();
      if (!patients || patients.length === 0) {
        this.toast.push('No hay pacientes para exportar', 'error');
        return;
      }

      if (this.exportFormat === 'excel') {
        await this.exporter.exportExcel(patients);
        this.toast.push('Excel exportado', 'success');
      } else if (this.exportFormat === 'csv') {
        await this.exporter.exportCsv(patients);
        this.toast.push('CSV exportado', 'success');
      } else if (this.exportFormat === 'pdf') {
        await this.exporter.exportPdf(patients);
        this.toast.push('PDF exportado', 'success');
      }
    } catch (err) {
      console.error('Export error', err);
      this.toast.push('Exportación fallida', 'error');
    }
  }

  async exportDatabase(): Promise<void> {
    try {
      const data = this.dbService.exportDatabase();
      if (!data) {
        this.toast.push('No hay base de datos para exportar', 'error');
        return;
      }

      // Normalize to a plain ArrayBuffer slice to satisfy strict typing
      const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      const blob = new Blob([arrayBuffer as ArrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'patients.sqlite';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.toast.push('Base de datos exportada', 'success');
    } catch (err) {
      console.error('Export error', err);
      this.toast.push('Exportación fallida', 'error');
    }
  }

  async onImportFile(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    try {
      const buf = await file.arrayBuffer();
      await this.dbService.importDatabase(new Uint8Array(buf));
      this.toast.push('Base de datos importada', 'success');
      // refresh lists
      this.reloadTrigger.update((v) => v + 1);
    } catch (err) {
      console.error('Import error', err);
      this.toast.push('Importación fallida', 'error');
    } finally {
      // clear input so same file can be re-selected
      input.value = '';
    }
  }
}
