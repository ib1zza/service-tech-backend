import ExcelJS from "exceljs";
import { Appeal } from "../entities/Appeal";
import { Client } from "../entities/Client";
import { Staff } from "../entities/Staff";
import fs from "fs";
import path from "path";

class ExcelExportService {
  private readonly reportsDir = process.env.REPORTS_DIR || "./reports";

  constructor() {
    this.ensureReportsDirExists();
  }

  private ensureReportsDirExists(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateClientReport(
    client: Client,
    appeals: Appeal[]
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Appeals History");

    // Заголовки
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Дата создания", key: "date_start", width: 20 },
      { header: "Дата закрытия", key: "date_close", width: 20 },
      { header: "Механизм", key: "mechanism", width: 25 },
      { header: "Описание неисправности", key: "problem", width: 40 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Принял заявку", key: "staff_open", width: 30 },
      { header: "Закрыл заявку", key: "staff_close", width: 30 },
      { header: "Исполнители", key: "fio_staff", width: 30 },
      { header: "Описание работ", key: "description", width: 50 },
    ];

    // Данные
    [...appeals]
      .sort((a, b) => b.date_start.getTime() - a.date_start.getTime())
      .forEach((appeal) => {
        worksheet.addRow({
          id: appeal.id,
          date_start: appeal.date_start,
          date_close: appeal.date_close,
          mechanism: appeal.mechanism,
          problem: appeal.problem,
          status: appeal.status?.st,
          staff_open: appeal.fio_staff_open_id?.fio_staff,
          staff_close: appeal.fio_staff_close_id?.fio_staff,
          fio_staff: appeal.fio_staff,
          description: appeal.appeal_desc,
        });
      });

    // Сохранение файла
    const fileName = `${client.company_name}_report.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);

    try {
      await workbook.xlsx.writeFile(filePath);
      return filePath;
    } catch (error: any) {
      throw new Error(`Не удалось сохранить отчет: ${error.message}`);
    }
  }

  async getReportStream(filePath: string): Promise<fs.ReadStream> {
    return new Promise((resolve, reject) => {
      // Проверяем существование файла
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return reject(new Error(`Файл отчета не найден: ${filePath}`));
        }

        const stream = fs.createReadStream(filePath);
        stream.on("error", (error) => {
          reject(new Error(`Ошибка чтения файла: ${error.message}`));
        });
        stream.on("open", () => {
          resolve(stream);
        });
      });
    });
  }

  async getOrCreateReport(
    client: Client,
    appeals: Appeal[]
  ): Promise<fs.ReadStream> {
    try {
      // Сначала пытаемся получить существующий отчет
      const fileName = `${client.company_name}.xlsx`;
      const filePath = path.join(this.reportsDir, fileName);

      try {
        await fs.promises.access(filePath);
        return this.getReportStream(filePath);
      } catch {
        // Если файла нет - создаем новый
        const newFilePath = await this.generateClientReport(client, appeals);
        return this.getReportStream(newFilePath);
      }
    } catch (error: any) {
      throw new Error(`Не удалось получить отчет: ${error.message}`);
    }
  }
}

export const excelExportService = new ExcelExportService();
