import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Role } from "./Role";
import { Appeal } from "./Appeal";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  login_client: string;

  @Column()
  password_hash: string;

  @Column({ length: 10 })
  password_plain: string;

  @Column({ length: 12 })
  phone_number_client: string;

  @Column({ length: 50 })
  company_name: string;

  @Column({ length: 200, nullable: true })
  telegram_id: string;

  @ManyToOne(() => Role, (role) => role.clients)
  role: Role;

  @OneToMany(() => Appeal, (appeal) => appeal.company_name_id)
  appeals: Appeal[];
}
