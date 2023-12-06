import express from "express";
import passport from "passport";
import { login, logout } from "../controllers/authController";
import checkAuthentication from "../middlewares/checkAuthentication";

const authRouter = express.Router();

authRouter.post("/login", passport.authenticate("local"), login);
authRouter.post("/logout", checkAuthentication, logout);

export default authRouter;
