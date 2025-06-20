import { DataSource, Repository } from "typeorm";
import { Role } from "../entities/Role";

export class RoleRepository extends Repository<Role> {
    constructor(private dataSource: DataSource) {
        super(Role, dataSource.createEntityManager());
    }

    async findByRoleName(role: string): Promise<Role | null> {
        return this.findOne({ where: { role } });
    }

    async createRole(roleName: string): Promise<Role> {
        const role = this.create({ role: roleName });
        return this.save(role);
    }
}
