import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Length, IsEmail, IsBoolean,  MinLength, MaxLength, Matches } from "class-validator";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 80
    })
    @Length(3, 80)
    name: string;

    @Column({
        length: 100
    })
    @Length(10, 100)
    @IsEmail()
    email: string;

    @Column({
        length: 200
    })
    @MinLength(8)
    @MaxLength(200)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*\s).{8,}$/g, { message: "Password too weak" }) 
    password: string;

    @Column({
        length: 100
    })
    // @Length(10, 20)
    token: string;

    @Column()
    // @IsBoolean()
    verified: boolean;

    @CreateDateColumn()
    createTime: Date;

    @UpdateDateColumn()
    updateTime: Date;
}

export const userSchema = {
    id: { type: "number", required: true, example: 1 },
    name: { type: "string", required: true, example: "Javier" },
    email: { type: "string", required: true, example: "avileslopez.javier@citest.com" },

};
export const usernameSchema = {
    id: { type: "number", required: true, example: 1 },
    name: { type: "string", required: true, example: "Javier" },
};

export const userRegisterSchema = {
    username: { type: "string", required: true, example: "Javier" },
    email: { type: "string", required: true, example: "avileslopez.javier@citest.com" },
    password: { type: "string", required: true, example: "Password123!" },
    passwordConfirm: { type: "string", required: true, example: "Password123!" },
};
export const userLoginSchema = {
    email: { type: "string", required: true, example: "avileslopez.javier@citest.com" },
    password: { type: "string", required: true, example: "Password123!" },
};

export const userResetSchema = {
    password: { type: "string", required: true, example: "Password123!" },
    newPassword: { type: "string", required: true, example: "Password123!" },
    newPasswordConfirm: { type: "string", required: true, example: "Password123!" },
};

export const userResendSchema = {
    email: { type: "string", required: true, example: "avileslopez.javier@citest.com" },
};