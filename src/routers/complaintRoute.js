import express from "express";
import { CheckRole, isLoggedin } from "../middlewares/authMiddleware.js";
import {
  acceptComplaint,
  DeleteCompliant, getComplaintWithId,
  RegisterComplaint, rejectComplaint,
  SolveComplaint,
  verifyComplaint,
} from "../controllers/complaintCtrl.js"

import { uploadFileToCloudinary } from "../middlewares/uploadfile.js";
import { CheckFileType } from "../middlewares/checkFileType.js";
import displayCounts from "../controllers/getCountCompliants.js"
import { getComplaints } from "../controllers/GetComplaintCtrl.js";
import {User, UserTypes} from "../models/UserModel.js";
import { GetNoOfComplaints } from "../controllers/GetTypeCoutComplaint.js";
import { CatchError } from "../middlewares/CatchError.js";
const router = express.Router();

//get request
// router.get("/getComplaints", isLoggedin, CheckRole("admin"), CatchError(GetComplaintDetail));

router.get("/complaints/:suburl", isLoggedin, CatchError(getComplaints));
router.get("/complaint/:complaintId", isLoggedin, CatchError(getComplaintWithId));
router.get("/complaintcount",isLoggedin,CheckRole(UserTypes.Admin),CatchError(GetNoOfComplaints))

// router.get(
//   "/complaintWithId/:complaintId",
//   isLoggedin,
//   CatchError(GetComplaintDetail)
// );

// router.get("/getunverfieddata", isLoggedin, CheckRole("verifier"), CatchError(GetUnverfiedComplaintsData));

// router.get("/getverfieddata", isLoggedin, TechnicianRole, CatchError(GetVerifiedComplaintsData));

router.post("/verify", isLoggedin, CheckRole(UserTypes.Verifier) ,CatchError(verifyComplaint));

router.post("/solve", isLoggedin, CheckRole(UserTypes.Technician),CatchError(SolveComplaint));
router.put("/reject", isLoggedin, CheckRole(UserTypes.Verifier),CatchError(rejectComplaint));
router.post("/accept", isLoggedin, CheckRole(UserTypes.Technician),CatchError(acceptComplaint));

// router.get("/getuserComplaints", isLoggedin, GetUserComplaints);
//post request
//include this method in input file tag: enctype="multipart/form-data"
// upload.single('write the name of the upload input tag here')
router.post(
  "/register",
  isLoggedin,
  CheckFileType,
  CatchError(RegisterComplaint),
  CatchError(uploadFileToCloudinary),
  
);

//delete request
router.delete("/delete", isLoggedin, CatchError(DeleteCompliant));

//put request

export default router;
