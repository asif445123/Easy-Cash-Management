import mongoose, { Schema, models, model } from "mongoose";

export interface IBudgetLimit {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  mobileLimit: number;
  tuningLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetLimitSchema = new Schema<IBudgetLimit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    mobileLimit: { type: Number, default: 0 },
    tuningLimit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.BudgetLimit || model<IBudgetLimit>("BudgetLimit", BudgetLimitSchema);
