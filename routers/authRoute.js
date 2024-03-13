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

router.get('/auth/google',CatchError(Userauth));
router.get('/auth/google/callback',CatchError(UserCallBack));
router.get('/auth/protected', isLoggedin, CatchError(UserSuccessLog));
router.get('/auth/failure',CatchError(UserfailureLog));
router.get('/auth/logout',isLoggedin,CatchError(UserLogout));
router.get('/auth/getUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(getUser));
router.get('')
router.get('/auth/getalluser',isLoggedin,CatchError(CheckRole("admin")),CatchError(getAllUsers));
router.put('/auth/blockUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(BlockUser));
router.put('/auth/unblockUser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(unblockUser));


export default router;