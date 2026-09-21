import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  await connectDB();
  const user = await User.findById(authUser.userId).select("-passwordHash");
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ message: "Not authorized." }, { status: 401 });
  }

  const { name, email, phone } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ message: "Name and email are required." }, { status: 400 });
  }

  await connectDB();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: authUser.userId } });
  if (existing) {
    return NextResponse.json({ message: "Another account already uses this email." }, { status: 409 });
  }

  const user = await User.findByIdAndUpdate(
    authUser.userId,
    { name: name.trim(), email: normalizedEmail, phone: phone?.trim() },
    { new: true }
  ).select("-passwordHash");

  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Profile updated.", user });
}

