import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const accounts = await Account.find({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ accounts });
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
  const {
    type,
    code,
    description,
    address,
    telephone,
    mobile,
    fax,
    email,
    openingDebit,
    openingCredit,
    creditLimit,
  } = body;

  if (!type?.trim() || !code?.trim() || !description?.trim()) {
    return NextResponse.json(
      { message: "Type, account code, and description are required." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existing = await Account.findOne({ userId: user.userId, code: code.trim() });
    if (existing) {
      return NextResponse.json({ message: "An account with this code already exists." }, { status: 409 });
    }

    const account = await Account.create({
      userId: user.userId,
      type: type.trim(),
      code: code.trim(),
      description: description.trim(),
      address,
      telephone,
      mobile,
      fax,
      email,
      openingDebit: openingDebit ?? 0,
      openingCredit: openingCredit ?? 0,
      creditLimit: creditLimit ?? 0,
    });

    return NextResponse.json({ message: "Account created.", account }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
