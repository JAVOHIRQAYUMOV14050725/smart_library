import { LoginRegisterController } from "@controllers";
import { Router } from "express";


const login_registerRouter = Router()

login_registerRouter.get("/login",LoginRegisterController.login)
login_registerRouter.get("/register",LoginRegisterController.register)
login_registerRouter.post("/refresh_token",LoginRegisterController.refreshToken)


export {login_registerRouter}