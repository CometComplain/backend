import { User }  from "../models/Usermodel.js";




export const RegisterUser = async (req,res) =>{
    try {
        const user = await User.create(req.body)
        res.json(user)   
    } catch (error) {
        throw new Error(error)
    }
}