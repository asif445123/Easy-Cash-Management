import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ message: "Not authorized." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { message: "Current and new password are required." },
      { status: 400 }
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(authUser.userId);
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "Current password is incorrect." }, { status: 401 });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ message: "Password updated." });
}
