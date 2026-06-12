import { Schema, model, models } from "mongoose";
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
    consignment: [{ type: Schema.Types.ObjectId, ref: "Consignment" }],
  },
  { timestamps: true }
);

// 🧠 Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
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

// ✅ Compare password method
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Prevent model overwrite on hot reload
export const UserModel = models.User || model<TUser>("User", userSchema);
