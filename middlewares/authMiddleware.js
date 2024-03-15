import AsyncHandler from "express-async-handler";
import { User } from "../models/Usermodel.js";

//Login check 
export const isLoggedin = ((req,res,next)=>{
    req.user ? next():res.sendStatus(401)
})


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
