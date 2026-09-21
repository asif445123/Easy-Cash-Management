import mongoose, { Schema, models, model } from "mongoose";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export default models.Category || model<ICategory>("Category", CategorySchema);
