import mongoose, { Schema, models, model } from "mongoose";

export interface IAccountType {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // owner — each user's account types are private to them
  serial: number;
  type: string;
  showInReceivablePayableList: boolean;
  isIncomeType: boolean;
  isExpenseType: boolean;
  isCashBankType: boolean;
  // Any Cash Book / Journal Voucher entry against an account of this type
  // automatically counts toward the Motorcycle Report's fuel cost, Mobile
  // spending, or Tuning spending respectively — no separate manual entry
  // needed for the cost side.
  isMotorcycleType: boolean;
  isMobileType: boolean;
  isTuningType: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountTypeSchema = new Schema<IAccountType>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serial: { type: Number, required: true },
    type: { type: String, required: true, trim: true },
    showInReceivablePayableList: { type: Boolean, default: false },
    isIncomeType: { type: Boolean, default: false },
    isExpenseType: { type: Boolean, default: false },
    isCashBankType: { type: Boolean, default: false },
    isMotorcycleType: { type: Boolean, default: false },
    isMobileType: { type: Boolean, default: false },
    isTuningType: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Uniqueness is scoped per user, not global — two different users can each
// have their own "Bank" type, their own serial #1, etc.
AccountTypeSchema.index({ userId: 1, type: 1 }, { unique: true });
AccountTypeSchema.index({ userId: 1, serial: 1 }, { unique: true });

export default models.AccountType || model<IAccountType>("AccountType", AccountTypeSchema);
