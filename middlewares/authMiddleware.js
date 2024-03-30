import AsyncHandler from "express-async-handler";
import { User } from "../models/UserModel.js";

//Login check 
export const isLoggedin = ((req,res,next)=>{
    req.user ? next() : res.sendStatus(401)
})


// this function is used to check the role
export const CheckRole = (role) => {
    return AsyncHandler(async(req, res, next) => {
        const { id } = req.user;
        const foundUser = await User.findOne({googleId: id});
        if(!foundUser) throw new Error("User Not found")
        if(foundUser.role === role){
            req.queriedUser = foundUser;
            next()
        } else {
            throw new Error("forbidden")
        }
    })
}

// this function is used to check whether the role is technician or not
// export const TechnicianRole = AsyncHandler(async(req,res,next)=>{
//     const { id } = req.user;
//     const foundUser = await User.findOne({googleId: id});
//     if (!foundUser) {
//         throw new Error("User not found");
//     }
//     const techRole = foundUser.role.split(" ")[1];
//     if(techRole === "technician"){
//         next();
//     } else {
//         throw new Error("Forbidden");
//     }
// });
