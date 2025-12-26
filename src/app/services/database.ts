import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db?: any;
  private SQL?: any;

  async init(): Promise<void> {
    if (!this.db) {
      // @ts-ignore
      this.SQL = await window.initSqlJs({
        locateFile: (file: string) => `/${file}`,
      });

      const dbData = await this.loadFromIndexedDB();
      if (dbData) {
        this.db = new this.SQL.Database(dbData);
      } else {
        this.db = new this.SQL.Database();
        this.createTables();
      }
    }
  }

  private createTables(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        dateOfBirth TEXT NOT NULL,
        address TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Crear índices para optimización
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_patients_createdAt ON patients(createdAt)`);

    this.saveToIndexedDB();
  }

  getDb(): any {
    return this.db;
  }

  async saveToIndexedDB(): Promise<void> {
    if (!this.db) return;

    const data = this.db.export();
    const request = indexedDB.open('PatientsDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sqlite')) {
        db.createObjectStore('sqlite');
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(['sqlite'], 'readwrite');
      const store = transaction.objectStore('sqlite');
      store.put(data, 'patients.sqlite');
    };
  }

  private async loadFromIndexedDB(): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('PatientsDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sqlite')) {
          db.createObjectStore('sqlite');
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['sqlite'], 'readonly');
        const store = transaction.objectStore('sqlite');
        const getRequest = store.get('patients.sqlite');

        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };

        getRequest.onerror = () => {
          resolve(null);
        };
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  close(): void {
    if (this.db) {
      this.saveToIndexedDB();
      this.db.close();
      this.db = undefined;
    }
  }

  // Método para guardar después de operaciones
  async persist(): Promise<void> {
    await this.saveToIndexedDB();
  }

  // Export the current database as a Uint8Array (for download)
  exportDatabase(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  // Import a database from Uint8Array and persist it
  async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.SQL) {
      // @ts-ignore
      this.SQL = await window.initSqlJs({ locateFile: (file: string) => `/${file}` });
    }

    this.db = new this.SQL.Database(data);
    // Ensure tables/indexes exist if import is from an older format
    this.createTables();
    await this.saveToIndexedDB();
  }
}
