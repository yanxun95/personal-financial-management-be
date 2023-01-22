import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import UserModel from "../services/user/schema.js";

export const JWTAuthenticate = async (user) => {
  const accessToken = await generateJWT({ _id: user._id });
  return accessToken;
};

export const generateJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30 days" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

const verifyJWT = (token) => new Promise((res, rej) =>
  jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) rej(err);
    else res(decodedToken);
  })
);

export const JWTAuthMiddleware = async (req,res,next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(401, "Please provide credentials in Authorization header")
    );
  } else {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = await verifyJWT(token);
      const user = await UserModel.findById(decodedToken._id);
      if (user) {
        req.user = user; // req if under the async
        next(); // go to next, async funtion
      } else {
        next(createHttpError(404, "User not found!"));
      }
    } catch (error) {
      next(createHttpError(403, "Forbidden!"));
    }
  }
};
