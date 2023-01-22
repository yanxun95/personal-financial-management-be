import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import UserModel from "../services/user/schema.js";
import { generateJWT } from "./tools.js";

const googleStrategy = new GoogleStrategy.Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    const user = await UserModel.findOne({ googleId: profile.id });
    // if the user in exist, then generate the token
    if (user) {
      const token = await generateJWT({ _id: user._id.toString() });
      passportNext(null, { token });
    } else {
      const newUser = new UserModel({
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        email: profile.emails?.[0].value,
        googleId: profile.id,
      });
      await newUser.save();
      const token = await generateJWT({ id: newUser._id.toString() });

      passportNext(null, { token });
    }
  }
);

passport.serializeUser(function (userData, passportNext) {
  passportNext(null, userData);
});

export default googleStrategy;
