import mongoose, { Schema, models, model } from "mongoose";

export interface ICashEntry {
  entryNo: number;
  accountCode: string;
  narration?: string;
  receipt: number;
  payment: number;
}

export interface ICashVoucher {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // owner — each user's cash book is private to them
  serialNumber: number; // shown to the user as "CB <serialNumber>", numbered per-user
  cashBankAccountCode: string; // references Account.code (scoped to the same user)
  date: Date;
  entries: ICashEntry[];
  totalReceipt: number;
  totalPayment: number;
  createdAt: Date;
  updatedAt: Date;
}

const CashEntrySchema = new Schema<ICashEntry>(
  {
    entryNo: { type: Number, required: true },
    accountCode: { type: String, required: true, trim: true },
    narration: { type: String, trim: true },
    receipt: { type: Number, default: 0 },
    payment: { type: Number, default: 0 },
  },
  { _id: false }
);

const CashVoucherSchema = new Schema<ICashVoucher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serialNumber: { type: Number, required: true },
    cashBankAccountCode: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    entries: { type: [CashEntrySchema], default: [] },
    totalReceipt: { type: Number, default: 0 },
    totalPayment: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CashVoucherSchema.index({ userId: 1, serialNumber: 1 }, { unique: true });

export default models.CashVoucher || model<ICashVoucher>("CashVoucher", CashVoucherSchema);
