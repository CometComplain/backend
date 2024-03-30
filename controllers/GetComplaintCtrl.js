import AsyncHandler from "express-async-handler";
import { Complaint, statusMap } from "../models/complaintModel.js";
import { customAlphabet } from "nanoid";
import { User, UserTypes } from "../models/UserModel.js";
import crypto from "crypto";
import router from "../routers/complaintRoute.js";
import { format } from "path";
import {pageSize} from "../constants.js";


const complaintsQuery = (filter = {}, page, sortFilter = { createdAt: -1}) => {
  return Complaint.find(filter)
      .sort(sortFilter)
      .skip(pageSize * (page - 1))
      .limit(pageSize);
}

const formatPreviewComplaint = (complaint) => {
  const { complaintId, title, description, status,createdAt } = complaint;
  const parsedDate = new Date(createdAt);
  return { complaintId, title, description, status,createdAt : parsedDate };
}

const complainant = async (id, page, filterType) => {
  const complaints = await complaintsQuery({ createdBy: id }, page);
  return complaints.map(formatPreviewComplaint);
}

const verifier = async (id, page, filterType) => {
  const user = await User.findOne({ googleId: id });
  if(user.userType !== UserTypes.Verifier) throw new Error("User is not a verifier");
  const complaints = await complaintsQuery({ status: statusMap.pending }, page, { createdAt: 1});
  return complaints.map(formatPreviewComplaint);
}

const technician = async (id, page, filterType) => {
    const user = await User.findOne({ googleId: id });
    if(user.userType !== UserTypes.Technician) throw new Error("User is not a technician");
    const complaints = await complaintsQuery({ status: filterType, complaintType: user.domain }, page, { createdAt: 1});
    return complaints.map(formatPreviewComplaint);
}

const admin = async (id, page, filterType) => {
  // try{

    const user = await User.findOne({ googleId: id });
    if(user.userType !== UserTypes.Admin) throw new Error("User is not an admin");
    const complaints = await complaintsQuery({}, page);
    return complaints.map(formatPreviewComplaint);
  // }
  // catch(err){
  //   console.log(err);
  // }
}
const actionMap = {
    [UserTypes.Complainant]: complainant,
    [UserTypes.Verifier]: verifier,
    [UserTypes.Technician]: technician,
    [UserTypes.Admin]: admin,
}



export const getComplaints = AsyncHandler(async (req, res) => {
  const { suburl } = req.params;
  const { type, page } = req.query;
  const { id } = req.user;

  
  const parsedPage = parseInt(page);
  const parsedType = parseInt(type);
  const parsedSuburl = parseInt(suburl);
  
  if(!suburl) return res.status(400).json({ message: "Invalid URL" });
  const complaints = await actionMap[parsedSuburl](id, parsedPage, parsedType);
  return complaints.length === pageSize ? res.json({ complaints, nextPage: parsedPage + 1 }) : res.json({ complaints });
});




  // if (suburl === "complainant") {
  //   complaints = await Complaint.find({ createdBy: id })
  //     .sort({ createdAt: -1 })
  //     .skip(pageSize * (parsedPage - 1))
  //     .limit(pageSize);
  // } else if (suburl === "verifier") {
  //
  //   complaints = await Complaint.find({ status: statusMap.pending })
  //     .sort({ createdAt: 1 })
  //     .skip(pageSize * (parsedPage - 1))
  //     .limit(pageSize);
  // } else if (suburl === "technician") {
  //   const user = await User.findOne({ googleId: id });
  //   complaints = await Complaint.find({
  //     status: statusMap.verified,
  //     ComplaintType: user.domain,
  //   })
  //     .sort({ createdAt: 1 })
  //     .skip(pageSize * (parsedPage - 1))
  //     .limit(pageSize);
  // } else {
  //   complaints = [];
  // }
