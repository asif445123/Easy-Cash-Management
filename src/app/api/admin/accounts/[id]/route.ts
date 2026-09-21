import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
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

    const account = await Account.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      body,
      { new: true }
    );
    if (!account) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Account updated.", account });
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
    const account = await Account.findOneAndDelete({ _id: params.id, userId: user.userId });
    if (!account) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Account deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
