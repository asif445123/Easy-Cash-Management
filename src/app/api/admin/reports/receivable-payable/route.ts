import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import AccountType from "@/models/AccountType";
import { getAccountBalance } from "@/lib/ledger";
import { requireApprovedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const asOf = params.get("asOf");
  const mode = (params.get("mode") || "all") as "receivable" | "payable" | "all";

  if (!asOf) {
    return NextResponse.json({ message: "asOf date is required." }, { status: 400 });
  }

  await connectDB();

  // Only this user's account types explicitly flagged for the Receivable/Payable list.
  const rpTypes = await AccountType.find({ userId: user.userId, showInReceivablePayableList: true });
  const rpTypeNames = rpTypes.map((t) => t.type);

  if (rpTypeNames.length === 0) {
    return NextResponse.json({ receivable: [], payable: [] });
  }

  const accounts = await Account.find({ userId: user.userId, type: { $in: rpTypeNames } }).sort({
    code: 1,
  });
  const asOfDate = new Date(asOf);

  const receivable: Array<{ account: unknown; balance: number }> = [];
  const payable: Array<{ account: unknown; balance: number }> = [];

  for (const account of accounts) {
    const balance = await getAccountBalance(user.userId, account, asOfDate);
    if (balance > 0.005) {
      receivable.push({ account, balance });
    } else if (balance < -0.005) {
      payable.push({ account, balance: -balance });
    }
  }

  return NextResponse.json({
    receivable: mode === "payable" ? [] : receivable,
    payable: mode === "receivable" ? [] : payable,
  });
}
