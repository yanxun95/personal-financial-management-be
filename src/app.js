import express from "express";
import userRouter from "./services/user/index.js";
import {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
  unauthorizedHandler,
  forbiddenHandler,
} from "./errorHandlers.js";
import passport from "passport";
import googleStrategy from "./auth/oAuth.js";
import session from "express-session";

const app = express();

app.use(
  session({
    secret: process.env.COOKIE_KEY,
    saveUninitialized: true,
    resave: true,
    cookie: { secure: false },
  })
);
//MIDDLEWARES
passport.use("google", googleStrategy);
app.use(express.json());
app.use(passport.initialize());


//ROUTERS
app.use("/user", userRouter);

//ERROR
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

export default app;
