import express from "express";
import { CatchError } from "../middlewares/CatchError.js";
import {
  CheckRole,
  TechnicianRole,
  isLoggedin,
} from "../middlewares/authMiddleware.js";
import {
  DeleteComplient,
  GetCompliantDetail,
  GetUnverfiedCompliantsData,
  GetUserCompliants,
  GetVerifiedCompliantsData,
  RegisterCompliant,
  SolveCompliant,
  verifyCompliant,
} from "../controllers/compliantCtrl.js";
import { upload } from "../middlewares/uploadfile.js";

const router = express.Router();
//get request
router.get(
  "/getcompliants",
  isLoggedin,
  CheckRole("admin"),
  CatchError(GetCompliantDetail)
);
router.get(
  "/getunverfieddata",
  isLoggedin,
  CheckRole("verifier"),
  CatchError(GetUnverfiedCompliantsData)
);
router.get(
  "/getverfieddata",
  isLoggedin,
  TechnicianRole,
  CatchError(GetVerifiedCompliantsData)
);
router.get(
  "/verify/:id",
  isLoggedin,
  CheckRole("verifier"),
  CatchError(verifyCompliant)
);
router.get(
  "/solve/:id",
  isLoggedin,
  TechnicianRole,
  CatchError(SolveCompliant)
);
router.get("/getusercompliants", isLoggedin, GetUserCompliants);
//post request
//include this method in input file tag: enctype="multipart/form-data"
//upload.single('write the name of the upload input tag here')
router.post("/register", isLoggedin,CatchError(RegisterCompliant));

//delete request
router.delete("/delete/:id", isLoggedin, CatchError(DeleteComplient));

//put request

export default router;
