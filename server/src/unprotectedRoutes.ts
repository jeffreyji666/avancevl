import Router from "@koa/router";
import { general } from "./controller";
import { user } from "./controller";

const unprotectedRouter = new Router();

// Hello World route
unprotectedRouter.get("/", general.helloWorld);
// unprotectedRouter.get("/sendmail", user.sendmail);
unprotectedRouter.post("/register", user.register);
unprotectedRouter.post("/login", user.login);
unprotectedRouter.get("/verify/:id/:token", user.verifyUser);


export { unprotectedRouter };