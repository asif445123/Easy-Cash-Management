import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AccountType from "@/models/AccountType";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const body = await req.json();
  delete body.userId;

  try {
    await connectDB();

    const accountType = await AccountType.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      body,
      { new: true }
    );
    if (!accountType) {
      return NextResponse.json({ message: "Account type not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Account type updated.", accountType });
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
    const accountType = await AccountType.findOneAndDelete({ _id: params.id, userId: user.userId });
    if (!accountType) {
      return NextResponse.json({ message: "Account type not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Account type deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
