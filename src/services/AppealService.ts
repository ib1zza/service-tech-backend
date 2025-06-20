import { AppealRepository } from "../repositories/AppealRepository";
import { AppealStatusRepository } from "../repositories/AppealStatusRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { StaffRepository } from "../repositories/StaffRepository";
import { sendTelegramNotification } from "./TelegramService";
import {DataSource} from "typeorm";
import {excelExportService} from "./excel-export.service";

export class AppealService {
    private appealRepo: AppealRepository;
    private statusRepo: AppealStatusRepository;
    private clientRepo: ClientRepository;
    private staffRepo: StaffRepository;

    constructor(dataSource: DataSource) {
        this.appealRepo = new AppealRepository(dataSource);
        this.statusRepo = new AppealStatusRepository(dataSource);
        this.clientRepo = new ClientRepository(dataSource);
        this.staffRepo = new StaffRepository(dataSource);
    }

    async createAppeal(
        mechanism: string,
        problem: string,
        fioClient: string,
        clientId: number
    ) {
        const client = await this.clientRepo.findOne({ where: { id: clientId } });
        if (!client) throw new Error("Client not found");

        const status = await this.statusRepo.findByStatusName('new');
        if (!status) throw new Error("Status not found");

        const appeal = await this.appealRepo.createAppeal(
            mechanism,
            problem,
            fioClient,
            status,
            client
        );

        await sendTelegramNotification(`Новая заявка №${appeal.id} от ${client.company_name}`);
        return appeal;
    }

    async takeAppealToWork(appealId: number, staffId: number) {
        const appeal = await this.appealRepo.findOne({ where: { id: appealId } });
        if (!appeal) throw new Error("Appeal not found");

        const staff = await this.staffRepo.findOne({ where: { id: staffId } });
        if (!staff) throw new Error("Staff not found");

        const status = await this.statusRepo.findByStatusName('in_progress');
        if (!status) throw new Error("Status not found");

        appeal.status = status;
        appeal.fio_staff_open_id = staff;
        appeal.fio_staff = staff.fio_staff;

        return this.appealRepo.save(appeal);
    }

    async closeAppeal(appealId: number, staffId: number, description: string) {
        const staff = await this.staffRepo.findOne({ where: { id: staffId } });
        if (!staff) throw new Error("Staff not found");

        const appeal = await this.appealRepo.closeAppeal(appealId, staff, description);
        const client = await this.clientRepo.findOne({
            where: { id: appeal.company_name_id.id }
        });

        if (client) {
            await sendTelegramNotification(
                `Заявка №${appeal.id} закрыта`,
                client.phone_number_client
            );
        }

        // Генерация отчета при закрытии заявки
        if (appeal.company_name_id) {
            const appeals =  client!.appeals;
            await excelExportService.generateClientReport(client!, appeals);
        }

        return appeal;
    }

    async getNewAppeals() {
        return this.appealRepo.findNewAppeals();
    }

    async getAppealsInProgress() {
        return this.appealRepo.findAppealsInProgress();
    }
}
