import {POinfoRepository} from "../repositories/POinfoRepository";
import {DataSource} from "typeorm";

export class POinfoService {
    private poInfoRepo: POinfoRepository;

    constructor(dataSource: DataSource) {
        this.poInfoRepo = new POinfoRepository(dataSource);
    }


    async getAboutInfo() {
        return this.poInfoRepo.getInfo();
    }

    async updateAboutInfo(text: string) {
        return this.poInfoRepo.updateInfo(text);
    }
}
