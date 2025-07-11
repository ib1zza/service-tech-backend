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
    return this.find({
      relations: ["appeals", "role"],
      order: { company_name: "ASC" },
    });
  }

  async removeClient(clientId: number): Promise<void> {
    await this.delete(clientId);
  }

  async editClient(
    clientId: number,
    data: {
      companyName?: string;
      login?: string;
      passwordHash?: string;
      plainPassword?: string;
      phone?: string;
    }
  ): Promise<void> {
    const updatedData: Record<string, string> = {};

    if (data.companyName) updatedData["company_name"] = data.companyName;
    if (data.login) updatedData["login_client"] = data.login;
    if (data.passwordHash) updatedData["password_hash"] = data.passwordHash;
    if (data.plainPassword) updatedData["password_plain"] = data.plainPassword;
    if (data.phone) updatedData["phone_number_client"] = data.phone;

    await this.update(clientId, updatedData);
  }

  async findByIdWithAppeals(clientId: number): Promise<Client | null> {
    return this.findOne({
      where: { id: clientId },
      relations: ["appeals", "role"],
    });
  }

  async getClientByPhone(phone: string): Promise<Client | null> {
    return this.findOne({
      where: { phone_number_client: phone },
    });
  }

  async updateClientPassword(
    clientId: number,
    newPasswordHash: string,
    newPlainPassword: string
  ): Promise<void> {
    await this.update(clientId, {
      password_hash: newPasswordHash,
      password_plain: newPlainPassword,
    });
  }
}
