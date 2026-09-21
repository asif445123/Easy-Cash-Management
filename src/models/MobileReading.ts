import mongoose, { Schema, models, model } from "mongoose";

export interface IMobileReading {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  reading: number;
  // Set only on a "recharge" entry — the amount just topped up. This
  // resets the tracking cycle: the reading on THIS entry becomes the new
  // baseline ("Last Reading"), and baseline + changeAmount becomes the
  // new "Limit" for the cycle. Plain reading updates in between (no
  // recharge) leave changeAmount at 0 and just move "Current Reading".
  changeAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MobileReadingSchema = new Schema<IMobileReading>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    reading: { type: Number, required: true },
    changeAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MobileReadingSchema.index({ userId: 1, date: 1 });

export default models.MobileReading || model<IMobileReading>("MobileReading", MobileReadingSchema);
