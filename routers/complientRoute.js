import express from "express"
import { CatchError } from "../middlewares/CatchError";
import { CheckRole } from "../middlewares/authMiddleware";
import { DeleteComplient, GetCompliantDetails, GetUnverfiedCompliantsData, GetVerifiedCompliantsData, RegisterCompliant, verifyCompliant } from "../controllers/compliantCtrl";
import { isLoggedin } from "../controllers/authCtrl.js";
import { upload } from "../middlewares/uploadfile";

const router = express.Router();

router.get('/getunverfiedcom',GetUnverfiedCompliantsData)
router.get('/getverfiedcompliants',GetVerifiedCompliantsData)
//include this method in input file tag: enctype="multipart/form-data"
router.post('/register',isLoggedin,upload.single('write the name of the upload input tag here'),CatchError(RegisterCompliant))
router.delete('/delete',isLoggedin,CatchError(DeleteComplient))
router.put('/verify',isLoggedin,CatchError(verifyCompliant))