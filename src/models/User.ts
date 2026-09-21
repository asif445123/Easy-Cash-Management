import mongoose, { Schema, models, model } from "mongoose";

export type UserStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    // Used for the forgot-password flow. We store a hash of the reset token
    // (never the raw token) plus its expiry, similar to how passwords are hashed.
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
