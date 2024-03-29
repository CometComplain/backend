import AsyncHandler from "express-async-handler";
import { Complaint, statusMap } from "../models/complaintModel.js";
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


// const getId = async (complaint) => {
//   const nanoid = customAlphabet("0123456789", 10);
//   // todo: tobe chanced accordingly to the id generating scheme
//   const id = nanoid();
//   return id;
// };

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
export const RegisterComplaint = AsyncHandler(async (req, res) => {
  try {
    if (!req.body.data) {
      console.log("No data is coming from req.body");
      return res.status(400);
    }
    const data = JSON.parse(req.body.data); 
    const { complaint :complaintData } =  data
    const { id } = req.user;
  
    const hash = await getComplaintHash(complaintData);
    const complaintId = req.body.complaintId;
    const formattedComplaint = {
        ...complaintData,
        createdBy: id,
        complaintHash: hash,
        complaintId,
    };
    console.log(formattedComplaint);
    const createdComplaint = await Complaint.create(formattedComplaint);
    await User.updateOne(
        {
            googleId: id,
            userType: UserTypes.Complainant,
        },
        {
            $inc: { noOfComplaints: 1 },
        }
    );
    return res.status(200).json({
        status: "success",
        message: "Complaint registered successfully",
        id: createdComplaint.complaintId,
    });
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
    complaints = await Complaint.find({ createdBy: user._id }).sort({createdAt: -1}).skip(pageSize * (page - 1)).limit(pageSize);
  }
  else if (suburl === "Verifier") {
    complaints = await Complaint.find({ status: statusMap.pending }).sort({createdAt: 1}).skip(pageSize * (page - 1)).limit(pageSize);
  }
  else if (suburl === "Technician") {
    complaints = await Complaint.find({ status: statusMap.verified, ComplaintType: user.domain}).sort({createdAt: 1}).skip(pageSize * (page - 1)).limit(pageSize);
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

// To Delete the Complaint
export const DeleteComplient = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const complaint = await Complaint.findByIdAndDelete({ complaintId });

  if(!complaint) throw new Error("Complaint Not Found")
  res.status(200).json({
    status:"success",
    message:"Succesfully Deleted"
  });
});

//to make isSloved boolean to true. this is done by technician
export const SolveCompliant = AsyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const solvedComplaint = await Complaint.findOne({complaintId});
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

//to make isVerified boolean to true. this is done by Verifier and we will give a id for complient after verifing the compliant
export const verifyCompliant = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const result = await Complaint.updateOne(
    { complaintId },
    { status: statusMap.verified },
    { new: true }
  );

  result.modifiedCount === 1 ? res.status(200).json({
    status: "success",
    message: "sucessfully updates the status of the Complaint",
  }) : res.status(401).json({
    status:"failed",
    message:"No compliant Modified"
  })
});

//Get the compliant detail
export const GetCompliantDetail = AsyncHandler(async (req, res) => {
  const  { complaintId }  = req.body;
  const complaint = await Complaint.findById({complaintId});
  res.status(200).json(complaint);
});

//Get the Unverfied compliant details for verfiers
export const GetUnverfiedCompliantsData = AsyncHandler(async (req, res) => {

  const unverifiedComplaints = await Complaint.find({ status: statusMap.pending });
  res.json(unverifiedComplaints);
  
});

//Get the verfied compliant for technicians and particular type of technician
export const GetVerifiedCompliantsData = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const technician = await User.findOne({ googleId: id });
  const ComplainantType = technician.domain
  const verifyComplaint = await Complaint.find({
    status:statusMap.verified,
    compliantType: ComplainantType,
  });
  res.status(200).json(verifyComplaint);
});

// Get solved compliants
export const GetSolvedCompliantsData = AsyncHandler(async (req, res) => {
  const solvedComplaint = await Complaint.find({
    status:statusMap.solved
  });
  res.json(solvedComplaint);
});

// This function is used to get the compliants of particular user
export const GetUserCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findOne({ googleId: id });
  const complaintsdata = await Complaint.find({ createdBy: user._id });
  req.json(complaintsdata);
});

// This function is used to get the solved compliants of particular user
export const GetUserSolvedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Complaint.find({
    createdBy: id,
    status:statusMap.solved
  });
  res.status(200).json(complaintsdata);
});

// This function is used to get the verified compliants of particular user
export const GetUserverifiedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Complaint.find({
    createdBy: id,
    status:statusMap.verified
  });
  res.status(200).json(complaintsdata);
});

// This function is used to get the Unsolved compliants of particular user
export const GetUserUnsolvedCompliants = AsyncHandler(async (req, res) => {
  const { id } = req.user;
  const complaintsdata = await Complaint.find({
    createdBy: id,
    status: statusMap.accepted
  });
  res.status(200).json(complaintsdata);
});

//this function is used to accept the Complaint
export const acceptComplaint = AsyncHandler(async (req,res)=>{
    const { complaintId } = req.body
    const { id } = req.user
    const foundUser = await User.find({googleId:id})
    const AcceptedComplaint = await Complaint.findOneAndUpdate({complaintId},{status:2,accepytedBy:foundUser._id})
    if(!foundUser) throw new Error("Please Login")
    if(!AcceptedComplaint) throw new Error("Complaint Not Found")
    res.status(200).json({
      status:"success",
      message:"successfully accepted"
    })
})
