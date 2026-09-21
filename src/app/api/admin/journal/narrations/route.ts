import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import JournalVoucher from "@/models/JournalVoucher";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

/**
 * Every distinct, non-empty narration SEGMENT this user has ever typed
 * into a Journal Voucher entry — used to power the narration autocomplete.
 * Stored narrations are split on commas first (see the Cash Book version
 * of this route for why), so a combined narration like "Water, 3 kg milk"
 * suggests "Water" and "3 kg milk" separately, never the whole string.
 */
export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const narrations: string[] = await JournalVoucher.distinct("entries.narration", {
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
