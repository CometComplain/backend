import express from "express";
import {
    BlockUser,
    getAllUsers,
    getUser,
    pingUser,
    unblockUser,
    Userauth,
    UserCallBack,
    UserfailureLog,
    UserLogout,
    UserSuccessLog
} from "../controllers/authCtrl.js";
import { GoogleAuth } from "../config/goggleauth.js";
import dotenv from 'dotenv';
import { CatchError } from "../middlewares/CatchError.js";
import { CheckRole, isLoggedin } from "../middlewares/authMiddleware.js";
dotenv.config();
const router = express.Router();
GoogleAuth();

router.get("/login",(req,res)=>{
    console.log(req.originalUrl);
    res.send('<a href="/grievance/auth/google">Authenticate with Google</a>')
})

router.get('/google',CatchError(Userauth));
router.get('/google/callback',CatchError(UserCallBack));
router.get('/logout',isLoggedin,CatchError(UserLogout));
router.get('/getuser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(getUser));
router.get('/pingUser', CatchError(pingUser));
router.get('/getalluser',isLoggedin,CatchError(CheckRole("admin")),CatchError(getAllUsers));
router.put('/blockUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(BlockUser));
router.put('/unblockUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(unblockUser));

export default router;