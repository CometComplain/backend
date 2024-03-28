import AsyncHandler from "express-async-handler";
import { Compliant, statusMap } from "../models/complaintModel.js";
import { customAlphabet } from "nanoid";
import { User } from "../models/UserModel.js";
import crypto from "crypto";
import router from "../routers/complientRoute.js";
import { format } from "path";


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
  const nanoid = customAlphabet("0123456789", 10);
  // todo: tobe chanced accordingly to the id generating scheme
  const id = nanoid();
  return id;
};

const getComplaintHash = async (complaint) => {
  const hash = crypto.createHash("sha256");
  const complaintString = JSON.stringify(complaint);
  hash.update(complaintString);
  const complaintHash = hash.digest("hex");
  const foundComplaint = await Compliant.findOne({ complaintHash });
  if (foundComplaint) {
    throw new Error("Complaint already exists");
  }
  return complaintHash;
};

//  To Register the compliant
export const RegisterComplaint = AsyncHandler(async (req, res) => {
  const { complaint } = req.body;
  const { id } = req.user;

  // const user = await User.findOne({googleId: id});

  const hash = await getComplaintHash(complaint);
  const complaintId = await getId(complaint);

  const formattedComplaint = {
      ...complaint,
      createdBy: id,
      complaintHash: hash,
      complaintId,
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
  console.log(user);
  return res.status(200).json({
      status: "success",
      message: "Complaint registered successfully",
      id: createdComplaint.complaintId,
  });
});

// testing
// export const RegisterCompliant = AsyncHandler(async (req, res) => {
//   console.log(req.body);
//   res.json({
//     status: "success",
//     comp: req.complaint,
//   });
// });


const pageSize = 10;

export const getComplaints = AsyncHandler(async (req, res) => {
  const { suburl } = req.params;
  const { type, page } = req.query;
  console.log("-------------------> debug <-------------------");
  console.log(suburl);
  console.log(type);
  console.log(page);
  console.log("-----------------------------------------------");
  const user = await User.findOne({ googleId: req.user.id });
  let complaints;
  if (suburl === "Complainant") {
    complaints = await Compliant.find({ createdBy: user._id }).sort({createdAt: -1}).skip(pageSize * (page - 1)).limit(pageSize);
  }
  else if (suburl === "Verifier") {
    complaints = await Compliant.find({ status: statusMap.pending }).sort({createdAt: 1}).skip(pageSize * (page - 1)).limit(pageSize);
  }
  else if (suburl === "Technician") {
    complaints = await Compliant.find({ status: statusMap.verified, compliantType: user.domain}).sort({createdAt: 1}).skip(pageSize * (page - 1)).limit(pageSize);
  }
  else {
    complaints = [];
  }
  return complaints.length === pageSize ? res.json({ complaints, nextPage: page + pageSize }) : res.json({ complaints });
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

    res.status(200).json({
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
  const { complaintId } = req.body;
  const compliant = await Compliant.findByIdAndDelete({ complaintId });

  if(!compliant) throw new Error("Compliant Not Found")
  res.status(200).json({
    status:"success",
    message:"Succesfully Deleted"
  });
});

//to make isSloved boolean to true. this is done by technician
export const SolveCompliant = AsyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const solvedCompliant = await Compliant.findOne({complaintId});
  if (solvedCompliant && solvedCompliant.status === 2) {
    const updatedCompliant = await Compliant.findByIdAndUpdate(
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

//to make isVerified boolean to true. this is done by Verifier and we will give a id for complient after verifing the compliant
export const verifyCompliant = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const compliant = await Compliant.findOneAndUpdate(
    { complaintId },
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
  const  { complaintId }  = req.body;
  const compliant = await Compliant.findById({complaintId});
  res.status(200).json(compliant);
});

//Get the Unverfied compliant details for verfiers
export const GetUnverfiedCompliantsData = AsyncHandler(async (req, res) => {

  const unverifiedComplaints = await Compliant.find({ status: statusMap.pending });
  res.json(unverifiedComplaints);
  
});

//Get the verfied compliant for technicians and particular type of technician
export const GetVerifiedCompliantsData = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const technician = await User.findOne({ googleId: id });
  const ComplainantType = technician.domain
  const verifyCompliant = await Compliant.find({
    status:statusMap.verified,
    compliantType: ComplainantType,
  });
  res.status(200).json(verifyCompliant);
});

// Get solved compliants
export const GetSolvedCompliantsData = AsyncHandler(async (req, res) => {
  const solvedCompliant = await Compliant.find({
    status:statusMap.solved
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
    createdBy: id,
    status:statusMap.solved
  });
  res.status(200).json(complaintsdata);
});

// This function is used to get the verified compliants of particular user
export const GetUserverifiedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Compliant.find({
    createdBy: id,
    status:statusMap.verified
  });
  res.status(200).json(complaintsdata);
});

// This function is used to get the Unsolved compliants of particular user
export const GetUserUnsolvedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Compliant.find({
    createdBy: id,
    status: statusMap.accepted
  });
  res.status(200).json(complaintsdata);
});

//this function is used to accept the compliant
export const acceptComplaint = AsyncHandler(async (req,res)=>{
    const { complaintId } = req.body
    const { id } = req.user
    const foundUser = await User.find({googleId:id})
    req.body = foundUser;
    const AcceptedCompliant = await Compliant.findOneAndUpdate({complaintId},{status:2,accepytedBy:foundUser._id})
    if(!foundUser) throw new Error("Please Login")
    if(!AcceptedCompliant) throw new Error("Compliant Not Found")
    res.status(200).json({
      status:"success",
      message:"successfully accepted"
    })
})
