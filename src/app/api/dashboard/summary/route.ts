import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";
import Account from "@/models/Account";
import AccountType from "@/models/AccountType";
import { getAccountBalance, getAccountMovements } from "@/lib/ledger";

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Dashboard numbers, scoped to the logged-in user's own books.
 *
 * Cash/Bank accounts, and which types count as Income/Expense, are all
 * determined by the ACCOUNT TYPE flags set on the Account Types screen
 * ("This is a Cash/Bank account type", "Counts as Income", "Counts as
 * Expense") — not by which screen (Cash Book vs Journal Voucher) you
 * happened to record a transaction on.
 *
 * - balance: net balance of every account whose type is marked
 *   Cash/Bank, as of TODAY (a point-in-time figure, not affected by the
 *   date range below) — plus a per-account breakdown.
 * - income / expense / expenseBreakdown / recentTransactions: scoped to
 *   the `from`/`to` date range in the query string. Defaults to the
 *   current calendar month if not provided, combining BOTH Cash Book and
 *   Journal Voucher entries via the same getAccountMovements() used by
 *   Trial Balance and Account Ledger, so the numbers agree with those
 *   reports for the same range.
 *
 * A user with no accounts/entries yet gets all zeros and empty lists —
 * never another user's data.
 */
export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const fromParam = params.get("from");
  const toParam = params.get("to");
  const fromDate = fromParam ? new Date(fromParam) : firstOfMonth();
  const toDate = toParam ? new Date(toParam) : new Date();

  try {
    await connectDB();

    const accountTypes = await AccountType.find({ userId: user.userId });

    // Prefer explicit checkboxes when any are set. If NONE are set for a
    // given classification, fall back to matching the type's name — this
    // means a brand-new user (or one who hasn't set the checkboxes yet)
    // still gets a working dashboard immediately, as long as their types
    // are named sensibly (e.g. "Cash", "Bank", "Income", "Expenses").
    const explicitCashBank = accountTypes.filter((t) => t.isCashBankType);
    const cashBankTypeNames =
      explicitCashBank.length > 0
        ? explicitCashBank.map((t) => t.type)
        : accountTypes.filter((t) => /cash|bank/i.test(t.type)).map((t) => t.type);

    const explicitIncome = accountTypes.filter((t) => t.isIncomeType);
    const incomeTypeNames =
      explicitIncome.length > 0
        ? explicitIncome.map((t) => t.type)
        : accountTypes.filter((t) => /income/i.test(t.type)).map((t) => t.type);

    const explicitExpense = accountTypes.filter((t) => t.isExpenseType);
    const expenseTypeNames =
      explicitExpense.length > 0
        ? explicitExpense.map((t) => t.type)
        : accountTypes.filter((t) => /expense/i.test(t.type)).map((t) => t.type);

    const cashBankAccountDocs = await Account.find({
      userId: user.userId,
      type: { $in: cashBankTypeNames },
    }).sort({ code: 1 });

    if (cashBankAccountDocs.length === 0) {
      return NextResponse.json({
        balance: 0,
        income: 0,
        expense: 0,
        cashBankAccounts: [],
        expenseBreakdown: [],
        recentTransactions: [],
      });
    }

    const now = new Date();

    const cashBankAccounts = [];
    let balance = 0;
    for (const account of cashBankAccountDocs) {
      const currentBalance = await getAccountBalance(user.userId, account, now);
      balance += currentBalance;
      cashBankAccounts.push({
        code: account.code,
        description: account.description,
        opening: account.openingDebit - account.openingCredit,
        balance: currentBalance,
      });
    }

    const incomeAccounts = await Account.find({ userId: user.userId, type: { $in: incomeTypeNames } });
    const expenseAccounts = await Account.find({ userId: user.userId, type: { $in: expenseTypeNames } });

    let income = 0;
    let expense = 0;
    const expenseByAccount = new Map<string, { description: string; amount: number }>();
    const transactions: Array<{
      id: string;
      title: string;
      date: Date;
      amount: number;
      type: "income" | "expense";
    }> = [];

    for (const account of incomeAccounts) {
      const movements = await getAccountMovements(user.userId, account.code, fromDate, toDate);
      for (const m of movements) {
        const net = m.credit - m.debit; // income accounts: net credit = income recognized
        if (net <= 0) continue;
        income += net;
        transactions.push({
          id: `${account.code}-${m.voucherRef}-${m.date.getTime()}`,
          title: m.narration || `${account.description} (${m.voucherRef})`,
          date: m.date,
          amount: net,
          type: "income",
        });
      }
    }

    for (const account of expenseAccounts) {
      const movements = await getAccountMovements(user.userId, account.code, fromDate, toDate);
      for (const m of movements) {
        const net = m.debit - m.credit; // expense accounts: net debit = expense recognized
        if (net <= 0) continue;
        expense += net;

        const existing = expenseByAccount.get(account.code);
        if (existing) {
          existing.amount += net;
        } else {
          expenseByAccount.set(account.code, { description: account.description, amount: net });
        }

        transactions.push({
          id: `${account.code}-${m.voucherRef}-${m.date.getTime()}`,
          title: m.narration || `${account.description} (${m.voucherRef})`,
          date: m.date,
          amount: net,
          type: "expense",
        });
      }
    }

    const expenseBreakdown = Array.from(expenseByAccount.entries())
      .map(([code, v]) => ({
        code,
        description: v.description,
        amount: v.amount,
        percent: expense > 0 ? (v.amount / expense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return NextResponse.json({ balance, income, expense, cashBankAccounts, expenseBreakdown, recentTransactions });
  } catch (err) {
    return handleApiError(err);
  }
}
