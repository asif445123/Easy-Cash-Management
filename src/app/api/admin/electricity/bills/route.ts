import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ElectricityBill from "@/models/ElectricityBill";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const bills = await ElectricityBill.find({ userId: user.userId }).sort({ periodStart: -1 });
    return NextResponse.json({ bills });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { periodStart, periodEnd, billMonth, billYear, charges } = await req.json();
  if (
    !periodStart ||
    !periodEnd ||
    billMonth === undefined ||
    billMonth === null ||
    billYear === undefined ||
    billYear === null ||
    !Array.isArray(charges)
  ) {
    return NextResponse.json(
      { message: "Period start, period end, bill month, bill year, and charges are required." },
      { status: 400 }
    );
  }

  const monthNum = Number(billMonth);
  const yearNum = Number(billYear);
  if (
    !Number.isInteger(monthNum) ||
    monthNum < 0 ||
    monthNum > 11 ||
    !Number.isInteger(yearNum)
  ) {
    return NextResponse.json(
      { message: "Invalid bill month or year." },
      { status: 400 }
    );
  }

  const cleanCharges = charges
    .filter((c: any) => c.label?.trim())
    .map((c: any) => ({ label: c.label.trim(), amount: Number(c.amount) || 0 }));

  try {
    await connectDB();
    const doc = await ElectricityBill.create({
      userId: user.userId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      billMonth: monthNum,
      billYear: yearNum,
      charges: cleanCharges,
    });
    return NextResponse.json({ message: "Bill saved.", bill: doc }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}