import express from "express";
import { RegisterUser } from "../controllers/authCtrl.js";

const router = express.Router();

router.get("/",(req,res)=>{
    res.send("hello")
})
router.post("/",RegisterUser)


export default router;