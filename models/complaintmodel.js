import mongoose  from "mongoose";
import shortid from "shortid";

const compliantSchema = new mongoose.Schema({
    id: {
        type: String,
        default: shortid.generate
    },
    Name:{
        type:String,
        required:true
    },
    Student_ID:{
        type:String,
    },
    mobile:{
        type:String,
        required:true
    },
    CompliantType:{
        type:String,
        required:true
    },
    Address:{
        type:String,
    },
    Description:{
        type:String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isSolved: {
        type: Boolean,
        default: false
    }
})

compliantSchema.index({ isVerified: 1}); // Create an index on isVerified
compliantSchema.index({ isSolved: 1}); // Create an index on isSolved

export const Compliant = mongoose.model('Compliant',compliantSchema)