import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MobileReading from "@/models/MobileReading";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const readings = await MobileReading.find({ userId: user.userId }).sort({ date: 1 });
    return NextResponse.json({ readings });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
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
    const doc = await MobileReading.create({
      userId: user.userId,
      date: new Date(date),
      reading: Number(reading),
      changeAmount: Number(changeAmount) || 0,
    });
    return NextResponse.json({ message: "Mobile reading saved.", reading: doc }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
