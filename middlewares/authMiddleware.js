import AsyncHandler from "express-async-handler";
import { User } from "../models/Usermodel.js";

export const CheckRole = (role) => {
    return AsyncHandler(async(req, res, next) => {
        const { id } = req.user;
        const foundUser = await User.findOne({googleId: id})
        if(foundUser && foundUser.role === role){
            next()
        } else {
            throw new Error("forbidden")
        }
    })
}
