import session from "express-session";
import { frontendDomain } from "../constants.js";

const configureSession = (app, store) => {
  const isProduction = process.env.NODE_ENV === "production";
  console.log(process.env.FRONTEND_DOMAIN_COOKIE);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: isProduction,
        domain: isProduction ? `${process.env.BACKEND_DOMAIN_COOKIE}` : undefined,
        sameSite: isProduction ? "none" : "lax",
        maxAge: parseInt(process.env.MAX_AGE, 10),
        path: '/',
      },
      store,
    }),
  );
};

export default configureSession;