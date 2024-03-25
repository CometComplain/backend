import AsyncHandler from "express-async-handler";
import {Compliant, statusMap} from "../models/complaintModel.js";
import {customAlphabet} from "nanoid";
import {User} from "../models/UserModel.js";
import crypto from "crypto";

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
    // todo: tobe chanced accordingly to the id generating scheme
    const id = nanoid();
    return id;
};

const getComplaintHash = async (complaint) => {
    const hash = crypto.createHash("sha256");
    const complaintString = JSON.stringify(complaint);
    hash.update(complaintString);
    const complaintHash = hash.digest("hex");
    const foundComplaint = await Compliant.findOne({complaintHash});
    if (foundComplaint) {
        throw new Error("Complaint already exists");
    }
    return complaintHash;
};

//  To Register the compliant
export const RegisterCompliant = AsyncHandler(async (req, res) => {
    const {complaint} = req.body;
    const {id} = req.user;

    const user = await User.findOne({googleId: id});

    const hash = await getComplaintHash(complaint);
    const complaintId = await getId(complaint);

    const formattedComplaint = {
        ...complaint,
        createdBy: user._id,
        complaintHash: hash,
        complaintId,
    };

    const createdComplaint = await Compliant.create(formattedComplaint);

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
    const {suburl} = req.params;
    const {type, page} = req.query;
    const user = await User.findOne({googleId: req.user.id});
    let complaints;
    const parsedPage = parseInt(page, 10); // Parse page as an integer
    const parsedPageSize = parseInt(pageSize, 10); // Parse pageSize as an integer

    if (suburl === "complainant") {
        complaints = await Compliant.find({
            createdBy: user._id,
            status: statusMap[type]
        }).sort({createdAt: -1}).skip(parsedPageSize * (parsedPage - 1)).limit(parsedPageSize);
    } else if (suburl === "verifier") {
        complaints = await Compliant.find({status: statusMap.pending}).sort({createdAt: 1}).skip(parsedPageSize * (parsedPage - 1)).limit(parsedPageSize);
    } else if (suburl === "technician") {
        complaints = await Compliant.find({
            status: (type && type === "accepted" ? statusMap.accepted : statusMap.verified),
            compliantType: user.domain
        }).sort({createdAt: 1}).skip(parsedPageSize * (parsedPage - 1)).limit(parsedPageSize);
    } else {
        complaints = [];
    }


    // console.log("-------------------> debug <-------------------");
    // console.log(suburl);
    // console.log(type);
    // console.log(page);
    // console.log(complaints);
    // console.log("-----------------------------------------------");
    const nextPage = parsedPage + 1; // Calculate the next page

    return complaints.length === parsedPageSize
        ? res.json({complaints, nextPage})
        : res.json({complaints});
});

export const fileUpload = AsyncHandler(async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({error: "No file uploaded"});
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
        res.status(500).json({error: "Internal server error"});
    }
});

// To Delete the compliant
export const DeleteComplaint = AsyncHandler(async (req, res) => {
    const {id} = req.user;
    const {complaintId} = req.body;
    const user = await User.findOne({googleId: req.user.id});
    const compliant = await Compliant.deleteOne({
        createdBy: user._id,
        _id: complaintId,
    })
    return res.status(200).json({
        status: "success",
        message: "Complaint deleted successfully",
    });
});

//to update the status of the complaint to solved. when technician solve the compliant
export const SolveCompliant = AsyncHandler(async (req, res) => {
    const {id} = req.user;
    const {complaintId} = req.body;
    console.log("--------------->  debug  <---------------");
    console.log(id);
    console.log(complaintId);
    const technician = await User.findOne({googleId: id});
    console.log(technician.toObject());
    const {domain} = technician.toObject();
    console.log(domain);
    const compliant = await Compliant.findOneAndUpdate(
        { complaintId, compliantType: domain},
        {status: statusMap.solved},
        {new: true}
    );
    console.log(compliant);

    if(compliant) return res.status(200).json({
        status: "success",
        message: "solved the complaint successfully",
    })

    return res.status(401).json({
        status: "failed",
        message: "not able to solve complaint",
    })
});

//to verify a complaint when a verifier verifies the compliant
export const verifyCompliant = AsyncHandler(async (req, res) => {
    const {complaintId} = req.body;
    const {id} = req.user;
    console.log(req.body);
    const user = await User.findOne({googleId: id});
    const compliant = await Compliant.findOneAndUpdate(
        {
            complaintId,
            createdBy: user._id,
        },
        {status: statusMap.verified},
        {new: true}
    );
    res.status(200).json({
        status: "success",
        message: "sucessfully updates the status of the compliant",
    });
});

export const rejectCompliant = AsyncHandler(async (req, res) => {
    const {complaintId} = req.body;
    const {id} = req.user;
    const user = await User.findOne({googleId: id});
    const compliant = await Compliant.findOneAndUpdate(
        {
            complaintId,
            createdBy: user._id,
        },
        {status: statusMap.rejected},
        {new: true}
    );
    res.status(200).json({
        status: "success",
        message: "successfully updated the status of the compliant to rejected",
    });
});

export const acceptComplaint = AsyncHandler(async (req, res) => {
    const {complaintId} = req.body;
    const {id} = req.user;
    const user = await User.findOne({googleId: id});
    const compliant = await Compliant.findOneAndUpdate(
        {
            complaintId,
        },
        {status: statusMap.accepted},
        {new: true}
    );
    compliant ? res.status(200).json({
        status: "success",
        message: "successfully updated the status of the compliant to rejected",
    }) : res.status(500).json({
        status: "failed",
        message: "failed to update the status of the compliant to rejected",
    });
});

//Get the compliant detail
export const GetCompliantDetail = AsyncHandler(async (req, res) => {
    const {id} = req.body;
    const compliant = await Compliant.findById(id);
    res.json(compliant);
});

//Get the Unverfied compliant details for verfiers
export const GetUnverfiedCompliantsData = AsyncHandler(async (req, res) => {
    const unverifiedComplaints = await Compliant.find({isVerified: false});
    res.json(unverifiedComplaints);
});

//Get the verfied compliant for technicians and particular type of technician
export const GetVerifiedCompliantsData = AsyncHandler(async (req, res) => {
    const id = req.user.id;
    const technician = await User.findOne({googleId: id});
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
    const {id} = req.user;
    const user = await User.findOne({googleId: id});
    const complaintsdata = await Compliant.find({createdBy: user._id});
    req.json(complaintsdata);
});

// This function is used to get the solved compliants of particular user
export const GetUserSolvedCompliants = AsyncHandler(async (req, res) => {
    const {id} = req.user;
    const complaintsdata = await Compliant.find({
        userId: id,
        isSolved: true,
        isVerified: true,
    });
    req.json(complaintsdata);
});

// This function is used to get the verified compliants of particular user
export const GetUserverifiedCompliants = AsyncHandler(async (req, res) => {
    const {id} = req.user;
    const complaintsdata = await Compliant.find({
        userId: id,
        isSolved: false,
        isVerified: true,
    });
    req.json(complaintsdata);
});

// This function is used to get the Unsolved compliants of particular user
export const GetUserUnsolvedCompliants = AsyncHandler(async (req, res) => {
    const {id} = req.user;
    const complaintsdata = await Compliant.find({
        userId: id,
        isSolved: false,
        isVerified: false,
    });
    req.json(complaintsdata);
});
