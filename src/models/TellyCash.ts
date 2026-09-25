import mongoose, { Schema, models, model } from "mongoose";

// NOTE: I haven't seen your actual Account.ts model file, so `userId` here
// is typed as a plain String to match how it's used in your accounts route
// (`Account.find({ userId: user.userId })`). If your real models use
// `Schema.Types.ObjectId` with a ref for userId instead, swap this to match
// so it stays consistent with the rest of your schemas.
const TellyCashSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    accountCode: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    // Denomination -> quantity counted, e.g. { "5000": 0, "1000": 4, "500": 1, ... }
    denominations: { type: Map, of: Number, default: {} },
    grandTotal: { type: Number, required: true },
    systemBalance: { type: Number, required: true },
    difference: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.TellyCash || model("TellyCash", TellyCashSchema);
