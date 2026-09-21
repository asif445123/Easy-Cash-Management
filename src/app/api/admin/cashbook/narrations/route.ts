import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CashVoucher from "@/models/CashVoucher";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

/**
 * Every distinct, non-empty narration SEGMENT this user has ever typed
 * into a Cash Book entry — used to power the narration autocomplete.
 *
 * Narrations are often combined with commas ("Water, 3 kg milk, other")
 * when building up a line item by item. If we suggested the whole saved
 * string, typing "W" later would surface that entire combined narration
 * instead of just "Water" — so every stored narration is split on commas
 * first, and each individual segment becomes its own suggestion.
 */
export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const narrations: string[] = await CashVoucher.distinct("entries.narration", {
      userId: user.userId,
    });
    const segments = new Set<string>();
    for (const n of narrations) {
      if (!n) continue;
      for (const part of n.split(",")) {
        const trimmed = part.trim();
        if (trimmed) segments.add(trimmed);
      }
    }
    return NextResponse.json({ narrations: Array.from(segments).sort() });
  } catch (err) {
    return handleApiError(err);
  }
}
