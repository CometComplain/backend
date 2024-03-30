import AsyncHandler from "express-async-handler";
import { Complaint, statusMap } from "../models/complaintModel.js";
import { customAlphabet } from "nanoid";
import { User, UserTypes } from "../models/UserModel.js";
import crypto from "crypto";
import router from "../routers/complaintRoute.js";
import { format } from "path";

const pageSize = 10;

const funcmap = {

}

export const getComplaints = AsyncHandler(async (req, res) => {
  const { suburl } = req.params;
  const { type, page } = req.query;
  const { id } = req.user;
  const parsedPage = parseInt(page);
  const parsedType = parseInt(type)
  console.log("-------------------> debug <-------------------");
  console.log(suburl);
  console.log(type);
  console.log(parsedPage);
  console.log("-----------------------------------------------");
  let complaints;
  if (suburl === "complainant") {
    complaints = await Complaint.find({ createdBy: id })
      .sort({ createdAt: -1 })
      .skip(pageSize * (parsedPage - 1))
      .limit(pageSize);
  } else if (suburl === "verifier") {
    
    complaints = await Complaint.find({ status: statusMap.pending })
      .sort({ createdAt: 1 })
      .skip(pageSize * (parsedPage - 1))
      .limit(pageSize);
  } else if (suburl === "technician") {
    const user = await User.findOne({ googleId: id });
    complaints = await Complaint.find({
      status: statusMap.verified,
      ComplaintType: user.domain,
    })
      .sort({ createdAt: 1 })
      .skip(pageSize * (parsedPage - 1))
      .limit(pageSize);
  } else {
    complaints = [];
  }
  return complaints.length === pageSize
    ? res.json({ complaints, nextPage: parsedPage + 1 })
    : res.json({ complaints });
});

