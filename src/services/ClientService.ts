import { ClientRepository } from "../repositories/ClientRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { Client } from "../entities/Client";

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
  ): Promise<Client> {
    const exists = await this.clientRepo.findByLogin(login);
    if (exists) throw new Error("Client with this login already exists");

    const role = await this.roleRepo.findByRoleName("client");
    if (!role) throw new Error("Client role not found in database");

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

  async getClientWithAppeals(clientId: number): Promise<Client | null> {
    return this.clientRepo.findByIdWithAppeals(clientId);
  }

  async getAllClients(): Promise<Client[]> {
    return this.clientRepo.getClientsWithAppeals();
  }

  async getClientById(clientId: number): Promise<Client | null> {
    return this.clientRepo.findByIdWithRole(clientId);
  }

  async getClientByLogin(login: string): Promise<Client | null> {
    return this.clientRepo.findByLogin(login);
  }

  async getClientByPhone(phone: string): Promise<Client | null> {
    return this.clientRepo.getClientByPhone(phone);
  }

  async updateClient(
    clientId: number,
    updateData: {
      companyName?: string;
      phone?: string;
      login?: string;
      plainPassword?: string;
    }
  ): Promise<void> {
    const client = await this.clientRepo.findByIdWithRole(clientId);
    if (!client) throw new Error("Client not found");

    const updatePayload: {
      companyName?: string;
      phone?: string;
      login?: string;
      passwordHash?: string;
      plainPassword?: string;
    } = {};

    if (updateData.companyName)
      updatePayload.companyName = updateData.companyName;
    if (updateData.phone) updatePayload.phone = updateData.phone;

    if (updateData.login) {
      const loginExists = await this.clientRepo.findByLogin(updateData.login);
      if (loginExists && loginExists.id !== clientId) {
        throw new Error("This login is already taken by another client");
      }
      updatePayload.login = updateData.login;
    }

    if (updateData.plainPassword) {
      const passwordHash = await bcrypt.hash(updateData.plainPassword, 10);
      updatePayload.passwordHash = passwordHash;
      updatePayload.plainPassword = updateData.plainPassword;
    }

    await this.clientRepo.editClient(clientId, updatePayload);
  }

  async updateClientPassword(
    clientId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const client = await this.clientRepo.findByIdWithRole(clientId);
    if (!client) throw new Error("Client not found");

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      client.password_hash
    );
    if (!isPasswordValid) throw new Error("Current password is incorrect");

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.clientRepo.updateClientPassword(
      clientId,
      newPasswordHash,
      newPassword
    );
  }

  async deleteClient(clientId: number): Promise<void> {
    const client = await this.clientRepo.findByIdWithRole(clientId);
    if (!client) throw new Error("Client not found");

    await this.clientRepo.removeClient(clientId);
  }

  async validateClientCredentials(
    login: string,
    password: string
  ): Promise<Client | null> {
    const client = await this.clientRepo.findByLogin(login);
    if (!client) return null;

    const isValid = await bcrypt.compare(password, client.password_hash);
    return isValid ? client : null;
  }
}
