import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendResetEmail } from "@/lib/mail";

const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a password reset link.";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return the same generic message whether or not the user exists,
    // so this endpoint can't be used to check which emails are registered.
    if (!user) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetTokenHash = tokenHash;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/reset-password/${rawToken}`;

    try {
      await sendResetEmail(user.email, resetUrl);
    } catch (mailErr) {
      // Log the FULL error server-side so the real cause (bad SMTP creds,
      // missing env vars, Gmail auth rejection, etc.) is visible in your
      // terminal — but the browser still only ever sees the generic message.
      console.error("Failed to send reset email:", mailErr);
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("Forgot-password error:", err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
