import {ClientRepository} from "../repositories/ClientRepository";
import {RoleRepository} from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import {DataSource} from "typeorm";

export class ClientService {
    private clientRepo: ClientRepository;
    private roleRepo: RoleRepository;

    constructor(dataSource: DataSource) {
        this.clientRepo = new ClientRepository(dataSource);
        this.roleRepo = new RoleRepository(dataSource);
    }

    async createClient(
        login: string,
        plainPassword: string,
        phone: string,
        companyName: string
    ) {
        const exists = await this.clientRepo.findByLogin(login);
        if (exists) throw new Error("Client already exists");

        const role = await this.roleRepo.findByRoleName('client');
        if (!role) throw new Error("Client role not found");

        const password = await bcrypt.hash(plainPassword, 10);
        return this.clientRepo.createClient(
            login,
            password,
            plainPassword,
            phone,
            companyName,
            role
        );
    }

    async getClientAppeals(clientId: number) {
        return this.clientRepo.findOne({
            where: {id: clientId},
            relations: ["appeals", "appeals.status"]
        });
    }
}
