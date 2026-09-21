import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";
import Account from "@/models/Account";
import AccountType from "@/models/AccountType";
import { getAccountMovements } from "@/lib/ledger";

/**
 * Year-wise report data for a range of years — same idea as the
 * month-wise report, just one bucket per year instead of per month.
 * Shared by both the "Year Wise Report" page (shows the whole range as a
 * matrix) and "Year Wise Comparison" page (walks the same years,
 * comparing each to the one before it).
 */
export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const fromYear = parseInt(params.get("fromYear") || "", 10);
  const toYear = parseInt(params.get("toYear") || "", 10);
  if (!fromYear || !toYear || toYear < fromYear) {
    return NextResponse.json({ message: "A valid fromYear/toYear range is required." }, { status: 400 });
  }
  if (toYear - fromYear > 20) {
    return NextResponse.json({ message: "Please pick a range of 20 years or fewer." }, { status: 400 });
  }

  try {
    await connectDB();
    const userId = user.userId;
    const years: number[] = [];
    for (let y = fromYear; y <= toYear; y++) years.push(y);

    const accountTypes = await AccountType.find({ userId });
    const incomeTypeNames = accountTypes.filter((t) => t.isIncomeType).map((t) => t.type);
    const expenseTypeNames = accountTypes.filter((t) => t.isExpenseType).map((t) => t.type);

    const incomeAccounts = await Account.find({ userId, type: { $in: incomeTypeNames } }).sort({
      code: 1,
    });
    const expenseAccounts = await Account.find({ userId, type: { $in: expenseTypeNames } }).sort({
      code: 1,
    });

    async function yearlyAmounts(accountCode: string, isIncome: boolean): Promise<number[]> {
      const amounts: number[] = [];
      for (const y of years) {
        const from = new Date(y, 0, 1);
        const to = new Date(y, 11, 31, 23, 59, 59);
        const movements = await getAccountMovements(userId, accountCode, from, to);
        const net = movements.reduce(
          (s, mv) => s + (isIncome ? mv.credit - mv.debit : mv.debit - mv.credit),
          0
        );
        amounts.push(Math.max(0, net));
      }
      return amounts;
    }

    const incomeRows: { code: string; description: string; years: number[] }[] = [];
    for (const a of incomeAccounts) {
      incomeRows.push({ code: a.code, description: a.description, years: await yearlyAmounts(a.code, true) });
    }

    const expenseRows: { code: string; description: string; years: number[] }[] = [];
    for (const a of expenseAccounts) {
      expenseRows.push({ code: a.code, description: a.description, years: await yearlyAmounts(a.code, false) });
    }

    const totalIncomeByYear = years.map((_, i) => incomeRows.reduce((s, r) => s + r.years[i], 0));
    const totalExpenseByYear = years.map((_, i) => expenseRows.reduce((s, r) => s + r.years[i], 0));

    return NextResponse.json({ years, incomeRows, expenseRows, totalIncomeByYear, totalExpenseByYear });
  } catch (err) {
    return handleApiError(err);
  }
}
