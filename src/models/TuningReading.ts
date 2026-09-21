import mongoose, { Schema, models, model } from "mongoose";

export interface ITuningReading {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  reading: number;
  // Set only on a "recharge"/top-up entry — see MobileReading for the
  // full explanation of how this resets the tracking cycle.
  changeAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TuningReadingSchema = new Schema<ITuningReading>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    reading: { type: Number, required: true },
    changeAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TuningReadingSchema.index({ userId: 1, date: 1 });

export default models.TuningReading || model<ITuningReading>("TuningReading", TuningReadingSchema);
