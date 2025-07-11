import { AdminRepository } from "../repositories/AdminRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";

export class AdminService {
  private adminRepo: AdminRepository;
  private roleRepo: RoleRepository;

  constructor(dataSource: DataSource) {
    this.adminRepo = new AdminRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
  }

  async createAdmin(
    login: string,
    plainPassword: string,
    fio: string,
    phone: string
  ) {
    const exists = await this.adminRepo.findByLogin(login);
    if (exists) throw new Error("Admin already exists");

    const role = await this.roleRepo.findByRoleName("admin");
    if (!role) throw new Error("Admin role not found");

    const password = await bcrypt.hash(plainPassword, 10);
    return this.adminRepo.createAdmin(
      login,
      password,
      plainPassword,
      fio,
      phone,
      role
    );
  }

  async updateAdminCredentials(
    adminId: number,
    newLogin?: string,
    newPassword?: string,
    newPhone?: string
  ) {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new Error("Admin not found");

    if (!newLogin) newLogin = admin.login_admin;
    if (!newPassword) newPassword = admin.password_plain;
    if (!newPhone) newPhone = admin.phone_number_admin;
    admin.login_admin = newLogin;
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.password_plain = newPassword;
    admin.phone_number_admin = newPhone;

    return this.adminRepo.save(admin);
  }
}
