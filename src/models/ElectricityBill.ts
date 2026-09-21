import mongoose, { Schema, models, model } from "mongoose";

export interface IElectricityCharge {
  label: string;
  amount: number;
}

export interface IElectricityBill {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  periodStart: Date; // bill period start — after the previous meter reading, per how the real bill works
  periodEnd: Date; // bill period end — on/before the next meter reading
  billMonth: number; // 0-11 (January = 0, December = 11) — the month this bill represents
  billYear: number;  // e.g. 2026
  charges: IElectricityCharge[]; // flexible line items: Meter Rent, FPA, FC Surcharge, Electricity Duty, Late Fee, etc.
  createdAt: Date;
  updatedAt: Date;
}

const ElectricityChargeSchema = new Schema<IElectricityCharge>(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ElectricityBillSchema = new Schema<IElectricityBill>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    billMonth: { type: Number, required: true },
    billYear: { type: Number, required: true },
    charges: { type: [ElectricityChargeSchema], default: [] },
  },
  { timestamps: true }
);

ElectricityBillSchema.index({ userId: 1, periodStart: 1 });

export default models.ElectricityBill || model<IElectricityBill>("ElectricityBill", ElectricityBillSchema);
