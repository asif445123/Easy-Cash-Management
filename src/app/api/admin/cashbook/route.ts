import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CashVoucher from "@/models/CashVoucher";
import Account from "@/models/Account";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const accountCode = req.nextUrl.searchParams.get("accountCode");
  if (!accountCode) {
    return NextResponse.json({ message: "accountCode is required." }, { status: 400 });
  }

  try {
    await connectDB();

    const account = await Account.findOne({ code: accountCode, userId: user.userId });
    const vouchers = await CashVoucher.find({
      userId: user.userId,
      cashBankAccountCode: accountCode,
    }).sort({ serialNumber: 1 });

    const postedReceipt = vouchers.reduce((sum, v) => sum + v.totalReceipt, 0);
    const postedPayment = vouchers.reduce((sum, v) => sum + v.totalPayment, 0);
    const opening =
      (account?.openingDebit || 0) - (account?.openingCredit || 0) + postedReceipt - postedPayment;

    return NextResponse.json({ vouchers, opening, account });
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
  const { cashBankAccountCode, date, entries } = body;

  if (!cashBankAccountCode || !date || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json(
      { message: "Cash/Bank account, date, and at least one entry are required." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const last = await CashVoucher.findOne({ userId: user.userId }).sort({ serialNumber: -1 });
    const nextSerial = (last?.serialNumber || 0) + 1;

    const cleanEntries = entries.map((e: any, i: number) => ({
      entryNo: i + 1,
      accountCode: e.accountCode,
      narration: e.narration,
      receipt: Number(e.receipt) || 0,
      payment: Number(e.payment) || 0,
    }));

    const totalReceipt = cleanEntries.reduce((sum: number, e: any) => sum + e.receipt, 0);
    const totalPayment = cleanEntries.reduce((sum: number, e: any) => sum + e.payment, 0);

    const voucher = await CashVoucher.create({
      userId: user.userId,
      serialNumber: nextSerial,
      cashBankAccountCode,
      date: new Date(date),
      entries: cleanEntries,
      totalReceipt,
      totalPayment,
    });

    return NextResponse.json({ message: "Cash book entry saved.", voucher }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
