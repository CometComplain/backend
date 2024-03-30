import AsyncHandler from "express-async-handler";
import { Complaint, statusMap } from "../models/complaintModel.js";
import { customAlphabet } from "nanoid";
import { User, UserTypes } from "../models/UserModel.js";
import crypto from "crypto";
import router from "../routers/complaintRoute.js";
import { format } from "path";

/*
complaint from frontend format = {
    title: String,
    description: String,
    mobile: String,
    ComplaintType: String,
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
    ComplaintType: String,
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



const getComplaintHash = async (complaint) => {
  const hash = crypto.createHash("sha256");
  const complaintString = JSON.stringify(complaint);
  hash.update(complaintString);
  const complaintHash = hash.digest("hex");
  const foundComplaint = await Complaint.findOne({ complaintHash });
  if (foundComplaint) {
    throw new Error("Complaint already exists");
  }
  return complaintHash;
};

//  To Register the Complaint
export const RegisterComplaint = AsyncHandler(async (req,res,next) => {
  try {
    const data = JSON.parse(req.body.data)
  const { complaint } = data;
  const { id } = req.user;

  // const user = await User.findOne({googleId: id});

  const hash = await getComplaintHash(complaint);
  const {complaintId} = req.body

  const formattedComplaint = {
      ...complaint,
      createdBy: id,
      complaintHash: hash,
      complaintId
};

  const createdComplaint = await Complaint.create(formattedComplaint);
  const user = await User.findOneAndUpdate(
      {
          googleId: id,
          userType: UserTypes.Complainant,
      },
      {
          $inc: { noOfComplaints: 1 },
      }
    );
    res.status(200).json({
      status: "success",
      message: "Complaint registered successfully",
      id: createdComplaint.complaintId,
  });
    next();
  } catch (error) {
    console.log(error);
    throw error
  }
  
});

// testing
// export const RegisterComplaint = AsyncHandler(async (req, res) => {
//   console.log(req.body);
//   res.json({
//     status: "success",
//     comp: req.complaint,
//   });
// });




// export const fileUpload = AsyncHandler(async (req, res) => {
//   try {
//     if (!req.files || !req.files.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }
//     const file = req.files.file;
//     const fileName = file.name;
//     const tempFilePath = `temp/${fileName}`; // Specify the path to your temporary directory
//     await file.mv(tempFilePath); // Save the file to the temporary directory

//     res.status(200).json({
//       message: "File saved successfully",
//       filePath: tempFilePath,
//       staus: "success",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// To Delete the Complaint
export const DeleteComplient = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  await Complaint.deleteOne({ complaintId });

  if(!Complaint) throw new Error("Complaint Not Found")
  res.status(200).json({
    status:"success",
    message:"Succesfully Deleted"
  });
});

//to make isSloved boolean to true. this is done by technician
export const SolveComplaint = AsyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { id } = req.user
  const user = await User.findOne({googleId:id})
  if(user.role)
  // const solvedComplaint = await Complaint.findOne({complaintId});
  if (solvedComplaint && solvedComplaint.status === 2) {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      {complaintId},
      { status: statusMap.solved },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      message:"Succesfully Solved"
    })
  } else {
    throw new Error("complaint is not found or not verified");
  }
});

//to make isVerified boolean to true. this is done by Verifier and we will give a id for complient after verifing the Complaint
export const verifyComplaint = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const Complaint = await Complaint.findOneAndUpdate(
    { complaintId },
    { status: statusMap.verified },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "sucessfully updates the status of the Complaint",
  });
});



//this function is used to accept the Complaint
export const acceptComplaint = AsyncHandler(async (req,res)=>{
    const { complaintId } = req.body
    const { id } = req.user
    const foundUser = await User.find({googleId:id})
    req.body = foundUser;
    const AcceptedComplaint = await Complaint.findOneAndUpdate({complaintId},{status:2,accepytedBy:foundUser._id})
    if(!foundUser) throw new Error("Please Login")
    if(!AcceptedComplaint) throw new Error("Complaint Not Found")
    res.status(200).json({
      status:"success",
      message:"successfully accepted"
    })
})
