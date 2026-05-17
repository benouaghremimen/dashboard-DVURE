import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    message!: string;

    @Column({ default: false })
    isRead!: boolean;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;
}
