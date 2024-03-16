import AsyncHandler from "express-async-handler"
import { Compliant } from "../models/complaintModel.js";
import { User } from "../models/userModel.js";
import { customAlphabet } from 'nanoid';
import { Counter } from "../models/counterModel.js";

const nanoid = customAlphabet('0123456789', 10);

//  To Register the compliant
export const RegisterCompliant = AsyncHandler(async(req,res)=>{
    const complaint = await Compliant.create({
        ...req.body,
        userId: req.user.id
    })
    res.json(complaint)
})

// To Delete the compliant
export const DeleteComplient = AsyncHandler(async(req,res)=>{
    const { id } = req.body
    const compliant = await Compliant.findByIdAndDelete({_id:id})
    res.json(compliant)
})

//to make isSloved boolean to true. this is done by technician
export const SolveCompliant = AsyncHandler(async (req,res)=>{
    const {id} = req.params
    console.log(id);
    const solvedCompliant = await Compliant.findById(id)
    if(solvedCompliant && solvedCompliant.isVerified){
        const updatedCompliant = await Compliant.findByIdAndUpdate(id,{isSolved:true},{new:true})
        res.json(updatedCompliant)
    } else {
        throw new Error("complaint is not found or not verified");
    }
})

//to make isVerified boolean to true. this is done by Verifier and we will give a id for complient after verifing the compliant
export const verifyCompliant = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    const countDocument = await Counter.findByIdAndUpdate({_id: 'compliantId'}, {$inc: { seq: 1}}, {new: true, upsert: true});
    const compliant = await Compliant.findByIdAndUpdate(id, { isVerified: true, CompliantID: String(countDocument.seq) }, { new: true });
    res.json(compliant);
});

//Get the compliant detail 
export const GetCompliantDetail = AsyncHandler(async(req,res)=>{
    const { id } = req.body
    const compliant = await Compliant.findById(id)
    res.json(compliant);
})

//Get the Unverfied compliant details for verfiers
export const GetUnverfiedCompliantsData = AsyncHandler(async(req,res)=>{
    const unverifiedComplaints = await Compliant.find({ isVerified: false });
    res.json(unverifiedComplaints);
})

//Get the verfied compliant for technicians and particular type of technician
export const GetVerifiedCompliantsData = AsyncHandler(async(req,res)=>{
    const id = req.user.id;
    const technician = await User.findOne({googleId:id});
    const type = technician.role.split(" ")[0];
    const verifyCompliant = await Compliant.find({ isVerified: true, isSolved: false, compliantType: type });
    res.json(verifyCompliant);
});

// Get solved compliants 
export const GetSolvedCompliantsData = AsyncHandler(async(req,res)=>{
    const solvedCompliant = await Compliant.find({ isVerified: true, isSolved: true});
    res.json(solvedCompliant)
})

// This function is used to get the compliants of particular user
export const GetUserCompliants = AsyncHandler(async (req,res)=>{
    const { id } = req.user
    const complaintsdata = await Compliant.find({userId:id})
    req.json(complaintsdata)
})

// This function is used to get the solved compliants of particular user
export const GetUserSolvedCompliants = AsyncHandler(async (req,res)=>{
    const { id } = req.user
    const complaintsdata = await Compliant.find({userId:id,isSolved:true,isVerified:true})
    req.json(complaintsdata)
})

// This function is used to get the verified compliants of particular user
export const GetUserverifiedCompliants = AsyncHandler(async (req,res)=>{
    const { id } = req.user
    const complaintsdata = await Compliant.find({userId:id,isSolved:false,isVerified:true})
    req.json(complaintsdata)
})

// This function is used to get the Unsolved compliants of particular user
export const GetUserUnsolvedCompliants = AsyncHandler(async (req,res)=>{
    const { id } = req.user
    const complaintsdata = await Compliant.find({userId:id,isSolved:false,isVerified:false})
    req.json(complaintsdata)
})

