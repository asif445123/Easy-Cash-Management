import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import { getAccountMovements, getAccountBalance } from "@/lib/ledger";
import { requireApprovedUser } from "@/lib/auth";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function loadPeriod(
  userId: string,
  accountCode: string,
  openingBalance: number,
  from: Date,
  to: Date,
  groupBy: "date" | "month"
) {
  const movements = await getAccountMovements(userId, accountCode, from, to);

  if (groupBy === "date") {
    let running = openingBalance;
    const rows = movements.map((m) => {
      running += m.debit - m.credit;
      return {
        label: m.date.toISOString().slice(0, 10),
        voucherRef: m.voucherRef,
        narration: m.narration,
        debit: m.debit,
        credit: m.credit,
        balance: running,
      };
    });
    return { rows, opening: openingBalance, closing: running };
  }

  const byMonth = new Map<string, { debit: number; credit: number }>();
  for (const m of movements) {
    const key = monthKey(m.date);
    const existing = byMonth.get(key) || { debit: 0, credit: 0 };
    existing.debit += m.debit;
    existing.credit += m.credit;
    byMonth.set(key, existing);
  }
  let running = openingBalance;
  const rows = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => {
      running += v.debit - v.credit;
      return { label, debit: v.debit, credit: v.credit, balance: running };
    });
  return { rows, opening: openingBalance, closing: running };
}

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const accountCode = params.get("accountCode");
  const from = params.get("from");
  const to = params.get("to");
  const groupBy = (params.get("groupBy") === "month" ? "month" : "date") as "date" | "month";
  const compare = params.get("compare") === "true";
  const compareFrom = params.get("compareFrom");
  const compareTo = params.get("compareTo");

  if (!accountCode || !from || !to) {
    return NextResponse.json({ message: "accountCode, from, and to are required." }, { status: 400 });
  }

  await connectDB();

  const account = await Account.findOne({ code: accountCode, userId: user.userId });
  if (!account) {
    return NextResponse.json({ message: "Account not found." }, { status: 404 });
  }

  const fromDate = new Date(from);
  const openingBalance = await getAccountBalance(
    user.userId,
    account,
    new Date(fromDate.getTime() - 1) // balance strictly before `from`
  );

  const current = await loadPeriod(user.userId, accountCode, openingBalance, fromDate, new Date(to), groupBy);

  let comparison = null;
  if (compare && compareFrom && compareTo) {
    const compareFromDate = new Date(compareFrom);
    const compareOpening = await getAccountBalance(
      user.userId,
      account,
      new Date(compareFromDate.getTime() - 1)
    );
    comparison = await loadPeriod(
      user.userId,
      accountCode,
      compareOpening,
      compareFromDate,
      new Date(compareTo),
      groupBy
    );
  }

  return NextResponse.json({ account, current, comparison, groupBy });
}
