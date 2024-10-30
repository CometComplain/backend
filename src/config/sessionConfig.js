import session from "express-session";
import { frontendDomain } from "../constants.js";

const configureSession = (app, store) => {
  const isProduction = process.env.NODE_ENV === "production";
  console.log(isProduction);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,  
      cookie: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
      store,
    }),
  );
};

export default configureSession;
