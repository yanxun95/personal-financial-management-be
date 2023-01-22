import { createServer } from "http";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import app from "./app.js";

const httpServer = createServer(app);
const port = process.env.PORT;

mongoose.set("strictQuery", false);
const mongoConnection = process.env.MONGO_CONNECTION;
mongoose.connect(mongoConnection);
mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  httpServer.listen(port, () => {
    console.table(listEndpoints(app));
    console.log(`Server running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
    console.log(err);
}); 