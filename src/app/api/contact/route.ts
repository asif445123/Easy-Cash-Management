import { NextRequest, NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { message: "Full name, email, and message are all required." },
        { status: 400 }
      );
    }

    try {
      await sendContactMessage(name.trim(), email.trim(), message.trim());
    } catch (mailErr) {
      console.error("Failed to send contact message:", mailErr);
      return NextResponse.json(
        { message: "Could not send your message right now. Please try again shortly." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Message sent." });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
