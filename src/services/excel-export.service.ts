// src/services/excel-export.service.ts
import ExcelJS from 'exceljs';
import { Appeal } from '../entities/Appeal';
import { Client } from '../entities/Client';
import { Staff } from '../entities/Staff';
import fs from 'fs';
import path from 'path';

class ExcelExportService {
    private readonly reportsDir = process.env.REPORTS_DIR || './reports';

    constructor() {
        this.ensureReportsDirExists();
    }

    private ensureReportsDirExists(): void {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    async generateClientReport(client: Client, appeals: Appeal[]): Promise<string> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Appeals History');

        // Заголовки
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Дата создания', key: 'date_start', width: 20 },
            { header: 'Дата закрытия', key: 'date_close', width: 20 },
            { header: 'Механизм', key: 'mechanism', width: 25 },
            { header: 'Проблема', key: 'problem', width: 40 },
            { header: 'Статус', key: 'status', width: 15 },
            { header: 'Исполнитель', key: 'staff', width: 30 },
            { header: 'Описание работ', key: 'description', width: 50 }
        ];

        // Данные
        appeals.forEach(appeal => {
            worksheet.addRow({
                id: appeal.id,
                date_start: appeal.date_start,
                date_close: appeal.date_close,
                mechanism: appeal.mechanism,
                problem: appeal.problem,
                status: appeal.status?.st,
                staff: appeal.fio_staff_close_id?.fio_staff,
                description: appeal.appeal_desc
            });
        });


        // Сохранение файла
        const fileName = `${client.company_name}.xlsx`;
        const filePath = path.join(this.reportsDir, fileName);
        await workbook.xlsx.writeFile(filePath);

        return filePath;
    }

    async getReportStream(filePath: string): Promise<fs.ReadStream> {
        return fs.createReadStream(filePath);
    }
}

export const excelExportService = new ExcelExportService();
