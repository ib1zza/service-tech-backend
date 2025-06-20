import { DataSource, Repository } from "typeorm";
import { AppealStatus } from "../entities/AppealStatus";

export class AppealStatusRepository extends Repository<AppealStatus> {
    constructor(private dataSource: DataSource) {
        super(AppealStatus, dataSource.createEntityManager());
    }

    async findByStatusName(st: string): Promise<AppealStatus | null> {
        return this.findOne({ where: { st } });
    }

    async getAllStatuses(): Promise<AppealStatus[]> {
        return this.find();
    }
}
