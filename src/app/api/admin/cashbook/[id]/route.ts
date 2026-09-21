import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CashVoucher from "@/models/CashVoucher";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  const { cashBankAccountCode, date, entries } = body;

  if (!cashBankAccountCode || !date || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json(
      { message: "Cash/Bank account, date, and at least one entry are required." },
      { status: 400 }
    );
  }

  try {
    const cleanEntries = entries.map((e: any, i: number) => ({
      entryNo: i + 1,
      accountCode: e.accountCode,
      narration: e.narration,
      receipt: Number(e.receipt) || 0,
      payment: Number(e.payment) || 0,
    }));

    const totalReceipt = cleanEntries.reduce((sum: number, e: any) => sum + e.receipt, 0);
    const totalPayment = cleanEntries.reduce((sum: number, e: any) => sum + e.payment, 0);

    await connectDB();

    const voucher = await CashVoucher.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      {
        cashBankAccountCode,
        date: new Date(date),
        entries: cleanEntries,
        totalReceipt,
        totalPayment,
      },
      { new: true }
    );

    if (!voucher) {
      return NextResponse.json({ message: "Cash book entry not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Cash book entry updated.", voucher });
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
    const voucher = await CashVoucher.findOneAndDelete({ _id: params.id, userId: user.userId });
    if (!voucher) {
      return NextResponse.json({ message: "Cash book entry not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Cash book entry deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
