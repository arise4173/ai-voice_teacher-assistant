import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false }, // hashed password
    role: { type: String, enum: ["student", "teacher"], required: true }
  },
  { timestamps: true }
);

// Ensure unique index at the DB level

const User = mongoose.model("User", userSchema);
export default User;
