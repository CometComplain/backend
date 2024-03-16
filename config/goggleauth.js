import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { User } from '../models/userModel.js'; 
import AsyncHandler from 'express-async-handler';

export function GoogleAuth() {
  // Configure Passport to use the Google OAuth 2.0 strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/grievance/auth/google/callback`
    },
    AsyncHandler(async function(accessToken, refreshToken, profile, cb)  {
      try {
        // Extract the user's email from the profile information
        let userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          let user = await User.findOne({ googleId: profile.id });
          
          // If the user doesn't exist, create a new user
          if (!user) {
            await User.create({
              googleId: profile.id,
              displayName: profile.displayName,
              email: userEmail,
            });
          }
          
          // Pass the profile information to the next middleware
          return cb(null, profile);
      } catch (error) {
        // If an error occurs, throw the error
        throw new Error(error)
      } 
    })
  ));

  // Configure Passport to serialize and deserialize user instances to and from the session
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
}