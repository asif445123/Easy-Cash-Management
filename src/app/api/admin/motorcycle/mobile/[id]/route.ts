import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MobileReading from "@/models/MobileReading";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { date, reading, changeAmount } = await req.json();
  if (!date || reading === undefined || reading === null || reading === "") {
    return NextResponse.json({ message: "Date and reading are required." }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await MobileReading.findOneAndUpdate(
      { _id: params.id, userId: user.userId },
      { date: new Date(date), reading: Number(reading), changeAmount: Number(changeAmount) || 0 },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ message: "Reading not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Reading updated.", reading: doc });
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
    const doc = await MobileReading.findOneAndDelete({ _id: params.id, userId: user.userId });
    if (!doc) {
      return NextResponse.json({ message: "Reading not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Reading deleted." });
  } catch (err) {
    return handleApiError(err);
  }
}
