import { DataSource, Repository } from "typeorm";
import { Client } from "../entities/Client";
import { Role } from "../entities/Role";

export class ClientRepository extends Repository<Client> {
  constructor(private dataSource: DataSource) {
    super(Client, dataSource.createEntityManager());
  }

  async findByLogin(login: string): Promise<Client | null> {
    return this.findOne({
      where: { login_client: login },
      relations: ["role"],
    });
  }

  async findByIdWithRole(id: number): Promise<Client | null> {
    return this.findOne({ where: { id }, relations: ["role"] });
  }

  async createClient(
    login: string,
    passwordHash: string,
    plainPassword: string,
    phone: string,
    companyName: string,
    role: Role
  ): Promise<Client> {
    const client = this.create({
      login_client: login,
      password_hash: passwordHash,
      password_plain: plainPassword,
      phone_number_client: phone,
      company_name: companyName,
      role,
    });
    return this.save(client);
  }

  async getClientsWithAppeals(): Promise<Client[]> {
    return this.find({ relations: ["appeals"] });
  }
}
