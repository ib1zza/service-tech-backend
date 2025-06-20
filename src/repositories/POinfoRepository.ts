import { DataSource, Repository } from "typeorm";
import { POinfo } from "../entities/POinfo";

export class POinfoRepository extends Repository<POinfo> {
    constructor(private dataSource: DataSource) {
        super(POinfo, dataSource.createEntityManager());
    }

    async getInfo(): Promise<POinfo | null> {
        return this.findOne({ where: { id: 1 } });
    }

    async updateInfo(text: string): Promise<POinfo> {
        let info = await this.getInfo();
        if (!info) {
            info = this.create({ TextInfo: text });
        } else {
            info.TextInfo = text;
        }
        return this.save(info);
    }
}
