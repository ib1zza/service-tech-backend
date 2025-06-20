import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Admin } from "./Admin";
import { Client } from "./Client";
import { Staff } from "./Staff";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 6 })
    role: string; // 'admin', 'staff', 'client'

    // Связи с другими таблицами
    @OneToMany(() => Admin, (admin) => admin.role)
    admins: Admin[];

    @OneToMany(() => Client, (client) => client.role)
    clients: Client[];

    @OneToMany(() => Staff, (staff) => staff.role)
    staffs: Staff[];
}
