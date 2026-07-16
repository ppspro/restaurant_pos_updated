import { Response } from 'express';
import * as fastcsv from 'fast-csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit-table';

export class ExportService {
  /**
   * Generates a CSV stream and pipes it to the HTTP response
   */
  static async exportToCsv(res: Response, filename: string, data: any[]) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);

    const stream = fastcsv.format({ headers: true });
    stream.pipe(res);

    data.forEach(row => {
      stream.write(row);
    });

    stream.end();
  }

  /**
   * Generates an Excel file stream and pipes it to the HTTP response
   */
  static async exportToExcel(res: Response, filename: string, data: any[], columns: { header: string, key: string, width?: number }[]) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    worksheet.columns = columns;

    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generates a PDF document and pipes it to the HTTP response
   */
  static async exportToPdf(res: Response, filename: string, title: string, data: any[], columns: string[]) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(16).text(title, { align: 'center' });
    doc.moveDown();

    // Map data to array format for pdfkit-table
    const tableData = data.map(row => columns.map(col => row[col]?.toString() || ''));

    const table = {
      title,
      headers: columns,
      rows: tableData,
    };

    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
      prepareRow: () => doc.font("Helvetica").fontSize(10)
    });

    doc.end();
  }
}
