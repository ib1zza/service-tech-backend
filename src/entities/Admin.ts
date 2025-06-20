import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Role } from "./Role";

@Entity("admins")
export class Admin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10 })
    login_admin: string;

    @Column()
    password: string;

    @Column({ length: 10 })
    password_plain: string;

    @Column({ length: 60 })
    fio_admin: string;

    @Column({ length: 12 })
    phone_number_admin: string;

    @ManyToOne(() => Role, (role) => role.admins)
    role: Role;
}
