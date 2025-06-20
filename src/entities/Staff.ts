import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Role } from "./Role";
import { Appeal } from "./Appeal";

@Entity("staffs")
export class Staff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10 })
    login_staff: string;

    @Column()
    password: string;

    @Column({ length: 10 })
    password_plain: string;

    @Column({ length: 60 })
    fio_staff: string;

    @ManyToOne(() => Role, (role) => role.staffs)
    role: Role;

    // Связи с заявками (кто открыл/закрыл)
    @OneToMany(() => Appeal, (appeal) => appeal.fio_staff_open_id)
    opened_appeals: Appeal[];

    @OneToMany(() => Appeal, (appeal) => appeal.fio_staff_close_id)
    closed_appeals: Appeal[];
}
