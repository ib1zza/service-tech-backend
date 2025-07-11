import { AppealRepository } from "../repositories/AppealRepository";
import { AppealStatusRepository } from "../repositories/AppealStatusRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { StaffRepository } from "../repositories/StaffRepository";
import { sendTelegramNotification } from "./TelegramService";
import { DataSource } from "typeorm";
import { excelExportService } from "./excel-export.service";

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

    const status = await this.statusRepo.findByStatusName("new");
    if (!status) throw new Error("Status not found");

    const appeal = await this.appealRepo.createAppeal(
      mechanism,
      problem,
      fioClient,
      status,
      client
    );

    await sendTelegramNotification(
      `Новая заявка №${appeal.id} от ${client.company_name}`
    );
    return appeal;
  }

  async takeAppealToWork(appealId: number, staffId: number) {
    const appeal = await this.appealRepo.findOne({ where: { id: appealId } });
    if (!appeal) throw new Error("Appeal not found");

    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new Error("Staff not found");

    const status = await this.statusRepo.findByStatusName("in_progress");
    if (!status) throw new Error("Status not found");

    appeal.status = status;
    appeal.fio_staff_open_id = staff;
    appeal.fio_staff = staff.fio_staff;

    return this.appealRepo.save(appeal);
  }

  async closeAppeal(
    appealId: number,
    staffId: number,
    description: string,
    fio_staff: string
  ) {
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new Error("Staff not found");

    const appeal = await this.appealRepo.closeAppeal(
      appealId,
      staff,
      description,
      fio_staff
    );
    const client = await this.clientRepo.findOne({
      where: { id: appeal.company_name_id.id },
      relations: ["appeals"],
    });

    // if (client) {
    //   await sendTelegramNotification(
    //     `Заявка №${appeal.id} закрыта`,
    //     client.phone_number_client
    //   );
    // }

    // // Генерация отчета при закрытии заявки
    // if (appeal.company_name_id) {
    //   const appeals = client!.appeals;
    //   await excelExportService.generateClientReport(client!, appeals);
    // }

    return appeal;
  }

  //    const appeal = await appealService.cancelAppeal(
  //     appealId,
  //     req.currentUser!.id,
  //     description
  //   );
  //   При клике кнопки ‘Отменить заявку’, на сервисную часть ПО приходит новая заявка с ‘Кратким описанием неисправности’: “Отмена заявки от Дата чч.мм.гггг Время час:мин”.
  async cancelAppeal(appealId: number, userId: number) {
    const user = await this.clientRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    const cancelStatus = await this.statusRepo.findByStatusName("cancel");
    const completedStatus = await this.statusRepo.findByStatusName("completed");

    const prevAppeal = await this.appealRepo.findOne({
      where: { id: appealId },
    });
    if (!prevAppeal) throw new Error("Appeal not found");

    const newAppeal = await this.appealRepo.createAppeal(
      "Отмена заявки",
      "Отмена заявки от " + prevAppeal.date_start.toLocaleString("ru"),
      "Отмена заявки от " + prevAppeal.date_start.toLocaleString("ru"),
      cancelStatus!,
      user
    );

    prevAppeal.status = completedStatus!;
    prevAppeal.date_close = new Date();
    prevAppeal.appeal_desc =
      "Заявка отменена " + new Date().toLocaleString("ru");

    await this.appealRepo.save(prevAppeal);

    return prevAppeal;
  }

  async getNewAppeals() {
    return this.appealRepo.findNewAppeals();
  }

  async getNewAppealsByClientId(clientId: number) {
    return this.appealRepo.findNewAppealsByClientId(clientId);
  }

  async getAppealsInProgress() {
    return this.appealRepo.findAppealsInProgress();
  }

  async getAppealsInProgressByClientId(clientId: number) {
    return this.appealRepo.getAppealsInProgressByClientId(clientId);
  }

  async getCompletedAppeals() {
    return this.appealRepo.findCompletedAppeals();
  }

  async getCompletedAppealsByClientId(clientId: number) {
    return this.appealRepo.getCompletedAppealsByClientId(clientId);
  }
}
