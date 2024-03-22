import AsyncHandler from "express-async-handler";
import { Compliant, statusMap } from "../models/complaintModel.js";
import { customAlphabet } from "nanoid";
import { User } from "../models/UserModel.js";
import crypto from "crypto";
import router from "../routers/complientRoute.js";

const nanoid = customAlphabet("0123456789", 10);

/*
complaint from frontend format = {
    title: String,
    description: String,
    mobile: String,
    compliantType: String,
    location: {
        buildingName: String,
        roomNo: String,
        floorNo: String,
    },
}
*/
/*
complaint format = {
    complaintId: String,
    title: String,
    description: String,
    mobile: String,
    compliantType: String,
    location: {
        buildingName: String,
        roomNo: String,
        floorNo: String,
    },
    status: String,
    ceratedBy: String,
    accepytedBy: String,
}
*/

const getId = async (complaint) => {
  const id = nanoid();
};

const checkUniqueComplaint = async (complaint) => {
  const hash = crypto.createHash("sha256");
  const complaintString = JSON.stringify(complaint);
  hash.update(complaintString);
  const complaintHash = hash.digest("hex");

  const foundComplaint = await Compliant.findOne({ complaintHash });
  if (!foundComplaint) {
    return [false, complaintHash];
  }
  return [true, complaintHash];
};

//  To Register the compliant
export const RegisterCompliant = AsyncHandler(async (req, res) => {
  // const { id, complaint } = req.body;
  // const user = await User.findById(id);
  // const [isUniqueComplaint, hash] = checkUniqueComplaint(complaint);
  // if(isUniqueComplaint){
  //     throw new Error("Complaint already registered");
  // }

  // const complaintId = getId(complaint);
  // const createdComplaint = await Compliant.create({
  //     ...complaint,
  //     createdBy: user._id,
  // });
  // console.log('::registered a complaint : ', createdComplaint);
  // res.json({
  //     status: "success",
  //     message: "Complaint registered successfully",
  //     id: createdComplaint._id,
  // });
  console.log(req.body);
  res.json({
    status: "success",
    comp: req.complaint,
  });
});



export const fileUpload = AsyncHandler(async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const file = req.files.file;
    const fileName = file.name;
    const tempFilePath = `temp/${fileName}`; // Specify the path to your temporary directory
    await file.mv(tempFilePath); // Save the file to the temporary directory

    res
      .status(200)
      .json({
        message: "File saved successfully",
        filePath: tempFilePath,
        staus: "success",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// To Delete the compliant
export const DeleteComplient = AsyncHandler(async (req, res) => {
  const { id } = req.body;
  const compliant = await Compliant.findByIdAndDelete({ _id: id });
  res.json(compliant);
});

//to make isSloved boolean to true. this is done by technician
export const SolveCompliant = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const solvedCompliant = await Compliant.findById(id);
  if (solvedCompliant && solvedCompliant.isVerified) {
    const updatedCompliant = await Compliant.findByIdAndUpdate(
      id,
      { isSolved: true },
      { new: true }
    );
    res.json(updatedCompliant);
  } else {
    throw new Error("complaint is not found or not verified");
  }
});

//to make isVerified boolean to true. this is done by Verifier and we will give a id for complient after verifing the compliant
export const verifyCompliant = AsyncHandler(async (req, res) => {
  const { complaintId: id } = req.body;
  console.log(req.body);
  const compliant = await Compliant.findOneAndUpdate(
    id,
    { status: statusMap.verified },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "sucessfully updates the status of the compliant",
  });
});

//Get the compliant detail
export const GetCompliantDetail = AsyncHandler(async (req, res) => {
  const { id } = req.body;
  const compliant = await Compliant.findById(id);
  res.json(compliant);
});

//Get the Unverfied compliant details for verfiers
export const GetUnverfiedCompliantsData = AsyncHandler(async (req, res) => {
  const unverifiedComplaints = await Compliant.find({ isVerified: false });
  res.json(unverifiedComplaints);
});

//Get the verfied compliant for technicians and particular type of technician
export const GetVerifiedCompliantsData = AsyncHandler(async (req, res) => {
  const id = req.user.id;
  const technician = await User.findOne({ googleId: id });
  const type = technician.role.split(" ")[0];
  const verifyCompliant = await Compliant.find({
    isVerified: true,
    isSolved: false,
    compliantType: type,
  });
  res.json(verifyCompliant);
});

// Get solved compliants
export const GetSolvedCompliantsData = AsyncHandler(async (req, res) => {
  const solvedCompliant = await Compliant.find({
    isVerified: true,
    isSolved: true,
  });
  res.json(solvedCompliant);
});

// This function is used to get the compliants of particular user
export const GetUserCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findOne({ googleId: id });
  const complaintsdata = await Compliant.find({ createdBy: user._id });
  req.json(complaintsdata);
});

// This function is used to get the solved compliants of particular user
export const GetUserSolvedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Compliant.find({
    userId: id,
    isSolved: true,
    isVerified: true,
  });
  req.json(complaintsdata);
});

// This function is used to get the verified compliants of particular user
export const GetUserverifiedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Compliant.find({
    userId: id,
    isSolved: false,
    isVerified: true,
  });
  req.json(complaintsdata);
});

// This function is used to get the Unsolved compliants of particular user
export const GetUserUnsolvedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Compliant.find({
    userId: id,
    isSolved: false,
    isVerified: false,
  });
  req.json(complaintsdata);
});
