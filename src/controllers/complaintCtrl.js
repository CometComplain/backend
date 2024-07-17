import AsyncHandler from "express-async-handler";
import { Complaint, statusMap } from "../models/complaintModel.js";
import { User, UserTypes } from "../models/UserModel.js";
import { GetComplaintId } from "../utils/getCompliantId.js";
import crypto from "crypto";
// import { format } from "path";
// import mongoose  from "mongoose";

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
    acceptedBy: String,
}
*/


const getComplaintHash = async (complaint) => {
  const hash = crypto.createHash("sha256");
  const complaintString = JSON.stringify(complaint);
  hash.update(complaintString);
  const complaintHash = hash.digest("hex");
  const foundComplaint = await Complaint.findOne({ complaintHash });
  // const foundComplaint = await Complaint.findOne({ complaintHash: complaintHash }, { session: transaction });
  if (foundComplaint) {
    throw new Error("Complaint already exists");
  }
  return complaintHash;
};

//  To Register the Complaint
export const RegisterComplaint = AsyncHandler(async (req,res,next) => {
  // const transaction = await mongoose.startSession();
  // transaction.startTransaction();
  // try {
    const data = JSON.parse(req.body.data)
    const { complaint } = data;
    const { id } = req.user;

    const hash = await getComplaintHash(complaint);
    const complaintId = GetComplaintId();
    req.body.complaintId = complaintId;

    const formattedComplaint = {
        ...complaint,
        createdBy: id,
        complaintHash: hash,
        complaintId
    };
  const createdComplaint = await Complaint.create(formattedComplaint);
  // const createdComplaint = await Complaint.create([formattedComplaint], { session: transaction });
  await User.updateOne(
  {
    googleId: id,
    userType: UserTypes.Complainant,
  },
  {
    $inc: { noOfComplaints: 1 },
  },
  // { session: transaction }
);
    res.status(200).json({
      status: "success",
      message: "Complaint registered successfully",
      id: createdComplaint.complaintId,
    });
    next();
  // } catch (error) {
  //   console.log(error);
  //   // await transaction.abortTransaction();
  //   throw new error;
  // }

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

const removeConfidentialProperties = (user) => {
  if (!user)  return user;
  delete user._id;
  delete user.__v;
  delete user.googleId;
}

export const getComplaintWithId = AsyncHandler(async (req, res, next) => {
  const { complaintId } = req.params;
  const complaint = await Complaint.findOne({ complaintId });
  if (!complaint) {
    throw new Error("Complaint not found");
  }
  const resComplaint = complaint.toObject();

  const createdBy = await User.findOne({ googleId: resComplaint.createdBy });

  removeConfidentialProperties(createdBy);
  delete resComplaint.createdBy;
  delete resComplaint.acceptedBy;

  const acceptedBy = resComplaint.acceptedBy ? await User.findOne({ googleId: resComplaint.acceptedBy }) : null;
  removeConfidentialProperties(acceptedBy);

  return acceptedBy ? res.status(200).json({
    complaint: resComplaint,
    createdBy: createdBy,
    acceptedBy: acceptedBy,
  }): res.status(200).json({
    complaint: resComplaint,
    createdBy: createdBy,
  });
});

export const rejectComplaint = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const { id } = req.user;
  const user = req.queriedUser;

  const result = await Complaint.updateOne({
    complaintId,
    status: statusMap.pending,
  }, {
    status: statusMap.rejected,
  });

  if (result.modifiedCount === 0) throw new Error("Complaint Not Found or Already Rejected");

  res.status(200).json({
    status: "success",
    message: "successfully updates the status of the Complaint",
  });
})

// To Delete the Complaint
export const DeleteCompliant = AsyncHandler(async (req, res) => {

    const { complaintId } = req.body;
    const { id } = req.user;
    const complaint = await Complaint.findOneAndDelete({ complaintId, createdBy: id });
    
    if(!complaint) throw new Error("Complaint Not deleted")
    
    const result = await User.updateOne({ googleId: id }, { $inc: { noOfComplaints: -1}}, {new: true});
    if(result.modifiedCount === 0) throw new Error("User Not Found");
    res.status(200).json({
    status:"success",
    message:"Successfully Deleted"
  });

});


//to make isSloved boolean to true. this is done by technician
export const SolveComplaint = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;
  const { id } = req.user;
  const user = req.queriedUser;

  const complaint = await Complaint.findOneAndUpdate({
    complaintId,
    acceptedBy: user._id,
    complaintType: user.domain,
    status: { $in: [statusMap.accepted, statusMap.verified] }
  },{
    status: statusMap.solved
  })

  if(!complaint) throw new Error("Complaint Not Found or Not Accepted");
  const result = await User.updateOne({ googleId: complaint.createdBy }, { $inc: { noOfComplaintsSolved: 1 }}, {new: true});
  if(result.modifiedCount === 0) throw new Error("User Not Found");

  res.status(200).json({
  status: "success",
  message: "sucessfully updates the status of the Complaint",
  });

});

//to make isVerified boolean to true. this is done by Verifier and we will give a id for complient after verifing the Complaint
export const verifyComplaint = AsyncHandler(async (req, res) => {
  const { complaintId } = req.body;

  const user = req.queriedUser;


  const result = await Complaint.updateOne({
    complaintId,
    status: statusMap.pending,
  },{
    status: statusMap.verified
  });
  if (result.modifiedCount === 0) throw new Error("Complaint Not Found or Already Verified");

  return res.status(200).json({
    status: "success",
    message: "successfully updates the status of the Complaint",
  });
});


//this function is used to accept the Complaint
export const acceptComplaint = AsyncHandler(async (req,res)=>{
    // console.log(req.body);
    const { complaintId } = req.body
    const { id } = req.user
    const user = req.queriedUser;

    const result = await Complaint.updateOne({
      complaintId,
      status: statusMap.verified,
      complaintType: user.domain,
    },{
      status: statusMap.accepted,
      acceptedBy: user._id
    })
    if (result.modifiedCount === 0) throw new Error("Complaint Not Found or Already Accepted");

    res.status(200).json({
      status:"success",
      message:"successfully accepted"
    })
})
