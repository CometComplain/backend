import mongoose from "mongoose";

export const connectDb = () => mongoose
.connect(process.env.MONGO_URL,{
    dbName:"CommetComplain"
})
.then(()=>{
    console.log("successfully connected to mongodb");
})
.catch((e)=>{
    console.log(e);
})