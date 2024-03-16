import AsyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";

//Login check 
export const isLoggedin = ((req,res,next)=>{
    req.user ? next():res.sendStatus(401)
})


export const CheckRole = (role) => {
    return AsyncHandler(async(req, res, next) => {
        const { id } = req.user;
        const foundUser = await User.findOne({googleId: id})
        if(!foundUser) throw new Error("User Not found")
        if(foundUser.role === role){
            next()
        } else {
            throw new Error("forbidden")
        }
    })
}
export const TechnicianRole = AsyncHandler(async(req,res,next)=>{
    const { id } = req.user;
    const foundUser = await User.findOne({googleId: id});
    if (!foundUser) {
        throw new Error("User not found");
    }
    const techRole = foundUser.role.split(" ")[1];
    if(techRole === "technician"){
        next();
    } else {
        throw new Error("Forbidden");
    }
});
