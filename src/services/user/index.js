import express from "express";
import UserModel from "./schema.js";
import createHttpError from "http-errors";
import { JWTAuthenticate, JWTAuthMiddleware } from "../../auth/tools.js";
import passport from "passport";

const userRouter = express.Router();

userRouter.get("/", async (req, res, next) => {
  try {
    const user = await UserModel.find().limit(100);
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body;
    const findEmail = await UserModel.findOne({ email });
    if (findEmail) {
      res.status(409).send("The email is already exist!");
    } else {
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();
      res.status(201).send(_id);
    }
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.checkCredentials(email, password);
    if (user) {
      const accessToken = await JWTAuthenticate(user);
      console.log("accessToken:",accessToken);
      res
        .status(200)
        .cookie("accessToken", accessToken, {
          httpOnly: true,
        })
        .send(user);
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (user) res.status(200).send(user);
    else
      next(
        createHttpError(404, `profile with id ${req.params.id} is not found`)
      );
  } catch (error) {
    next(error);
  }
});

userRouter.put("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = req.user;
    const updateUser = await UserModel.findByIdAndUpdate(user, req.body, {
      new: true,
    });
    updateUser && res.status(200).send(updateUser);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const {_id} = req.user;
    const deleteUser = await UserModel.findByIdAndDelete(_id);
    deleteUser && res.status(204).send();
  } catch (error) {
    console.log(error)
    next(error);
  }
});

userRouter.get(
  "/google/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/google/redirect",
  passport.authenticate("google"),
  (req, res, next) => {
    console.log("token:",req.user);
    res.status(200).send(req.user);
    // res.redirect(`http://localhost:3000?accessToken=${req.user.token}}`);
  }
);


export default userRouter;
