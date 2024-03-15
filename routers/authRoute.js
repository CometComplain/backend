import express from "express";
import { BlockUser, getAllUsers, getUser, isLoggedin, unblockUser, Userauth, UserCallBack, UserfailureLog, UserLogout, UserSuccessLog } from "../controllers/authCtrl.js";
import { GoogleAuth } from "../config/goggleauth.js";
import dotenv from 'dotenv';
import { CatchError } from "../middlewares/CatchError.js";
import { CheckRole } from "../middlewares/authMiddleware.js";
dotenv.config();
const router = express.Router();
GoogleAuth();

router.get("/auth/login",(req,res)=>{
    res.send('<a href="/api/v1/auth/google">Authenticate with Google</a>')
})

router.get('/google',CatchError(Userauth));
router.get('/google/callback',CatchError(UserCallBack));
router.get('/protected', isLoggedin, CatchError(UserSuccessLog));
router.get('/failure',CatchError(UserfailureLog));
router.get('/logout',isLoggedin,CatchError(UserLogout));
router.get('/getUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(getUser));
router.get('')
router.get('/getalluser',isLoggedin,CatchError(CheckRole("admin")),CatchError(getAllUsers));
router.put('/blockUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(BlockUser));
router.put('/unblockUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(unblockUser));


export default router;