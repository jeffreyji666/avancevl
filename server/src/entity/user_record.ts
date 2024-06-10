import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column } from "typeorm";

@Entity()
export class UserRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
    })
    uid: number;

    @CreateDateColumn()
    createTime: Date;

    // @UpdateDateColumn()
    // updateTime: Date;
}

export const userSchema = {
    id: { type: "number", required: true, example: 1 }
};