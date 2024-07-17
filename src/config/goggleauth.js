import passport from "passport";
// import GoogleStrategy from "passport-google-oauth20";
import { Strategy } from "passport-google-oauth20";
import { User, UserTypes } from "../models/UserModel.js";
import AsyncHandler from "express-async-handler";
import { backendDomain } from "../constants.js";
const GoogleStrategy = Strategy;

const getRollNo = (email) => {
  const match = email.match(/\d{2}[a-zA-Z]{3}\d{1,4}$/);

  if (match) {
    return "20" + match[0]; // found a roll number and return it
  } else {
    return "2022bcy0031"; // default roll number removed after testing
  }
};

const getUserObjectFromProfile = (profile) => {
  return {
    googleId: profile.id,
    displayName: profile.givenName,
    email: profile.emails[0].value,
    userType: UserTypes.Complainant,
    rollNo: getRollNo(profile.emails[0].value),
  };
};

export function GoogleAuth() {
  // Configure Passport to use the Google OAuth 2.0 strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // callbackURL: `http://${serverIp}:${process.env.PORT}/grievance/auth/google/callback`,
        callbackURL: `${backendDomain}/grievance/auth/google/callback`,
      },
      AsyncHandler(async function (accessToken, refreshToken, profile, cb) {
        try {
          // Extract the user's email from the profile information
          let userEmail =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          if (!userEmail) throw new Error("No email found");

          // todo: check weather the user with this email is allowed or not

          let user = await User.findOne({ email: userEmail });
          // console.log("*******profile is :", profile);
          // console.log("*******profile is :", accessToken);
          // If the user doesn't exist, create a new user
          if (!user) {
            if (!userEmail.endsWith("@iiitkottayam.ac.in"))
              throw new Error("Only IIITKottayam emails are allowed");
            await User.create(
              getUserObjectFromProfile(profile, UserTypes.Complainant),
            );
          } else if (!user.googleId || user.flag) {
            user.googleId = profile.id;
            user.displayName = profile.name.givenName;
            await user.save();
          }
          // console.log('prodile : ', profile);
          // Pass the profile information to the next middleware
          return cb(null, profile);
        } catch (error) {
          // If an error occurs, throw the error
          // throw new Error(error);
          cb(error, null);
        }
      }),
    ),
  );

  // Configure Passport to serialize and deserialize user instances to and from the session
  // Configure Passport to serialize and deserialize user instances to and from the session
  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
}

