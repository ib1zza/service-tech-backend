import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Appeal } from "./Appeal";

@Entity("appeal_status")
export class AppealStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 15 })
    st: string; // 'new', 'in_progress', 'ready', 'cancel'

    @OneToMany(() => Appeal, (appeal) => appeal.status)
    appeals: Appeal[];
}
