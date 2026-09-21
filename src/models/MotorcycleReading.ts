import mongoose, { Schema, models, model } from "mongoose";

export interface IMotorcycleReading {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  reading: number; // odometer value at this date
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MotorcycleReadingSchema = new Schema<IMotorcycleReading>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    reading: { type: Number, required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

MotorcycleReadingSchema.index({ userId: 1, date: 1 });

export default models.MotorcycleReading ||
  model<IMotorcycleReading>("MotorcycleReading", MotorcycleReadingSchema);
