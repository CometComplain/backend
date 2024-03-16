import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import morgan from "morgan";
import authroute from "./routers/authRoute.js"
import { connectDb } from "./config/DbConnect.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import session from "express-session";
import passport from "passport";
import { CatchError } from "./middlewares/CatchError.js";
import cookieParser from 'cookie-parser';
import compliantRoute from "./routers/complientRoute.js"
config({
    path:'./.env'
})

const app = express();
const PORT = process.env.PORT


app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('trust proxy', 1);
connectDb();
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/grievance/auth',authroute)
app.use('/grievance',compliantRoute)

app.use(CatchError)
app.use(notFound);
app.use(errorHandler)

app.listen(PORT,(req,res)=>{
    console.log(`port is running on ${PORT}`);
})
