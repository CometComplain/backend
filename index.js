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
import {serverIp} from "./constants.js";
import {User, UserTypes} from "./models/UserModel.js";
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
    res.status(404).json({
        status:'fail',
        message:err.message,
    })
})

app.use(CatchError)
app.use(notFound);
app.use(errorHandler)

connectDb().then( async ()=>{
    app.listen(PORT, serverIp, (req,res)=>{
        console.log(`Server is running on port : ${PORT}`);
    })
    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = await User.findOne({email:adminEmail});
    if(!admin){
        const result = await User.create({
            email:adminEmail,
            userType:UserTypes.Admin,
        })
        if(!result) throw new Error('Admin not created');
        process.exit(1);
    }
}).catch((err)=>{
    console.error('-------> Connection error <-------', err);
    process.exit(1);
})

