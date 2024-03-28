import AsyncHandler from "express-async-handler";
import { Complaint, statusMap } from "../models/complaintModel.js";
import { customAlphabet } from "nanoid";
import { User, UserTypes } from "../models/UserModel.js";
import crypto from "crypto";
import mongoose from "mongoose";

const nanoid = customAlphabet("0123456789", 10);

/*
complaint from frontend format = {
    title: String,
    description: String,
    mobile: String,
    complaintType: String,
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
    complaintType: String,
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
    // todo: tobe chanced accordingly to the id generating scheme
    const id = nanoid();
    return id;
};

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

const pageSize = 10;

export const getComplaints = AsyncHandler(async (req, res) => {
    const { suburl } = req.params;
    const { type, page } = req.query;
    const { id } = req.user;
    let complaints;
    const parsedPage = parseInt(page, 10); // Parse page as an integer
    const parsedPageSize = parseInt(pageSize, 10); // Parse pageSize as an integer

    if (suburl === "complainant") {
        complaints = await Complaint.find({
            createdBy: id,
            status: statusMap[type],
        })
            .sort({ createdAt: -1 })
            .skip(parsedPageSize * (parsedPage - 1))
            .limit(parsedPageSize);
    } else if (suburl === "verifier") {
        complaints = await Complaint.find({ status: statusMap.pending })
            .sort({ createdAt: 1 })
            .skip(parsedPageSize * (parsedPage - 1))
            .limit(parsedPageSize);
    } else if (suburl === "technician") {
        const user = await User.findOne({ googleId: req.user.id });
        complaints = await Complaint.find({
            status:
                type && type === "accepted"
                    ? statusMap.accepted
                    : statusMap.verified,
            complaintType: user.domain,
        }).sort({ createdAt: 1 }).skip(parsedPageSize * (parsedPage - 1)).limit(parsedPageSize);
    } else {
        complaints = [];
    }

    const nextPage = parsedPage + 1; // Calculate the next page

    return complaints.length === parsedPageSize
        ? res.json({ complaints, nextPage })
        : res.json({ complaints });
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

export const getComplaintDetail = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({
        complaintId,
    });
    const createdBy = await User.findOne({ googleId: id });
    const acceptedBy = await User.findOne({ _id: complaint.acceptedBy });

    return complaint
        ? res.status(200).json({
              complaint: complaint.toObject(),
              createdBy: createdBy.toObject(),
              acceptedBy: acceptedBy?.toObject(),
          })
        : res.status(401).json({
              status: "failed",
              message: "Complaint not found",
          });
});
// To Delete the compliant

export const DeleteComplaint = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const { complaintId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const complaint = await Complaint.findByIdAndDelete({
            createdBy: id,
            complaintId,
        });
        const user = await User.findOneAndUpdate({
            googleId: id
        }, {
            $inc: { noOfComplaints: -1, noOfSolvedComplaints: complaint.status === statusMap.solved ? -1 : 0 },
        });
        return complaint ? res.status(200).json({
                  status: "success",
                  message: "Complaint deleted successfully",
              })
            : res.status(510).json({
                  status: "failed",
                  message: "Complaint not deleted at all",
              });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(
            "<----------------------- error in delete complaint ----------------------->\n",
            error
        );
        console.error(
            "<------------------------------------------------------------------------>"
        );
        throw error;
    }
});


export const SolveComplaint = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const { complaintId } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const technician = await User.findOne({ googleId: id }).session(
            session
        );
        const { domain } = technician.toObject();
        console.log("::domain ", domain);
        console.log("::complaintId ", complaintId);
        console.log("::id ", id);
        const complaint = await Complaint.findOneAndUpdate(
            { complaintId, complaintType: domain },
            { status: statusMap.solved },
            { new: true }
        ).session(session);
        console.log(complaint);
        if (!complaint) {
            throw new Error("Complaint not found.");
        }

        const userUpdate = await User.findOneAndUpdate(
            { googleId: complaint.createdBy },
            { $inc: { noOfsolvedComplaints: 1 } },
            { new: true }
        ).session(session);
        console.log(userUpdate);
        if (!userUpdate) {
            throw new Error("Failed to update user count.");
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            status: "success",
            message: "Solved the complaint successfully.",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(
            "<----------------------- error in solve complaint ----------------------->\n",
            error
        );
        console.error(
            "<------------------------------------------------------------------------>"
        );
        throw error;
    }
});

//to verify a complaint when a verifier verifies the compliant
export const verifyComplaint = AsyncHandler(async (req, res) => {
    const { complaintId } = req.body;
    const { id } = req.user;

    const user = await User.findOne({ googleId: id });
    if (user.userType !== UserTypes.Verifier)
        return res.status(401).json({
            status: "failed",
            message: "not authorized to verify the complaint",
        });

    const result = await Complaint.updateOne(
        {
            complaintId,
        },
        { status: statusMap.verified },
        { new: true }
    );
    return result.modifiedCount > 0 ? res.status(200).json({
        status: "success",
        message: "sucessfully updates the status of the complaint",
    }) : res.status(401).json({
        status: "failed",
        message: "failed to update the status of the complaint",
    });
});

export const rejectComplaint = AsyncHandler(async (req, res) => {
    const { complaintId } = req.body;
    const { id } = req.user;
    const user = await User.findOne({ googleId: id });
    if (user.userType !== UserTypes.Verifier)
        return res.status(401).json({
            status: "failed",
            message: "not authorized to verify the complaint",
        });

    const result = await Complaint.updateOne(
        {
            complaintId,
        },
        { status: statusMap.rejected },
        { new: true }
    );
    return result.modifiedCount > 0 ? res.status(200).json({
        status: "success",
        message: "successfully updated the status of the complaint to rejected",
    }) : res.status(401).json({
        status: "failed",
        message: "failed to update the status of the complaint to rejected",
    });
});

export const acceptComplaint = AsyncHandler(async (req, res) => {
    const { complaintId } = req.body;
    const { id } = req.user;
    const user = await User.findOne({ googleId: id });

    if (user.userType != UserTypes.Technician)
        return res.status(401).json({
            status: "failed",
            message: "not authorized to accept the complaint",
        });

    const result = await Complaint.updateOne(
        {
            complaintId,
        },
        { status: statusMap.accepted },
        { new: true }
    );
    console.log('::result ---> ', result);
    return result.modifiedCount > 0
        ? res.status(200).json({
              status: "success",
              message:
                  "successfully updated the status of the complaint to rejected",
          })
        : res.status(500).json({
              status: "failed",
              message:
                  "failed to update the status of the complaint to rejected",
          });
});

//Get the Unverfied compliant details for verfiers
export const GetUnverfiedComplaintsData = AsyncHandler(async (req, res) => {
    const unverifiedComplaints = await Complaint.find({ isVerified: false });
    res.json(unverifiedComplaints);
});

//Get the verfied compliant for technicians and particular type of technician
export const GetVerifiedComplaintsData = AsyncHandler(async (req, res) => {
    const id = req.user.id;
    const technician = await User.findOne({ googleId: id });
    const type = technician.role.split(" ")[0];
    const verifyComplaint = await Complaint.find({
        isVerified: true,
        isSolved: false,
        compliantType: type,
    });
    res.json(verifyComplaint);
});

// Get solved compliants
export const GetSolvedComplaintsData = AsyncHandler(async (req, res) => {
    const solvedComplaint = await Complaint.find({
        isVerified: true,
        isSolved: true,
    });
    res.json(solvedComplaint);
});

// This function is used to get the compliants of particular user
export const GetUserComplaints = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findOne({ googleId: id });
    const complaintsdata = await Complaint.find({ createdBy: user._id });
    req.json(complaintsdata);
});

// This function is used to get the solved compliants of particular user
export const GetUserSolvedComplaints = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const complaintsdata = await Complaint.find({
        userId: id,
        isSolved: true,
        isVerified: true,
    });
    req.json(complaintsdata);
});

// This function is used to get the verified compliants of particular user
export const GetUserverifiedComplaints = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const complaintsdata = await Complaint.find({
        userId: id,
        isSolved: false,
        isVerified: true,
    });
    req.json(complaintsdata);
});

// This function is used to get the Unsolved compliants of particular user
export const GetUserUnsolvedComplaints = AsyncHandler(async (req, res) => {
    const { id } = req.user;
    const complaintsdata = await Complaint.find({
        userId: id,
        isSolved: false,
        isVerified: false,
    });
    req.json(complaintsdata);
});
