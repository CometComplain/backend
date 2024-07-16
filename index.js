import express from "express";
import bodyParser from "body-parser";
// import { config } from "dotenv";
import morgan from "morgan";
import authroute from "./routers/authRoute.js";
import { connectDb } from "./config/DbConnect.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import session from "express-session";
import passport from "passport";
import { CatchError } from "./middlewares/CatchError.js";
import cookieParser from "cookie-parser";
import complaintRoute from "./routers/complaintRoute.js";
import fileupload from "express-fileupload";
import cors from "cors";
import MongoDBStoreFactory from "connect-mongodb-session";
import { frontendDomain, frontendUrls, serverIp } from "./constants.js";
import { User, UserTypes } from "./models/UserModel.js";
// import path from "path";
import http from "http";
import { log } from "console";

const MongoDBStore = MongoDBStoreFactory(session);

// config({
//     path:'./.env'
// })

const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: frontendDomain, // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with the request
  }),
);

// app.set('trust proxy', 1);
app.use(cookieParser());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET_KEY,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       domain: frontendDomain,
//       path: "/",
//       secure: true,
//       maxAge: 24 * 60 * 60 * 1000, // 24 hrs
//       sameSite: "none",
//     },
//     store,
//   }),
// );

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      domain: `${frontendDomain}`,
      // path: "/",
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hrs
      sameSite: "none",
    },
    store,
  }),
);

app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

app.use("/grievance/auth", authroute);
app.use("/grievance", complaintRoute);

app.get("/", (req, res) => {
  res.redirect(frontendUrls.home);
  // res.sendFile("/dist/index.html", { root: process.cwd() });
  // res.send('Hello World');
});

// app.all("*",(req,res,next)=>{
//     // const err = new Error(`Route ${req.originalUrl} not Found`);
//     res.redirect(frontendUrls.loginError);
// })

app.use(CatchError);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

connectDb()
  .then(async () => {
    // app.listen(PORT, serverIp ,() => {
    //     console.log(`Server started on http://${serverIp}:${PORT}`);
    // } )
    //     app.listen(PORT, serverIp, () => {
    //         console.log(`Server started on http://${serverIp}:${PORT}`);
    // });
    server.listen(PORT, serverIp, () => {
      console.log(`Server started on http://${serverIp}:${PORT}`);
    });
    const adminEmail = process.env.ADMIN_EMAIL;
    // console.log("Admin Email:", adminEmail);
    const admin = await User.findOne({ email: adminEmail });
    // console.log("Admin", admin);
    if (!admin) {
      // console.log('Admin not found, creating one');
      const result = await User.create({
        email: adminEmail,
        userType: UserTypes.Admin,
      });
      if (!result) throw new Error("Admin not created");
      else console.log("admin added sucessfully");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("-------> Connection error <-------", err);
    process.exit(1);
  });
