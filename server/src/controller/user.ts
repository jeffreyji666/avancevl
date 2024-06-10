import { Context } from "koa";
import { getManager, Repository, Not, Equal, Like } from "typeorm";
import { validate, ValidationError } from "class-validator";
import { request, summary, path, query, body, responsesAll, tagsAll } from "koa-swagger-decorator";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import jwt from "jsonwebtoken";
import { User, userSchema, userRegisterSchema, userResetSchema, userLoginSchema, userResendSchema, usernameSchema } from "../entity/user";
import { UserRecord } from "../entity/user_record";
import { config } from "../config";
import { sendEmail } from '../utils/send_mails'
import { responseFormat } from '../utils/resp'
const { OAuth2Client } = require('google-auth-library');

@responsesAll({ 200: { description: "success" }, 400: { description: "bad request" }, 401: { description: "unauthorized, missing/wrong jwt token" } })
@tagsAll(["User"])
export default class UserController {

    @request("put", "/users/{id}")
    @summary("Update a user")
    @path({
        id: { type: "number", required: true, description: "id of user" }
    })
    @body(usernameSchema)
    public static async updateUser(ctx: Context): Promise<void> {

        // get a user repository to perform operations with user
        const userRepository: Repository<User> = getManager().getRepository(User);

        // update the user by specified id
        // build up entity user to be updated
        const userToBeUpdated: User = new User();
        userToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
        userToBeUpdated.name = ctx.request.body.name;
        // userToBeUpdated.email = userRepository.email;
        console.log(userToBeUpdated.id, userToBeUpdated.name);
        
        const findUser = await userRepository.findOne(userToBeUpdated.id)
        if (!userToBeUpdated.id || !userToBeUpdated.name) {
            ctx.status = 400;
            ctx.body = "user or id doesn't exist";
        }else
        if (!findUser) {
            // check if a user with the specified id exists
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = "The user you are trying to update doesn't exist in the db";
        }
        else {
            // save the user contained in the PUT body

            const user = await userRepository.save(userToBeUpdated);
            // return CREATED status code and updated user
            ctx.status = 200;
            ctx.body = responseFormat.set({}, 0, 'ok');
        }
    }

    @request("post", "/register")
    @summary("register")
    @body(userRegisterSchema)
    public static async register(ctx: Context): Promise<void> {

        const userRepository: Repository<User> = getManager().getRepository(User);

        const userToBeSaved: User = new User();
        userToBeSaved.name = ctx.request.body.username;
        userToBeSaved.email = ctx.request.body.email;
        userToBeSaved.password = ctx.request.body.password;

        const { password, passwordConfirm, email, host } = ctx.request.body;

        // validate user entity
        const errors: ValidationError[] = await validate(userToBeSaved); // errors is an array of validation errors
        if (password !== passwordConfirm) {
            ctx.status = 400;
            ctx.body = "Passwords do not match!";
        } else if (errors.length > 0) {
            // return BAD REQUEST status code and errors array
            ctx.status = 400;
            ctx.body = errors;
        } else {
            const userExist = await userRepository.findOne({ email: userToBeSaved.email })
            if (userExist) {
                // return BAD REQUEST status code and email already exists error
                if (userExist.verified) {
                    ctx.status = 400;
                    ctx.body = "The specified e-mail address already exists";
                } else {
                    ctx.status = 200;
                    ctx.body = "Please verify email in mailbox";
                }
            } else {
                const hashedPassword = await bcrypt.hash(password, 5);
                userToBeSaved.password = hashedPassword;
                userToBeSaved.verified = false;

                const hashedToken = randomstring.generate();
                userToBeSaved.token = hashedToken;
                // save the user contained in the POST body
                const user = await userRepository.save(userToBeSaved);
                const link = `${process.env.HOST}:${process.env.PORT
                    }` + `/verify/${user.id}/${user.token}?redirect=${encodeURIComponent(host + '/#/login')}`
                sendEmail(email, link)
                // return CREATED status code and updated user
                ctx.status = 200;
                ctx.body = responseFormat.set({}, 0, 'ok');
            }
        }
    }

    // @request("post", "/sendmail")
    // @summary("send mail ")
    // @body(userResendSchema)
    // public static async sendmail(ctx: Context): Promise<void> {
    //     const userRepository: Repository<User> = getManager().getRepository(User);
    //     const email = ctx.params.email
    //     const user = await userRepository.findOne({ email: email })
    //     if (user) {
    //         const link = `${process.env.HOST}:${process.env.PORT
    //             }` + `/verify/${user.id}/${user.token}`
    //         sendEmail(email, link)
    //         ctx.status = 200;
    //         ctx.body = "ok";
    //     } else {
    //         ctx.status = 400;
    //         ctx.body = "user not exist";
    //     }
    // }


    @request("get", "/verify/{id}/{token}")
    @summary("verify user")
    @path({
        id: { type: "number", required: true, description: "id of user" }
    })
    @path({
        token: { type: "string", required: true, description: "verify token of user" }
    })
    public static async verifyUser(ctx: Context): Promise<void> {
        const userRepository: Repository<User> = getManager().getRepository(User);
        const user: User | undefined = await userRepository.findOne(+ctx.params.id || 0);

        if (user) {
            const token = user.token;
            const verified = user.verified;
            if (verified) {
                ctx.status = 200;
                ctx.body = "Verified already";
            } else if (token === ctx.params.token) {
                const userToBeUpdated: User = new User();
                userToBeUpdated.id = +ctx.params.id || 0; // will always have a number, this will avoid errors
                userToBeUpdated.verified = true;
                const user = await userRepository.save(userToBeUpdated);
                const host = ctx.query.redirect
                if (host) {
                    const link = decodeURIComponent(Array.isArray(host) ? host[0] : host)
                    ctx.response.redirect(link)
                }
                ctx.status = 200;
                ctx.body = 'success verified, go login';
            }
            ctx.status = 200;
            ctx.body = 'ok';
        } else {
            // return a BAD REQUEST status code and error message
            ctx.status = 400;
            ctx.body = "The user you are trying to retrieve doesn't exist in the db";
        }
    }


    @request("post", "/login")
    @summary("login")
    @body(userLoginSchema)
    public static async login(ctx: Context): Promise<void> {

        const userRepository: Repository<User> = getManager().getRepository(User);
        const { password, email } = ctx.request.body;

        if (!password?.trim() || !email?.trim()) {
            ctx.status = 400;
            ctx.body = responseFormat.set({}, 400, "Please fill out all fields");
        } else {
            const user = await userRepository.findOne({ email: email });
            if (!user) {
                ctx.status = 400;
                ctx.body = responseFormat.set({}, 400, "Mail or password is wrong");
            } else if (!user.verified) {
                ctx.status = 400;
                ctx.body = responseFormat.set({}, 400, "Please verify first");
            } else if (!await bcrypt.compare(password, user.password)) {
                ctx.status = 400;
                ctx.body = responseFormat.set({}, 400, "Mail or password is wrong");
            } else {
                const token = jwt.sign({ email: user.email, id: user.id }, config.jwtSecret, { expiresIn: "12h" }); // token 有效期为3小时
                ctx.cookies.set(
                    "token",
                    token,
                    {
                        path: "/", // 设置 cookie 的路径
                        maxAge: 3 * 60 * 60 * 1000, // cookie 的有效时间 ms
                        httpOnly: true, // 是否要设置 httpOnly
                        overwrite: true // 是否要覆盖已有的 cookie 设置
                    }
                );

                const userRecordRepository: Repository<UserRecord> = getManager().getRepository(UserRecord);
                const userRecordToBeUpdated: UserRecord = new UserRecord();
                userRecordToBeUpdated.uid = user.id;

                await userRecordRepository.save(userRecordToBeUpdated);

                ctx.status = 200;
                ctx.body = responseFormat.set({ token }, 0, 'ok');
            }
        }

    }

    @request("post", "/reset")
    @summary("reset password")
    @body(userResetSchema)
    public static async reset(ctx: Context): Promise<void> {

        const userRepository: Repository<User> = getManager().getRepository(User);
        const { password, newPassword, newPasswordConfirm } = ctx.request.body;

        try {
            const xtoken = ctx.headers['x-token']
            const btoken = Array.isArray(xtoken) ? xtoken[0] : xtoken

            const decoded = jwt.verify(btoken, config.jwtSecret);


            const id = typeof decoded === 'string' ? 0 : decoded.id

            if (!password.trim() || !newPassword.trim() || !newPasswordConfirm.trim()) {
                ctx.status = 400;
                ctx.body = responseFormat.set({}, 400, "Please fill out all fields");
            } else if (newPassword.trim() !== newPasswordConfirm.trim()) {
                ctx.status = 400;
                ctx.body = responseFormat.set({}, 400, "Passwords do not match!");
            } else if (password.trim() === newPassword.trim()) {
                ctx.status = 400;
                ctx.body = responseFormat.set({}, 400, "New Password should not be same!");
            } else {
                const user = await userRepository.findOne({ id: id });
                if (!user) {
                    ctx.status = 400;
                    ctx.body = responseFormat.set({}, 400, "Mail or password is wrong");
                } else if (!await bcrypt.compare(password, user.password)) {
                    ctx.status = 400;
                    ctx.body = responseFormat.set({}, 400, "Mail or password is wrong");
                } else {
                    const userToBeSaved: User = new User();
                    userToBeSaved.id = +ctx.params.id || 0;
                    const hashedPassword = await bcrypt.hash(password, 5);
                    userToBeSaved.password = hashedPassword;
                    userToBeSaved.name = user.name
                    userToBeSaved.email = user.email
                    userToBeSaved.token = user.token
                    userToBeSaved.verified = user.verified
                    // save the user contained in the POST body
                    const result = await userRepository.save(userToBeSaved);
                    ctx.status = 200;
                    ctx.body = responseFormat.set({}, 0, 'ok');
                }
            }
        } catch (e) {
            console.log(e);
            ctx.status = 500;
            ctx.body = responseFormat.set({}, 500, 'error');
        }
    }

    @request("post", "/statistics")
    @summary("get statistics")
    public static async getStatistics(ctx: Context): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // set to the beginning of the day
        try {
            const userRepository: Repository<User> = getManager().getRepository(User);
            const userRecordRepository: Repository<UserRecord> = getManager().getRepository(UserRecord);
            const userCount = await userRepository.count();

            const activeUsersCount = await userRecordRepository.createQueryBuilder("userRecord")
                .select("COUNT(DISTINCT userRecord.id)", "count")
                .where("userRecord.createTime >= :today", { today })
                .getRawOne();
            console.log(activeUsersCount);


            const lastSevenDay = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            lastSevenDay.setHours(0, 0, 0, 0);
            const totalUsersCount = await userRecordRepository.createQueryBuilder("userRecord")
                .select("COUNT(DISTINCT userRecord.id)", "count")
                .where("userRecord.createTime >= :lastSevenDay", { lastSevenDay })
                .getRawOne();
            const avgCount = Math.round(totalUsersCount.count / 7)

            ctx.status = 200;
            ctx.body = responseFormat.set({
                total: userCount,
                activeCount: activeUsersCount.count,
                avgCount
            }, 0, 'ok');
        } catch (e) {
            console.log(e);

            ctx.status = 200;
            ctx.body = 'err'
        }

    }

    @request("post", "/userStatistics")
    @summary("get user statistics")
    public static async getUserStatistics(ctx: Context): Promise<void> {
        try {
            // get user info from token
            const xtoken = ctx.headers['x-token']
            const btoken = Array.isArray(xtoken) ? xtoken[0] : xtoken

            const payload = jwt.verify(btoken, config.jwtSecret)

            const id = (payload as any).id;
            if (id) {
                const userRepository: Repository<User> = getManager().getRepository(User);
                const user: User | undefined = await userRepository.findOne(id);
                let signupDate;
                if (user) {
                    signupDate = user.createTime
                }
                const userRecordRepository: Repository<UserRecord> = getManager().getRepository(UserRecord);
                const loginCount = await userRecordRepository.count({
                    where: { uid: id }
                })

                let latestOne = await userRecordRepository.findOne({
                    where: [{ uid: id }],
                    order: { id: 'DESC' }
                });

                const obj = {
                    signupDate,
                    loginCount,
                    lastLoginDate: latestOne.createTime
                }

                ctx.status = 200;
                ctx.body = responseFormat.set(obj, 0, 'ok');
            }
        } catch (e) {
            console.log(e);

            ctx.status = 500;
            ctx.body = 'error';
        }

    }


    @request("get", "/auth/google/{googleCredential}")
    @summary("google login")
    @path({
        googleCredential: { type: "string", required: true, description: "googleCredential" }
    })
    public static async googleLogin(ctx: Context): Promise<void> {
        //1、通过google服务验证登录信息，包括有效期等等
        const googleCredential = ctx.params.googleCredential
        const { credential, clientId } = JSON.parse(googleCredential)
        const client = new OAuth2Client(clientId)
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: clientId // Specify the CLIENT_ID of the app that accesses the backend
            })
            const { payload } = ticket
            return payload
        }
        const data = await verify().catch()
        //2、处理登录。包括旧用户关联，新用户注册
        //3、页面跳转
        ctx.status = 200;
        ctx.body = data
    }


    @request("get", "/user/info")
    @summary("get use info")
    public static async getUserInfo(ctx: Context): Promise<void> {
        const xtoken = ctx.headers['x-token']
        const btoken = Array.isArray(xtoken) ? xtoken[0] : xtoken

        const payload = jwt.verify(btoken, config.jwtSecret)

        const id = (payload as any).id;
        let user: User | undefined
        if (id) {
            const userRepository: Repository<User> = getManager().getRepository(User);
            user = await userRepository.findOne(id);

        }
        ctx.status = 200;
        ctx.body = responseFormat.set({
            roles: ['admin'],
            introduction: 'I am a super administrator',
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            name: 'Super Admin',
            user: {
                email: user.email,
                name: user.name,
                id: user.id,
            }
        }, 0, 'ok');
    }
}
