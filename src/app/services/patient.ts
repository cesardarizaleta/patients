import { Injectable, inject } from '@angular/core';
import { Patient } from '../models/patient';
import { DatabaseService } from './database';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private dbService = inject(DatabaseService);

  async getAllPatients(): Promise<Patient[]> {
    const db = this.dbService.getDb();
    if (!db) throw new Error('Database not initialized');

    const result = db.exec('SELECT * FROM patients ORDER BY createdAt DESC');
    if (result.length === 0) return [];

    const rows = result[0].values;
    return rows.map((row: any[]) => ({
      id: row[0] as number,
      firstName: row[1] as string,
      lastName: row[2] as string,
      email: row[3] as string,
      phone: row[4] as string,
      dateOfBirth: new Date(row[5] as string),
      address: row[6] as string,
      createdAt: new Date(row[7] as string),
      updatedAt: new Date(row[8] as string),
    }));
  }

  async getPatientById(id: number): Promise<Patient | null> {
    const db = this.dbService.getDb();
    if (!db) throw new Error('Database not initialized');

    const numericId = Number(id);
    const result = db.exec('SELECT * FROM patients WHERE id = ?', [numericId]);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const row = result[0].values[0] as any[];
    return {
      id: row[0] as number,
      firstName: row[1] as string,
      lastName: row[2] as string,
      email: row[3] as string,
      phone: row[4] as string,
      dateOfBirth: new Date(row[5] as string),
      address: row[6] as string,
      createdAt: new Date(row[7] as string),
      updatedAt: new Date(row[8] as string),
    };
  }

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const db = this.dbService.getDb();
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    db.run(
      'INSERT INTO patients (firstName, lastName, email, phone, dateOfBirth, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        patient.firstName,
        patient.lastName,
        patient.email,
        patient.phone || null,
        patient.dateOfBirth.toISOString(),
        patient.address || null,
        now,
        now,
      ],
    );

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0] as number;

    const newPatient = {
      ...patient,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    await this.dbService.persist();
    return newPatient;
  }

  async updatePatient(
    id: number,
    patient: Partial<Omit<Patient, 'id' | 'createdAt'>>,
  ): Promise<Patient | null> {
    const db = this.dbService.getDb();
    if (!db) throw new Error('Database not initialized');

    const existing = await this.getPatientById(id);
    if (!existing) return null;

    const updated = { ...existing, ...patient, updatedAt: new Date() };
    db.run(
      'UPDATE patients SET firstName = ?, lastName = ?, email = ?, phone = ?, dateOfBirth = ?, address = ?, updatedAt = ? WHERE id = ?',
      [
        updated.firstName,
        updated.lastName,
        updated.email,
        updated.phone || null,
        updated.dateOfBirth.toISOString(),
        updated.address || null,
        updated.updatedAt.toISOString(),
        id,
      ],
    );

    await this.dbService.persist();
    return updated;
  }

  async deletePatient(id: number): Promise<boolean> {
    const db = this.dbService.getDb();
    if (!db) throw new Error('Database not initialized');

    // Convertir ID a número para asegurar el tipo correcto
    const numericId = Number(id);

    // Verificar que el paciente existe ANTES de eliminar
    const checkResult = db.exec('SELECT id FROM patients WHERE id = ? LIMIT 1', [numericId]);
    const existsBefore = checkResult.length > 0 && checkResult[0].values.length > 0;

    if (!existsBefore) {
      return false;
    }

    // Ejecutar la eliminación
    db.run('DELETE FROM patients WHERE id = ?', [numericId]);

    // Verificar que el paciente ya NO existe DESPUÉS de eliminar
    const verifyResult = db.exec('SELECT id FROM patients WHERE id = ? LIMIT 1', [numericId]);
    const existsAfter = verifyResult.length > 0 && verifyResult[0].values.length > 0;

    const deleted = !existsAfter;

    if (deleted) {
      // Persistir cambios
      await this.dbService.persist();
      return true;
    }

    return false;
  }
}
