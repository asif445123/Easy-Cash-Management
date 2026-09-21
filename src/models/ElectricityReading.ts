import mongoose, { Schema, models, model } from "mongoose";

export interface IElectricityReading {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  reading: number; // meter reading on this date — units used = this reading minus the previous entry's reading, same as the Motorcycle Odometer
  withMotor: boolean; // whether the motor/pump was running during the period since the previous reading
  createdAt: Date;
  updatedAt: Date;
}

const ElectricityReadingSchema = new Schema<IElectricityReading>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    reading: { type: Number, required: true },
    withMotor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ElectricityReadingSchema.index({ userId: 1, date: 1 });

// In Next.js dev mode, Mongoose can keep a previously-compiled model
// cached across file edits — a plain hot-reload isn't always enough to
// pick up a schema change, only a full server restart. Clearing the
// cached model here (dev only) means editing this file always takes
// effect immediately, without needing to remember to restart anything.
if (process.env.NODE_ENV !== "production" && models.ElectricityReading) {
  delete models.ElectricityReading;
}

export default models.ElectricityReading ||
  model<IElectricityReading>("ElectricityReading", ElectricityReadingSchema);
