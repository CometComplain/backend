import mongoose from "mongoose";

export const UserTypes = {
    Complainant: 0,
    Verifier: 1,
    Technician: 2,
    Admin: 3,
};

export const technicianDomains = {
    mess: 0,
    electrical: 1,
    plumbing: 2,
    it: 3,
    others: 5,
};


var userSchema = new mongoose.Schema({
    googleId: {
        type:String,
        unique:true,
    },
    rollNo: {
        type: String,
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
    /* only for technitian */
    domain:{
        type: Number,
        enum: Object.values(technicianDomains),
    },
    /* only for complainant */
    noOfComplaints: {
        type: Number,
    },
    solvedComplaints: {
        type: Number,
    },
    flag: {
        type: Boolean,
        default: false,
    },
},{
    timestamps:true
});

export const User = mongoose.model('User', userSchema);