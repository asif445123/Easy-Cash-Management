import mongoose from "mongoose";
import CashVoucher from "@/models/CashVoucher";
import JournalVoucher from "@/models/JournalVoucher";
import Account, { IAccount } from "@/models/Account";

/**
 * A single dated movement against an account, normalized from either a
 * Journal Voucher entry or a Cash/Bank Book entry so reports can treat
 * them uniformly.
 */
export interface LedgerMovement {
  date: Date;
  voucherRef: string; // e.g. "JV 4" or "CB 3"
  narration: string;
  debit: number;
  credit: number;
}

type UserId = string | mongoose.Types.ObjectId;

/**
 * Returns every movement that touches `accountCode` *within one user's own
 * books* (userId is always required — there is no cross-user ledger view),
 * across both Journal Vouchers (direct entries) and Cash/Bank Book vouchers
 * — both as the cash/bank side (its own receipts/payments) and as the contra
 * side of one of that same user's other cash/bank vouchers (a receipt
 * against another account credits that account; a payment debits it —
 * standard double entry). Optionally restricted to a [from, to] date range.
 */
export async function getAccountMovements(
  userId: UserId,
  accountCode: string,
  from?: Date,
  to?: Date
): Promise<LedgerMovement[]> {
  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.$gte = from;
  if (to) dateFilter.$lte = to;
  const dateClause = from || to ? { date: dateFilter } : {};

  const movements: LedgerMovement[] = [];

  // 1. Journal Voucher entries directly against this account.
  const journalVouchers = await JournalVoucher.find({
    userId,
    ...dateClause,
    "entries.accountCode": accountCode,
  });
  for (const jv of journalVouchers) {
    for (const entry of jv.entries) {
      if (entry.accountCode !== accountCode) continue;
      movements.push({
        date: jv.date,
        voucherRef: `JV ${jv.serialNumber}`,
        narration: entry.narration || "",
        debit: entry.debit,
        credit: entry.credit,
      });
    }
  }

  // 2. This account acting as the cash/bank side of its own vouchers —
  // each entry's receipt debits the cash/bank account, payment credits it.
  const ownCashVouchers = await CashVoucher.find({
    userId,
    ...dateClause,
    cashBankAccountCode: accountCode,
  });
  for (const cv of ownCashVouchers) {
    for (const entry of cv.entries) {
      movements.push({
        date: cv.date,
        voucherRef: `CB ${cv.serialNumber}`,
        narration: entry.narration || "",
        debit: entry.receipt,
        credit: entry.payment,
      });
    }
  }

  // 3. This account acting as the contra side of one of this same user's
  // other cash/bank vouchers — a receipt against it means it was credited
  // (money came from this account), a payment against it means it was debited.
  const contraCashVouchers = await CashVoucher.find({
    userId,
    ...dateClause,
    cashBankAccountCode: { $ne: accountCode },
    "entries.accountCode": accountCode,
  });
  for (const cv of contraCashVouchers) {
    for (const entry of cv.entries) {
      if (entry.accountCode !== accountCode) continue;
      movements.push({
        date: cv.date,
        voucherRef: `CB ${cv.serialNumber}`,
        narration: entry.narration || `Via ${cv.cashBankAccountCode}`,
        debit: entry.payment,
        credit: entry.receipt,
      });
    }
  }

  movements.sort((a, b) => a.date.getTime() - b.date.getTime());
  return movements;
}

/** Net debit-minus-credit balance from a set of movements. Positive = net debit. */
export function netBalance(movements: LedgerMovement[]): number {
  return movements.reduce((sum, m) => sum + m.debit - m.credit, 0);
}

/**
 * An account's balance as of (and including) `asOf`: its stated opening
 * balance plus every movement up to that date. Positive = net debit,
 * negative = net credit.
 */
export async function getAccountBalance(
  userId: UserId,
  account: IAccount,
  asOf: Date
): Promise<number> {
  const opening = account.openingDebit - account.openingCredit;
  const movements = await getAccountMovements(userId, account.code, undefined, asOf);
  return opening + netBalance(movements);
}

/** Balances for every account of this user (optionally filtered by type) as of a date. */
export async function getAllAccountBalances(userId: UserId, asOf: Date, type?: string) {
  const filter: Record<string, unknown> = { userId };
  if (type) filter.type = type;

  const accounts = await Account.find(filter).sort({ code: 1 });
  const results = [];
  for (const account of accounts) {
    const balance = await getAccountBalance(userId, account, asOf);
    results.push({
      account,
      debit: balance > 0 ? balance : 0,
      credit: balance < 0 ? -balance : 0,
      balance,
    });
  }
  return results;
}

/**
 * The set of account codes this user has ever used as a Cash/Bank account
 * in a Cash Book voucher — i.e. their actual cash/bank accounts, as opposed
 * to customer/supplier/expense accounts. Used to tell a real transfer
 * between two of the user's own cash/bank accounts (not income or expense)
 * apart from an actual receipt/payment against an outside party.
 */
export async function getCashBankAccountCodes(userId: UserId): Promise<string[]> {
  return CashVoucher.distinct("cashBankAccountCode", { userId });
}
