import express from "express";
import {CatchError} from "../middlewares/CatchError.js";
import {CheckRole, isLoggedin,} from "../middlewares/authMiddleware.js";
import {
    acceptComplaint,
    DeleteComplaint,
    fileUpload,
    getComplaints, getCompliantDetail,
    // GetCompliantDetail,
    // GetUnverfiedCompliantsData,
    // GetUserCompliants,
    // GetVerifiedCompliantsData,
    RegisterCompliant,
    rejectCompliant,
    SolveCompliant,
    verifyCompliant,
} from "../controllers/compliantCtrl.js";

const router = express.Router();
//get request
// router.get("/getcompliants", isLoggedin, CheckRole("admin"), CatchError(GetCompliantDetail));


router.get('/complaints/:suburl', isLoggedin, CatchError(getComplaints));

router.get('/complaintWithId/:complaintId', isLoggedin, CatchError(getCompliantDetail));

// router.get("/getunverfieddata", isLoggedin, CheckRole("verifier"), CatchError(GetUnverfiedCompliantsData));

// router.get("/getverfieddata", isLoggedin, TechnicianRole, CatchError(GetVerifiedCompliantsData));

router.post("/verify", isLoggedin, CatchError(verifyCompliant));

router.post("/solve", isLoggedin, CatchError(SolveCompliant));
router.post("/reject", isLoggedin, CatchError(rejectCompliant));
router.post("/accept", isLoggedin, CatchError(acceptComplaint));

router.post("/upload", isLoggedin, fileUpload);

// router.get("/getusercompliants", isLoggedin, GetUserCompliants);
//post request
//include this method in input file tag: enctype="multipart/form-data"
// upload.single('write the name of the upload input tag here')

router.post("/register", isLoggedin, CatchError(RegisterCompliant));

//delete request
router.delete("/delete", isLoggedin, CatchError(DeleteComplaint));

//put request

export default router;
