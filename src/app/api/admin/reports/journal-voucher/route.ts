import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JournalVoucher from "@/models/JournalVoucher";
import { requireApprovedUser } from "@/lib/auth";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function loadPeriod(userId: string, from: Date, to: Date, groupBy: "date" | "month") {
  const vouchers = await JournalVoucher.find({ userId, date: { $gte: from, $lte: to } }).sort({
    date: 1,
  });

  const totalDebit = vouchers.reduce((s, v) => s + v.totalDebit, 0);
  const totalCredit = vouchers.reduce((s, v) => s + v.totalCredit, 0);

  if (groupBy === "date") {
    return {
      rows: vouchers.map((v) => ({
        label: v.date.toISOString().slice(0, 10),
        serial: v.serialNumber,
        debit: v.totalDebit,
        credit: v.totalCredit,
      })),
      totalDebit,
      totalCredit,
    };
  }

  const byMonth = new Map<string, { debit: number; credit: number }>();
  for (const v of vouchers) {
    const key = monthKey(v.date);
    const existing = byMonth.get(key) || { debit: 0, credit: 0 };
    existing.debit += v.totalDebit;
    existing.credit += v.totalCredit;
    byMonth.set(key, existing);
  }
  const rows = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({ label, debit: v.debit, credit: v.credit }));

  return { rows, totalDebit, totalCredit };
}

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const groupBy = (params.get("groupBy") === "month" ? "month" : "date") as "date" | "month";
  const compare = params.get("compare") === "true";
  const compareFrom = params.get("compareFrom");
  const compareTo = params.get("compareTo");

  if (!from || !to) {
    return NextResponse.json({ message: "from and to dates are required." }, { status: 400 });
  }

  await connectDB();

  const current = await loadPeriod(user.userId, new Date(from), new Date(to), groupBy);

  let comparison = null;
  if (compare && compareFrom && compareTo) {
    comparison = await loadPeriod(user.userId, new Date(compareFrom), new Date(compareTo), groupBy);
  }

  return NextResponse.json({ current, comparison, groupBy });
}
