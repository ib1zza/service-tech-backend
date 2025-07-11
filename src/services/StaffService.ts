import { StaffRepository } from "../repositories/StaffRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";

export class StaffService {
  private staffRepo: StaffRepository;
  private roleRepo: RoleRepository;

  constructor(dataSource: DataSource) {
    this.staffRepo = new StaffRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
  }

  async createStaff(login: string, plainPassword: string, fio: string) {
    const exists = await this.staffRepo.findByLogin(login);
    if (exists) throw new Error("Staff already exists");

    const role = await this.roleRepo.findByRoleName("staff");
    if (!role) throw new Error("Staff role not found");

    const password = await bcrypt.hash(plainPassword, 10);
    return this.staffRepo.createStaff(
      login,
      password,
      plainPassword,
      fio,
      role
    );
  }

  async getStaffAppeals(staffId: number) {
    return this.staffRepo.findOne({
      where: { id: staffId },
      relations: ["opened_appeals", "closed_appeals"],
    });
  }

  async removeStaff(staffId: number) {
    return this.staffRepo.removeStaff(staffId);
  }

  async editStaff(
    staffId: number,
    fio?: string,
    login?: string,
    password?: string
  ) {
    return this.staffRepo.editStaff(staffId, fio, login, password);
  }

  async getAllStaff() {
    return this.staffRepo.find({ relations: ["role"] });
  }
}
