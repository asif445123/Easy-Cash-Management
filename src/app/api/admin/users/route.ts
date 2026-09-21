import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  await connectDB();
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  return NextResponse.json({ users });
}
