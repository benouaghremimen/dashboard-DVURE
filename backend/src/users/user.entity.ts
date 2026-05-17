import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  clubName?: string;

  @Column()
  password!: string;

  @Column({ default: true })
  passwordIsHashed!: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true })
  resetPasswordTokenHash?: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpiresAt?: Date | null;

  @Column()
  role!: 'ADMIN' | 'CLUB';

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.club)
  reservations!: Reservation[];
}
