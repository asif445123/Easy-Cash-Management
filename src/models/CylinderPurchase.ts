import mongoose, { Schema, models, model } from "mongoose";

export interface ICylinderPurchase {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number; // Rs spent
  rate: number; // Rs per kg that day
  quantity: number; // kg, = amount / rate
  createdAt: Date;
  updatedAt: Date;
}

const CylinderPurchaseSchema = new Schema<ICylinderPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

CylinderPurchaseSchema.index({ userId: 1, date: 1 });

export default models.CylinderPurchase || model<ICylinderPurchase>("CylinderPurchase", CylinderPurchaseSchema);
