import session from "express-session";
import { frontendDomain } from "../constants.js";
const configureSession = (app, store) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: true,
      cookie: {
        // secure: process.env.NODE_ENV === "production",
        // domain: `${frontendDomain}`,
        // sameSite: "lex",
        secure: true,
        maxAge: parseInt(process.env.MAX_AGE, 10), // Ensure maxAge is an integer
      },
      store,
    }),
  );
};

export default configureSession;

