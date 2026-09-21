import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuelPurchase from "@/models/FuelPurchase";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const purchases = await FuelPurchase.find({ userId: user.userId }).sort({ date: 1 });
    return NextResponse.json({ purchases });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { date, amount, rate } = await req.json();
  if (!date || !amount || !rate) {
    return NextResponse.json({ message: "Date, amount, and rate are required." }, { status: 400 });
  }

  try {
    await connectDB();
    const quantity = Number(amount) / Number(rate);
    const purchase = await FuelPurchase.create({
      userId: user.userId,
      date: new Date(date),
      amount: Number(amount),
      rate: Number(rate),
      quantity,
    });
    return NextResponse.json({ message: "Fuel purchase saved.", purchase }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
