import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import { getAccountBalance, getAccountMovements, netBalance } from "@/lib/ledger";
import { requireApprovedUser } from "@/lib/auth";

async function loadPeriod(userId: string, type: string | undefined, from: Date, to: Date) {
  const filter: Record<string, unknown> = { userId };
  if (type) filter.type = type;
  const accounts = await Account.find(filter).sort({ code: 1 });

  const rows = [];
  const totals = { openingDebit: 0, openingCredit: 0, txnDebit: 0, txnCredit: 0, closingDebit: 0, closingCredit: 0 };

  for (const account of accounts) {
    const openingBalance = await getAccountBalance(userId, account, new Date(from.getTime() - 1));
    const movements = await getAccountMovements(userId, account.code, from, to);
    const txnNet = netBalance(movements);
    const closingBalance = openingBalance + txnNet;

    const row = {
      account,
      openingDebit: openingBalance > 0 ? openingBalance : 0,
      openingCredit: openingBalance < 0 ? -openingBalance : 0,
      txnDebit: movements.reduce((s, m) => s + m.debit, 0),
      txnCredit: movements.reduce((s, m) => s + m.credit, 0),
      closingDebit: closingBalance > 0 ? closingBalance : 0,
      closingCredit: closingBalance < 0 ? -closingBalance : 0,
    };
    rows.push(row);

    totals.openingDebit += row.openingDebit;
    totals.openingCredit += row.openingCredit;
    totals.txnDebit += row.txnDebit;
    totals.txnCredit += row.txnCredit;
    totals.closingDebit += row.closingDebit;
    totals.closingCredit += row.closingCredit;
  }

  return { rows, totals };
}

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const type = params.get("type") || undefined;
  const compare = params.get("compare") === "true";
  const compareFrom = params.get("compareFrom");
  const compareTo = params.get("compareTo");

  if (!from || !to) {
    return NextResponse.json({ message: "from and to dates are required." }, { status: 400 });
  }

  await connectDB();

  const current = await loadPeriod(user.userId, type, new Date(from), new Date(to));

  let comparison = null;
  if (compare && compareFrom && compareTo) {
    comparison = await loadPeriod(user.userId, type, new Date(compareFrom), new Date(compareTo));
  }

  return NextResponse.json({ current, comparison });
}
