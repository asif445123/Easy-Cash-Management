import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ElectricityReading from "@/models/ElectricityReading";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const readings = await ElectricityReading.find({ userId: user.userId }).sort({ date: -1 });
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

  const { date, reading, withMotor } = await req.json();
  if (!date || reading === undefined || reading === null || reading === "") {
    return NextResponse.json({ message: "Date and meter reading are required." }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await ElectricityReading.create({
      userId: user.userId,
      date: new Date(date),
      reading: Number(reading),
      withMotor: !!withMotor,
    });
    return NextResponse.json({ message: "Reading saved.", reading: doc }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
