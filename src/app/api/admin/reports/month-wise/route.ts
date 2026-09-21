import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";
import Account from "@/models/Account";
import AccountType from "@/models/AccountType";
import { getAccountMovements } from "@/lib/ledger";

/**
 * Month-wise report data for one calendar year — shared by both the
 * "Month wise report" page (shows one year) and "Month wise comparison"
 * page (fetches this twice, once per year, and compares them client-side).
 *
 * For each Income/Expense-type account (same classification as the
 * Dashboard — see the "Counts as Income/Expense" checkboxes on Account
 * Types), returns its net amount for each of the 12 months of the
 * requested year:
 *   - Income accounts: net CREDIT per month
 *   - Expense accounts: net DEBIT per month
 * Combines Cash Book + Journal Voucher entries via the same
 * getAccountMovements() used everywhere else, so this always agrees with
 * the Dashboard and Trial Balance.
 */
export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const yearParam = req.nextUrl.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  if (!year || isNaN(year)) {
    return NextResponse.json({ message: "A valid year is required." }, { status: 400 });
  }

  try {
    await connectDB();
    const userId = user.userId;

    const accountTypes = await AccountType.find({ userId });
    const incomeTypeNames = accountTypes.filter((t) => t.isIncomeType).map((t) => t.type);
    const expenseTypeNames = accountTypes.filter((t) => t.isExpenseType).map((t) => t.type);

    const incomeAccounts = await Account.find({ userId, type: { $in: incomeTypeNames } }).sort({
      code: 1,
    });
    const expenseAccounts = await Account.find({ userId, type: { $in: expenseTypeNames } }).sort({
      code: 1,
    });

    async function monthlyAmounts(accountCode: string, isIncome: boolean): Promise<number[]> {
      const months: number[] = [];
      for (let m = 0; m < 12; m++) {
        const from = new Date(year, m, 1);
        const to = new Date(year, m + 1, 0, 23, 59, 59);
        const movements = await getAccountMovements(userId, accountCode, from, to);
        const net = movements.reduce(
          (s, mv) => s + (isIncome ? mv.credit - mv.debit : mv.debit - mv.credit),
          0
        );
        months.push(Math.max(0, net));
      }
      return months;
    }

    const incomeRows = [];
    for (const a of incomeAccounts) {
      incomeRows.push({
        code: a.code,
        description: a.description,
        months: await monthlyAmounts(a.code, true),
      });
    }

    const expenseRows = [];
    for (const a of expenseAccounts) {
      expenseRows.push({
        code: a.code,
        description: a.description,
        months: await monthlyAmounts(a.code, false),
      });
    }

    const totalIncomeByMonth = Array.from({ length: 12 }, (_, m) =>
      incomeRows.reduce((s, r) => s + r.months[m], 0)
    );
    const totalExpenseByMonth = Array.from({ length: 12 }, (_, m) =>
      expenseRows.reduce((s, r) => s + r.months[m], 0)
    );

    return NextResponse.json({
      year,
      incomeRows,
      expenseRows,
      totalIncomeByMonth,
      totalExpenseByMonth,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
