import mongoose from "mongoose";

const UserTypes = {
    Complainant: 0,
    Verifier: 1,
    Technician: 2,
    Admin: 3,
};

const technicianDomains = {
    Electrical: 0,
    Plumbing: 1,
    Carpentry: 2,
    Civil: 3,
    Other: 4,
};


var userSchema = new mongoose.Schema({
    googleId: {
        type:String,
        unique:true,
    },
    roolNo: {
        type: String,
        unique: true,
    },
    displayName: String,
    email: {
        type:String,
        unique:true
    },
    IsBlock:{
        type:Boolean,
        default:false
    },
    userType: {
        type: Number,
        default: UserTypes.Complainant,
        enum: Object.values(UserTypes),
    },
    domain:{
        type: Number,
        default: technicianDomains.Other,
        enum: Object.values(technicianDomains),
    },
    /*  */
    noOfComplaints: {
        type: Number,
        default: 0,
    },
    solvedComplaints: {
        type: Number,
        default: 0,
    },
},{
    timestamps:true
});

export const User = mongoose.model('User', userSchema);