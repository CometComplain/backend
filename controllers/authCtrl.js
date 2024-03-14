import passport from "passport";
import { User }  from "../models/Usermodel.js";
import AsyncHandler from "express-async-handler";
import { OAuth2Client } from 'google-auth-library';
import dotenv from "dotenv";
dotenv.config();

export const Userauth = passport.authenticate('google', { scope: [ 'email', 'profile' ] });

export const UserCallBack = passport.authenticate('google', {
    successRedirect: '/api/v1/auth/protected',
    failureRedirect: '/api/v1/auth/failure'
});

export const UserSuccessLog = ((req,res)=>{
    console.log(req.user);
        const name = req.user.displayName;
        res.json({
            success:true,
            message:`hello ${name}`
        })
})

export const UserfailureLog = ((req,res)=>{
    res.json({
        success:false,
        message:"somthing went wrong,please try again"
    })
})
//User Logout
export const UserLogout = ((req, res) => {
    req.logout(() => {
        req.session.destroy(err => {
            if(err) {
                return res.json({ success: false, message: "Could not log out, please try again" });
            } else {
                res.clearCookie('connect.sid')
                res.redirect('/api/v1/auth/login')
            }
        });
    });
});

//Login check 
export const    isLoggedin = ((req,res,next)=>{
    req.user ? next():res.sendStatus(401)
})

//Block User by admin
export const BlockUser = AsyncHandler(async(req,res)=>{
    const id = req.params.id
    const user =  await User.findOne({googleId:id})
    if(!user){
        throw new Error("Invalid Id. Please try Again!")
    }
    user.IsBlock = true;
    await user.save();
    res.json(user)
})

//Unblock User by admin
export const unblockUser = AsyncHandler(async(req,res)=>{
    const { id } = req.params
    const user = await User.findOne({googleId:id})
    if(!user){
        throw new Error("Invalid Id,Please try Again!")
    }
    user.IsBlock = false;
    await user.save();
    res.json(user)
})

//User Information access by admin
export const getUser = AsyncHandler(async(req,res)=>{
    const { id } = req.params
    const user = await User.findOne({googleId:id})
    if(!user){
        throw new Error("Invalid Id,Please try Again!")
    }
    res.json(user);
})

//All User Information access by admin
export const getAllUsers = AsyncHandler(async(req,res)=>{
    console.log(req.user);
    const users = await User.find();
    res.json(users)
})