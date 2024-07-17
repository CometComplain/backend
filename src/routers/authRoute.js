import express from "express";
import {
  BlockUser,
  createUser,
  getUsers,
  pingUser,
  unblockUser,
  Userauth,
  UserCallBack,
  UserLogout,
} from "../controllers/authCtrl.js";
import { CatchError } from "../middlewares/CatchError.js";
import { CheckRole, isLoggedin } from "../middlewares/authMiddleware.js";
import { UserTypes } from "../models/UserModel.js";
const router = express.Router();


// router.get("/login",(req,res)=>{
//     console.log(req.originalUrl);
//     res.send('<a href="/grievance/auth/google">Authenticate with Google</a>')
// })
router.get("/google", CatchError(Userauth));
router.get("/google/callback", CatchError(UserCallBack));
router.get("/logout", isLoggedin, CatchError(UserLogout));
// router.get('/getuser/:id',isLoggedin,CatchError(CheckRole("admin")),CatchError(getUser));
router.get("/pingUser", CatchError(pingUser));
// router.get('/getalluser',isLoggedin,CatchError(CheckRole("admin")),CatchError(getAllUsers));
router.put(
  "/blockUser/:id",
  isLoggedin,
  CatchError(CheckRole(UserTypes.Admin)),
  CatchError(BlockUser),
);
router.put(
  "/unblockUser/:id",
  isLoggedin,
  CatchError(CheckRole(UserTypes.Admin)),
  CatchError(unblockUser),
);
router.post(
  "/createUser",
  isLoggedin,
  CatchError(CheckRole(UserTypes.Admin)),
  CatchError(createUser),
);

router.get("/users/:suburl", isLoggedin, CatchError(getUsers));

export default router;