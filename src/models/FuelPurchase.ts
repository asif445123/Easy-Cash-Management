import mongoose, { Schema, models, model } from "mongoose";

export interface IFuelPurchase {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  amount: number; // Rs spent
  rate: number; // Rs per liter that day
  quantity: number; // liters, = amount / rate
  createdAt: Date;
  updatedAt: Date;
}

const FuelPurchaseSchema = new Schema<IFuelPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    rate: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

FuelPurchaseSchema.index({ userId: 1, date: 1 });

export default models.FuelPurchase || model<IFuelPurchase>("FuelPurchase", FuelPurchaseSchema);
