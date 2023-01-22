import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: {
      type: String,
      required: function () {
        return !Boolean(this.googleId);
      },
    },
    email: { type: String, required: true },
    googleId: {
      type: String,
      required: function () {
        return !Boolean(this.password);
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const newUser = this;
  const plainPW = newUser.password;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

userSchema.pre('findOneAndUpdate', async function(next) {
  const currentUser = this;
  const plainPW = currentUser._update.password;
  currentUser._update.password = await bcrypt.hash(plainPW, 10);

  next();
});

userSchema.methods.toJSON = function () {
  const userDocument = this;
  const userObject = userDocument.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject; 
};

userSchema.static(
  "checkCredentials",
  async function checkCredentials(email, plainPW) {
    const user = await this.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(plainPW, user.password);
      if (isMatch) return user;
      else return null; // if the pw is not ok I'm returning null
    } else return null; // if the email is not ok I'm returning null as well
  }
);

export default model("user", userSchema);