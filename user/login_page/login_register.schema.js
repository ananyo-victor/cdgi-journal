import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
//   journals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Journal' }],
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const UserModel = mongoose.model("Users", userSchema);

export default UserModel;