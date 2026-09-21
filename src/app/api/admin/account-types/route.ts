import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AccountType from "@/models/AccountType";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const accountTypes = await AccountType.find({ userId: user.userId }).sort({ serial: 1 });
    return NextResponse.json({ accountTypes });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const {
    type,
    showInReceivablePayableList,
    isIncomeType,
    isExpenseType,
    isCashBankType,
    isMotorcycleType,
    isMobileType,
    isTuningType,
  } = await req.json();
  if (!type?.trim()) {
    return NextResponse.json({ message: "Type is required." }, { status: 400 });
  }

  try {
    await connectDB();

    const existing = await AccountType.findOne({ userId: user.userId, type: type.trim() });
    if (existing) {
      return NextResponse.json({ message: "This account type already exists." }, { status: 409 });
    }

    // Serial # auto-increments per user, the way the original screen showed it read-only.
    const last = await AccountType.findOne({ userId: user.userId }).sort({ serial: -1 });
    const nextSerial = (last?.serial || 0) + 1;

    const accountType = await AccountType.create({
      userId: user.userId,
      serial: nextSerial,
      type: type.trim(),
      showInReceivablePayableList: !!showInReceivablePayableList,
      isIncomeType: !!isIncomeType,
      isExpenseType: !!isExpenseType,
      isCashBankType: !!isCashBankType,
      isMotorcycleType: !!isMotorcycleType,
      isMobileType: !!isMobileType,
      isTuningType: !!isTuningType,
    });

    return NextResponse.json({ message: "Account type created.", accountType }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
