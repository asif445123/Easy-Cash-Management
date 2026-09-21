import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const { status } = await req.json();
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(params.id, { status }, { new: true }).select(
    "-passwordHash"
  );

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ message: `User ${status}.`, user });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  await connectDB();
  const user = await User.findByIdAndDelete(params.id);
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "User deleted." });
}
