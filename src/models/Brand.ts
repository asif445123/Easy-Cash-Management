import mongoose, { Schema, models, model } from "mongoose";

export interface IBrand {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export default models.Brand || model<IBrand>("Brand", BrandSchema);
