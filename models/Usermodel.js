import mongoose from "mongoose";


var userSchema = new mongoose.Schema({
    googleId: {
        type:String,
        unique:true
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
    role:{
        type:String,
        default:"user"
    }
},{
    timestamps:true
});

export const User = mongoose.model('User', userSchema);