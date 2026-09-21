import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import BudgetLimit from "@/models/BudgetLimit";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const limits = await BudgetLimit.findOne({ userId: user.userId });
    return NextResponse.json({
      mobileLimit: limits?.mobileLimit || 0,
      tuningLimit: limits?.tuningLimit || 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { mobileLimit, tuningLimit } = await req.json();

  try {
    await connectDB();
    const limits = await BudgetLimit.findOneAndUpdate(
      { userId: user.userId },
      { mobileLimit: Number(mobileLimit) || 0, tuningLimit: Number(tuningLimit) || 0 },
      { new: true, upsert: true }
    );
    return NextResponse.json({
      message: "Limits saved.",
      mobileLimit: limits.mobileLimit,
      tuningLimit: limits.tuningLimit,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
