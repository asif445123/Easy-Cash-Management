import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import { getAccountMovements, getAccountBalance } from "@/lib/ledger";
import { requireApprovedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const type = params.get("type") || undefined;
  const accountCode = params.get("accountCode") || undefined;
  const toCode = params.get("toCode") || undefined;
  const from = params.get("from");
  const to = params.get("to");

  if (!from || !to) {
    return NextResponse.json({ message: "from and to dates are required." }, { status: 400 });
  }

  await connectDB();

  const filter: Record<string, unknown> = { userId: user.userId };
  if (type) filter.type = type;
  if (accountCode && toCode) {
    filter.code = { $gte: accountCode, $lte: toCode };
  } else if (accountCode) {
    filter.code = accountCode;
  }

  const accounts = await Account.find(filter).sort({ code: 1 });
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const ledgers = [];
  for (const account of accounts) {
    const opening = await getAccountBalance(user.userId, account, new Date(fromDate.getTime() - 1));
    const movements = await getAccountMovements(user.userId, account.code, fromDate, toDate);

    let running = opening;
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

    ledgers.push({ account, opening, rows, closing: running });
  }

  return NextResponse.json({ ledgers });
}
