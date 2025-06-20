import { DataSource, Repository } from "typeorm";
import { Admin } from "../entities/Admin";
import { Role } from "../entities/Role";

export class AdminRepository extends Repository<Admin> {
  constructor(private dataSource: DataSource) {
    super(Admin, dataSource.createEntityManager());
  }

  async findByLogin(login: string): Promise<Admin | null> {
    return this.findOne({ where: { login_admin: login }, relations: ["role"] });
  }

  async findByIdWithRole(id: number): Promise<Admin | null> {
    return this.findOne({ where: { id }, relations: ["role"] });
  }

  async createAdmin(
    login: string,
    password: string,
    plainPassword: string,
    fio: string,
    phone: string,
    role: Role
  ): Promise<Admin> {
    const admin = this.create({
      login_admin: login,
      password,
      password_plain: plainPassword,
      fio_admin: fio,
      phone_number_admin: phone,
      role,
    });
    return this.save(admin);
  }
}
