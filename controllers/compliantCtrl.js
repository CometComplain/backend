import AsyncHandler from "express-async-handler"
import { Compliant } from "../models/complaintmodel.js";



export const RegisterCompliant = AsyncHandler(async(req,res)=>{
    const complaint = await Compliant.create(req.body)
    res.json(complaint)
})

export const DeleteComplient = AsyncHandler(async(req,res)=>{
    const { id } = req.body
    const compliant = await Compliant.findByIdAndDelete({_id:id})
    res.json(compliant)
})

export const SolveCompliant = AsyncHandler(async (req,res)=>{
    const { id } = req.body
    const solvedCompliant = await Compliant.findById(id)
    if(solvedCompliant && solvedCompliant.isVerified){
        const updatedCompliant = await Compliant.findByIdAndUpdate(id,{isSolved:true},{new:true})
        res.json(updatedCompliant)
    } else {
        throw new Error("complaint is not found or verified");
    }
})

export const verifyCompliant = AsyncHandler(async (req, res) => {
        const { id } = req.body
        const compliant = await Compliant.findByIdAndUpdate(id, { isVerified: true }, { new: true })
        res.json(compliant)
})

export const GetCompliantDetail = AsyncHandler(async(req,res)=>{
    const { id } = req.body
    const compliant = await Compliant.findById(id)
    res.json(compliant);
})

export const GetUnverfiedCompliantsData = AsyncHandler(async(req,res)=>{
    const unverifiedComplaints = await Compliant.find({ isVerified: false });
    res.json(unverifiedComplaints);
})

export const GetVerifiedCompliantsData = AsyncHandler(async(req,res)=>{
    const verifyCompliant = await Compliant.find({ isVerified: true, isSolved: false });
    res.json(verifyCompliant)
})

export const GetSolvedCompliantsData = AsyncHandler(async(req,res)=>{
    const solvedCompliant = await Compliant.find({ isVerified: true, isSolved: true});
    res.json(solvedCompliant)
})