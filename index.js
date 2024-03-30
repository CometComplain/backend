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
import complaintRoute from "./routers/complaintRoute.js"
import fileupload from "express-fileupload"

import MongoDBStoreFactory from 'connect-mongodb-session';
const MongoDBStore = MongoDBStoreFactory(session);

config({
    path:'./.env'
})

const store = MongoDBStore({
    uri:process.env.MONGO_URL,
    collection: 'sessions',
})


const app = express();
const PORT = process.env.PORT

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));
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
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000, // 24 hrs
    },
    store,
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/grievance/auth',authroute)
app.use('/grievance',complaintRoute)

app.get("/",(req,res)=>{
    res.send("Hello World")  // testing
});

app.all("*",(req,res,next)=>{
    const err = new Error(`Route ${req.originalUrl} not Found`);
    err.statusCode = 404,
    res.status(404).json({
        message:err.message,
    })
})

app.use(CatchError)
app.use(notFound);
app.use(errorHandler)

app.listen(PORT,(req,res)=>{
    console.log(`port is running on ${PORT}`);
})

