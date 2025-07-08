import { DataSource, Repository } from "typeorm";
import { Appeal } from "../entities/Appeal";
import { AppealStatus } from "../entities/AppealStatus";
import { Client } from "../entities/Client";
import { Staff } from "../entities/Staff";

export class AppealRepository extends Repository<Appeal> {
  constructor(private dataSource: DataSource) {
    super(Appeal, dataSource.createEntityManager());
  }

  async findNewAppeals(): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "new" },
    });
    if (!status) return [];
    return this.find({
      where: { status: { id: status.id } },
      relations: ["company_name_id", "status"],
    });
  }

  async findNewAppealsByClientId(clientId: number): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "new" },
    });
    if (!status) return [];
    return this.find({
      where: { status: { id: status.id }, company_name_id: { id: clientId } },
      relations: ["company_name_id", "status"],
    });
  }

  async findAppealsInProgress(): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "in_progress" },
    });
    if (!status) return [];
    return this.find({
      where: { status: { id: status.id } },
      relations: ["company_name_id", "fio_staff_open_id"],
    });
  }

  async getAppealsInProgressByClientId(clientId: number): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "in_progress" },
    });
    if (!status) return [];
    return this.find({
      where: { status: { id: status.id }, company_name_id: { id: clientId } },
      relations: ["company_name_id", "status", "fio_staff_open_id"],
    });
  }

  async findCompletedAppeals(): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "completed" },
    });
    if (!status) return [];
    return this.find({
      where: { status: { id: status.id } },
      relations: ["company_name_id", "fio_staff_close_id"],
    });
  }

  async getCompletedAppealsByClientId(clientId: number): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "completed" },
    });
    if (!status) return [];
    return this.find({
      where: { status: { id: status.id }, company_name_id: { id: clientId } },
      relations: [
        "company_name_id",
        "status",
        "fio_staff_open_id",
        "fio_staff_close_id",
      ],
    });
  }

  async createAppeal(
    mechanism: string,
    problem: string,
    fioClient: string,
    status: AppealStatus,
    client: Client,
    staff?: Staff
  ): Promise<Appeal> {
    const appeal = this.create({
      mechanism,
      problem,
      fio_client: fioClient,
      status,
      company_name_id: client,
      fio_staff_open_id: staff,
      date_start: new Date(),
    });
    return this.save(appeal);
  }

  async closeAppeal(
    id: number,
    staff: Staff,
    description: string
  ): Promise<Appeal> {
    const appeal = await this.findOne({ where: { id } });
    if (!appeal) throw new Error("Appeal not found");

    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "completed" },
    });
    if (!status) throw new Error("Status not found");

    appeal.status = status;
    appeal.fio_staff_close_id = staff;
    appeal.date_close = new Date();
    appeal.appeal_desc = description;

    return this.save(appeal);
  }
}
