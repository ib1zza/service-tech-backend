import { DataSource, Repository } from "typeorm";
import { Staff } from "../entities/Staff";
import { Role } from "../entities/Role";

export class StaffRepository extends Repository<Staff> {
  constructor(private dataSource: DataSource) {
    super(Staff, dataSource.createEntityManager());
  }

  async findByLogin(login: string): Promise<Staff | null> {
    return this.findOne({ where: { login_staff: login }, relations: ["role"] });
  }

  async findByIdWithRole(id: number): Promise<Staff | null> {
    return this.findOne({ where: { id }, relations: ["role"] });
  }

  async createStaff(
    login: string,
    password: string,
    plainPassword: string,
    fio: string,
    role: Role
  ): Promise<Staff> {
    const staff = this.create({
      login_staff: login,
      password,
      password_plain: plainPassword,
      fio_staff: fio,
      role,
    });
    return this.save(staff);
  }

  async getStaffWithAppeals(): Promise<Staff[]> {
    return this.find({
      relations: ["opened_appeals", "closed_appeals"],
    });
  }
}
