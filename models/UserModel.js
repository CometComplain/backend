import mongoose from "mongoose";

export const UserTypes = {
    Complainant: 0,
    Verifier: 1,
    Technician: 2,
    Admin: 3,
};

export const technicianDomains = {
    electrical: 0,
    plumbing: 1,
    carpentry: 2,
    civil: 3,
    other: 4,
};


var userSchema = new mongoose.Schema({
    googleId: {
        type:String,
        unique:true,
    },
    rollNo: {
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
},{
    timestamps:true
});

export const User = mongoose.model('User', userSchema);