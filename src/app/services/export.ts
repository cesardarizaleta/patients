import { Injectable, inject } from '@angular/core';
import { Patient } from '../models/patient';

@Injectable({ providedIn: 'root' })
export class ExportService {
  // Helper: download a blob
  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Format date for human readable
  private fmt(d?: Date) {
    if (!d) return '';
    return d.toISOString().split('T')[0];
  }

  async exportExcel(patients: Patient[]): Promise<void> {
    // dynamic import so package is optional during dev; ensure exceljs & file-saver installed
    const ExcelJS = await import('exceljs');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Patients App';
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Patients', { views: [{ state: 'frozen', ySplit: 1 }] });

    // Define columns
    ws.columns = [
      { header: 'ID', key: 'id', width: 6 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    // Add rows
    patients.forEach((p) => {
      ws.addRow({
        id: p.id ?? '',
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone || '',
        dateOfBirth: this.fmt(p.dateOfBirth),
        address: p.address || '',
        createdAt: this.fmt(p.createdAt),
        updatedAt: this.fmt(p.updatedAt),
      });
    });

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell: any) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }, // blue-ish
      } as any;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } } as any;
      cell.alignment = { vertical: 'middle', horizontal: 'center' } as any;
    });

    // Add table style
    // ExcelJS expects rows including header for table
    const totalRows = patients.length + 1;
    ws.addTable({
      name: 'PatientsTable',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: ws.columns!.map((c: any) => ({ name: c.header as string })),
      rows: (ws.getRows(2, patients.length) || []).map((r: any) => r.values!.slice(1)),
    } as any);

    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadBlob(blob, `patients-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async exportCsv(patients: Patient[]): Promise<void> {
    const header = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Address', 'Created At', 'Updated At'];
    const rows = patients.map((p) => [
      p.id ?? '',
      p.firstName,
      p.lastName,
      p.email,
      p.phone || '',
      this.fmt(p.dateOfBirth),
      p.address || '',
      this.fmt(p.createdAt),
      this.fmt(p.updatedAt),
    ]);

    const csv = [header, ...rows].map((r) => r.map((c) => {
      if (typeof c === 'string' && (c.includes(',') || c.includes('\n') || c.includes('"'))) {
        return `"${c.replace(/"/g, '""')}"`;
      }
      return c;
    }).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `patients-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  async exportPdf(patients: Patient[]): Promise<void> {
    const { jsPDF } = await import('jspdf');
    // import autoTable
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('landscape', 'pt', 'a4');
    const columns = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Address', 'Created At'];
    const rows = patients.map((p) => [
      p.id ?? '',
      p.firstName,
      p.lastName,
      p.email,
      p.phone || '',
      this.fmt(p.dateOfBirth),
      p.address || '',
      this.fmt(p.createdAt),
    ]);

    doc.setFontSize(14);
    doc.text('Patients', 40, 40);

    autoTable(doc, {
      startY: 60,
      head: [columns],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [68, 114, 196], halign: 'center', textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: 'grid',
    });

    const pdfBlob = doc.output('blob');
    this.downloadBlob(pdfBlob, `patients-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
