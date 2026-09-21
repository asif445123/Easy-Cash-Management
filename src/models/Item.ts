import mongoose, { Schema, models, model } from "mongoose";

export interface IItem {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  category?: string;
  brand?: string;
  color?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    brand: { type: String, trim: true },
    color: { type: String, trim: true },
    unit: { type: String, required: true, trim: true, default: "pcs" },
    costPrice: { type: Number, required: true, default: 0 },
    salePrice: { type: Number, required: true, default: 0 },
    openingStock: { type: Number, required: true, default: 0 },
    currentStock: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default models.Item || model<IItem>("Item", ItemSchema);
