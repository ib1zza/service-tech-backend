import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("POinfo")
export class POinfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    TextInfo: string;
}
