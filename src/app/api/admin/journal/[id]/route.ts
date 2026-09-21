import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JournalVoucher from "@/models/JournalVoucher";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json(
      { message: `Total debit (${totalDebit.toFixed(2)}) must equal total credit (${totalCredit.toFixed(2)}).` },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const voucher = await JournalVoucher.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      { date: new Date(date), entries: cleanEntries, totalDebit, totalCredit },
      { new: true }
    );

    if (!voucher) {
      return NextResponse.json({ message: "Journal voucher not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Journal voucher updated.", voucher });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const voucher = await JournalVoucher.findOneAndDelete({ _id: params.id, userId: user.userId });
    if (!voucher) {
      return NextResponse.json({ message: "Journal voucher not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Journal voucher deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
