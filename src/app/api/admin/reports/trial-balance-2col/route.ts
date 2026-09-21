import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAllAccountBalances } from "@/lib/ledger";
import { requireApprovedUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const asOf = params.get("asOf");
  const type = params.get("type") || undefined;
  const compare = params.get("compare") === "true";
  const compareAsOf = params.get("compareAsOf");

  if (!asOf) {
    return NextResponse.json({ message: "asOf date is required." }, { status: 400 });
  }

  await connectDB();

  const current = await getAllAccountBalances(user.userId, new Date(asOf), type);

  let comparison = null;
  if (compare && compareAsOf) {
    comparison = await getAllAccountBalances(user.userId, new Date(compareAsOf), type);
  }

  return NextResponse.json({ current, comparison });
}
