import mongoose, { Schema, models, model } from "mongoose";

export interface IAccount {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // owner — each user's chart of accounts is private to them
  type: string; // references AccountType.type (scoped to the same user)
  code: string;
  description: string;
  address?: string;
  telephone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  openingDebit: number;
  openingCredit: number;
  creditLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    telephone: { type: String, trim: true },
    mobile: { type: String, trim: true },
    fax: { type: String, trim: true },
    email: { type: String, trim: true },
    openingDebit: { type: Number, default: 0 },
    openingCredit: { type: Number, default: 0 },
    creditLimit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Account codes only need to be unique within one user's own books — two
// different users can both use code "102001" for their own "Cash in Hand".
AccountSchema.index({ userId: 1, code: 1 }, { unique: true });

export default models.Account || model<IAccount>("Account", AccountSchema);
