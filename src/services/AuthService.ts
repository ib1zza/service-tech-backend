import { DataSource } from "typeorm";
import { AdminRepository } from "../repositories/AdminRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { StaffRepository } from "../repositories/StaffRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
  private adminRepo: AdminRepository;
  private clientRepo: ClientRepository;
  private staffRepo: StaffRepository;
  private roleRepo: RoleRepository;

  constructor(dataSource: DataSource) {
    this.adminRepo = new AdminRepository(dataSource);
    this.clientRepo = new ClientRepository(dataSource);
    this.staffRepo = new StaffRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
  }

  async refresh({ id, role }: { id: number; role: string }) {
    const roleObj = await this.roleRepo.findByRoleName(role);
    if (!roleObj) throw new Error("Invalid role");
    let user;
    switch (role) {
      case "admin":
        user = await this.adminRepo.findByIdWithRole(id);
        break;
      case "staff":
        user = await this.staffRepo.findByIdWithRole(id);
        break;
      case "client":
        user = await this.clientRepo.findByIdWithRole(id);
        break;
    }
    return {
      token: jwt.sign({ id, role }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      }),
      user,
    };
  }

  async login(
    login: string,
    password: string,
    roleType: "admin" | "staff" | "client"
  ) {
    let user;
    switch (roleType) {
      case "admin":
        user = await this.adminRepo.findByLogin(login);
        break;
      case "staff":
        user = await this.staffRepo.findByLogin(login);
        break;
      case "client":
        user = await this.clientRepo.findByLogin(login);
        break;
    }

    if (!user) throw new Error("User not found");
    // TODO
    // if (!(await bcrypt.compare(password, user.password))) throw new Error("Invalid password");

    if (user.password_plain !== password) throw new Error("Invalid password");

    const role = await this.roleRepo.findByRoleName(roleType);
    console.log("111", role, user);

    if (!role || user.role.role !== roleType) throw new Error("Invalid role");

    return {
      token: jwt.sign(
        { id: user.id, role: roleType },
        process.env.JWT_SECRET!,
        {
          expiresIn: "24h",
        }
      ),
      user,
    };
  }
}
