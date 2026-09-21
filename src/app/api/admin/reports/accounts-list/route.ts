import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Account from "@/models/Account";
import { requireApprovedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const type = req.nextUrl.searchParams.get("type") || undefined;

  await connectDB();
  const filter: Record<string, unknown> = { userId: user.userId };
  if (type) filter.type = type;
  const accounts = await Account.find(filter).sort({ type: 1, code: 1 });

  return NextResponse.json({ accounts });
}
