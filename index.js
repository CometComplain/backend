import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import morgan from "morgan";
import authroute from "./routers/authRoute.js"
import { connectDb } from "./config/DbConnect.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

config({
    path:'./.env'
})

const app = express();
const PORT = process.env.PORT
app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
connectDb();

app.use('/api/user',authroute)

app.use(notFound);
app.use(errorHandler)
app.listen(PORT,(req,res)=>{
    console.log(`port is running on ${PORT}`);
})
