import mongoose  from "mongoose";


// change the attributes name according to your comfortable names
const compliantSchema = new mongoose.Schema({
    CompliantID: {
        type: String,
        default:"",
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    student_ID:{
        type:String,
    },
    mobile:{
        type:String,
    },
    compliantType:{
        type:String,
        required:true
    },
    location:{
        type:String,
    },
    description:{
        type:String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isSolved: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        required: true
    }
})


compliantSchema.index({ isVerified: 1}); // Create an index on isVerified
compliantSchema.index({ isSolved: 1}); // Create an index on isSolved

export const Compliant = mongoose.model('Compliant',compliantSchema)