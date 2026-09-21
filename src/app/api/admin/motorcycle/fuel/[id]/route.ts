import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FuelPurchase from "@/models/FuelPurchase";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
    const purchase = await FuelPurchase.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      { date: new Date(date), amount: Number(amount), rate: Number(rate), quantity },
      { new: true }
    );
    if (!purchase) {
      return NextResponse.json({ message: "Fuel purchase not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Fuel purchase updated.", purchase });
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
    const purchase = await FuelPurchase.findOneAndDelete({ _id: params.id, userId: user.userId });
    if (!purchase) {
      return NextResponse.json({ message: "Fuel purchase not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Fuel purchase deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
