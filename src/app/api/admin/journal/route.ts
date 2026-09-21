import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JournalVoucher from "@/models/JournalVoucher";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const vouchers = await JournalVoucher.find({ userId: user.userId }).sort({ serialNumber: -1 });
    return NextResponse.json({ vouchers });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { date, entries } = body;

  if (!date || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ message: "Date and at least one entry are required." }, { status: 400 });
  }

  const cleanEntries = entries.map((e: any, i: number) => ({
    entryNo: i + 1,
    accountCode: e.accountCode,
    narration: e.narration,
    debit: Number(e.debit) || 0,
    credit: Number(e.credit) || 0,
  }));

  const totalDebit = cleanEntries.reduce((sum: number, e: any) => sum + e.debit, 0);
  const totalCredit = cleanEntries.reduce((sum: number, e: any) => sum + e.credit, 0);

  // A journal voucher must balance — this is fundamental double-entry bookkeeping,
  // not an arbitrary rule, so we enforce it server-side too (not just in the UI).
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json(
      { message: `Total debit (${totalDebit.toFixed(2)}) must equal total credit (${totalCredit.toFixed(2)}).` },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const last = await JournalVoucher.findOne({ userId: user.userId }).sort({ serialNumber: -1 });
    const nextSerial = (last?.serialNumber || 0) + 1;

    const voucher = await JournalVoucher.create({
      userId: user.userId,
      serialNumber: nextSerial,
      date: new Date(date),
      entries: cleanEntries,
      totalDebit,
      totalCredit,
    });

    return NextResponse.json({ message: "Journal voucher saved.", voucher }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
