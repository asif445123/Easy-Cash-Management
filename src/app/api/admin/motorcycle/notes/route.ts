import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MotorcycleReading from "@/models/MotorcycleReading";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";

/**
 * Every distinct, non-empty note SEGMENT this user has ever typed on an
 * Odometer reading — used to power the Note field's autocomplete. Stored
 * notes are split on commas first (same reasoning as the Cash Book /
 * Journal Voucher narration suggestions), so a combined note contributes
 * its individual words/phrases separately rather than as one long string.
 */
export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();
    const notes: string[] = await MotorcycleReading.distinct("note", { userId: user.userId });
    const segments = new Set<string>();
    for (const n of notes) {
      if (!n) continue;
      for (const part of n.split(",")) {
        const trimmed = part.trim();
        if (trimmed) segments.add(trimmed);
      }
    }
    return NextResponse.json({ notes: Array.from(segments).sort() });
  } catch (err) {
    return handleApiError(err);
  }
}
