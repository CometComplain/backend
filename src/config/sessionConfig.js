import session from "express-session";
import { frontendDomain } from "../constants.js";

const configureSession = (app, store) => {
  const isProduction = process.env.NODE_ENV === "production";
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: isProduction,
        domain: isProduction ? `${frontendDomain}` : undefined,
        sameSite: isProduction ? "none" : "lax",
        maxAge: parseInt(process.env.MAX_AGE, 10),
        httpOnly: false,
      },
      store,
    }),
  );
};

export default configureSession;