import { Schema, model } from "mongoose";
import { TUser } from "../interface/user";
import bcrypt from "bcrypt";

const userSchema = new Schema<TUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["admin", "customer", "supplier"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    consinement: [{ type: Schema.Types.ObjectId, ref: "Consinement" }],
  },
  { timestamps: true }
);

// 🧠 Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  // Only hash the password if it’s new or modified
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as any);
  }
});

// ✅ Compare password method (optional and recommended)
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const UserModel = model<TUser>("User", userSchema);
