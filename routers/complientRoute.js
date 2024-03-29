import express from "express";
import { CatchError } from "../middlewares/CatchError.js";
import { CheckRole, isLoggedin } from "../middlewares/authMiddleware.js";
import {
  acceptComplaint,
  DeleteComplient,
  fileUpload,
  getComplaints,
  GetCompliantDetail,
  // GetCompliantDetail,
  // GetUnverfiedCompliantsData,
  // GetUserCompliants,
  // GetVerifiedCompliantsData,
  RegisterComplaint,
  SolveCompliant,
  verifyCompliant,
} from "../controllers/compliantCtrl.js";

import { upload } from "../middlewares/uploadfile.js";
import { generateComplaintId } from "../middlewares/getCompliantId.js";
const router = express.Router();

//get request
// router.get("/getcompliants", isLoggedin, CheckRole("admin"), CatchError(GetCompliantDetail));

router.get("/complaints/:suburl", isLoggedin, CatchError(getComplaints));

router.get(
  "/complaintWithId/:complaintId",
  isLoggedin,
  CatchError(GetCompliantDetail)
);

// router.get("/getunverfieddata", isLoggedin, CheckRole("verifier"), CatchError(GetUnverfiedCompliantsData));

// router.get("/getverfieddata", isLoggedin, TechnicianRole, CatchError(GetVerifiedCompliantsData));

router.post("/verify", isLoggedin, CatchError(verifyCompliant));

router.post("/solve", isLoggedin, CatchError(SolveCompliant));
// router.post("/reject", isLoggedin, CatchError(rejectCompliant));
router.post("/accept", isLoggedin, CatchError(acceptComplaint));

// router.get("/getusercompliants", isLoggedin, GetUserCompliants);
//post request
//include this method in input file tag: enctype="multipart/form-data"
// upload.single('write the name of the upload input tag here')
router.post(
  "/register",
  isLoggedin,
  generateComplaintId,
  CatchError(RegisterComplaint)
);

//delete request
router.delete("/delete", isLoggedin, CatchError(DeleteComplient));

//put request

export default router;
