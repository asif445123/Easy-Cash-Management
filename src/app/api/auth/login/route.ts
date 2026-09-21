import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, remember } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    // Block login for non-approved accounts, but tell the client the status
    // so the UI can offer the "View Demo" fallback.
    if (user.status !== "approved") {
      return NextResponse.json(
        {
          message:
            user.status === "pending"
              ? "Your account is awaiting admin approval."
              : "Your account request was rejected. Contact the admin for details.",
          status: user.status,
        },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    });

    const res = NextResponse.json({
      message: "Logged in successfully.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
    });

    // "Remember me" controls how long the browser keeps the cookie:
    // checked -> persists 30 days; unchecked -> session cookie, cleared when
    // the browser closes. Either way the JWT itself still expires per
    // JWT_EXPIRES_IN, which acts as a hard ceiling.
    const cookieOptions: Parameters<typeof res.cookies.set>[2] = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };
    if (remember) {
      cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
    }

    res.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout
  const res = NextResponse.json({ message: "Logged out." });
  res.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
