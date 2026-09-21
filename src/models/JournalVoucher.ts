import mongoose, { Schema, models, model } from "mongoose";

export interface IJournalEntry {
  entryNo: number;
  accountCode: string;
  narration?: string;
  debit: number;
  credit: number;
}

export interface IJournalVoucher {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // owner — each user's journal is private to them
  serialNumber: number; // shown to the user as "JV <serialNumber>", numbered per-user
  date: Date;
  entries: IJournalEntry[];
  totalDebit: number;
  totalCredit: number;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    entryNo: { type: Number, required: true },
    accountCode: { type: String, required: true, trim: true },
    narration: { type: String, trim: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
  },
  { _id: false }
);

const JournalVoucherSchema = new Schema<IJournalVoucher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serialNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    entries: { type: [JournalEntrySchema], default: [] },
    totalDebit: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

JournalVoucherSchema.index({ userId: 1, serialNumber: 1 }, { unique: true });

export default models.JournalVoucher || model<IJournalVoucher>("JournalVoucher", JournalVoucherSchema);
