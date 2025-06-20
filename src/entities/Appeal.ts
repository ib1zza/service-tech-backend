import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { AppealStatus } from "./AppealStatus";
import { Client } from "./Client";
import { Staff } from "./Staff";

@Entity("appeals")
export class Appeal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    mechanism: string;

    @Column({ length: 256 })
    problem: string;

    @Column({ length: 60 })
    fio_client: string;

    @ManyToOne(() => AppealStatus, (status) => status.appeals)
    status: AppealStatus;

    @Column()
    date_start: Date;

    @Column({ length: 256, nullable: true })
    appeal_desc: string;

    @Column({ nullable: true })
    date_close: Date;

    // Связи с сотрудниками и заказчиком
    @ManyToOne(() => Staff, (staff) => staff.closed_appeals, { nullable: true })
    fio_staff_close_id: Staff;

    @ManyToOne(() => Staff, (staff) => staff.opened_appeals, { nullable: true })
    fio_staff_open_id: Staff;

    @ManyToOne(() => Client, (client) => client.appeals, { nullable: true })
    company_name_id: Client;

    @Column({ length: 60, nullable: true })
    fio_staff: string;
}
