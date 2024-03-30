import express from "express";
import { CatchError } from "../middlewares/CatchError.js";
import { CheckRole, isLoggedin } from "../middlewares/authMiddleware.js";
import {
  acceptComplaint,
  DeleteComplient,
  fileUpload,
  getComplaints,
  GetComplaintDetail,
  // GetComplaintDetail,
  // GetUnverfiedComplaintsData,
  // GetUserComplaints,
  // GetVerifiedComplaintsData,
  RegisterComplaint,
  SolveComplaint,
  verifyComplaint,
} from "../controllers/complaintCtrl.js";

import { uploadFileToCloudinary } from "../middlewares/uploadfile.js";
import { generateComplaintId } from "../middlewares/getComplaintId.js";
const router = express.Router();

//get request
// router.get("/getComplaints", isLoggedin, CheckRole("admin"), CatchError(GetComplaintDetail));

router.get("/complaints/:suburl", isLoggedin, CatchError(getComplaints));

router.get(
  "/complaintWithId/:complaintId",
  isLoggedin,
  CatchError(GetComplaintDetail)
);

// router.get("/getunverfieddata", isLoggedin, CheckRole("verifier"), CatchError(GetUnverfiedComplaintsData));

// router.get("/getverfieddata", isLoggedin, TechnicianRole, CatchError(GetVerifiedComplaintsData));

router.post("/verify", isLoggedin, CatchError(verifyComplaint));

router.post("/solve", isLoggedin, CatchError(SolveComplaint));
// router.post("/reject", isLoggedin, CatchError(rejectComplaint));
router.post("/accept", isLoggedin, CatchError(acceptComplaint));

// router.get("/getuserComplaints", isLoggedin, GetUserComplaints);
//post request
//include this method in input file tag: enctype="multipart/form-data"
// upload.single('write the name of the upload input tag here')
router.post(
  "/register",
  isLoggedin,
  generateComplaintId,
  uploadFileToCloudinary,
  CatchError(RegisterComplaint)
);

//delete request
router.delete("/delete", isLoggedin, CatchError(DeleteComplient));

//put request

export default router;
