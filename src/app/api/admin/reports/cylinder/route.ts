import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";
import CylinderPurchase from "@/models/CylinderPurchase";

const DAY_MS = 86400000;

/**
 * Cylinder Report — READ ONLY. Purchases are entered on the Cylinder page
 * (Enter Data -> Cylinder); this route only reads and computes from them.
 *
 * Each purchase's "period" runs from its own date up to (but not including)
 * the NEXT purchase's date. The most recent purchase's period runs up to the
 * report's `to` date. Per-purchase figures:
 *   - days in period
 *   - kg bought (quantity = amount / rate)
 *   - perDayCost = amount / days
 *   - kgPerDay = kg / days (only when the period has a known end, i.e. a
 *     following purchase exists; otherwise null)
 *
 * Report-wide figures over the selected range:
 *   - totalKg / totalAmount
 *   - overallPerDayCost = totalAmount / inclusive days in range
 *   - overallPerKgCost = totalAmount / totalKg
 *   - averageKgPerDay = kg of completed periods / days of completed periods
 */
export async function GET(req: NextRequest) {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  const params = req.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  if (!from || !to) {
    return NextResponse.json({ message: "from and to dates are required." }, { status: 400 });
  }
  const fromDate = new Date(from);
  const toDate = new Date(to);

  try {
    await connectDB();

    // ALL purchases, not just the range — a purchase near the edge of the
    // range still needs its "next purchase" to know where its period ends.
    const allPurchases = await CylinderPurchase.find({ userId: user.userId }).sort({ date: 1 });

    const purchasesInRange = allPurchases.filter(
      (p) => p.date.getTime() >= fromDate.getTime() && p.date.getTime() <= toDate.getTime()
    );

    const purchases = purchasesInRange.map((p, i) => {
      const indexInAll = allPurchases.findIndex((x) => x._id.equals(p._id));
      const next = allPurchases[indexInAll + 1] ?? null;
      const periodEnd = next ? next.date : toDate;
      const days = Math.max(1, Math.round((periodEnd.getTime() - p.date.getTime()) / DAY_MS));
      const kgPerDay = next ? p.quantity / days : null;

      const prev = i === 0 ? null : purchasesInRange[i - 1];

      return {
        id: p._id.toString(),
        sr: i + 1,
        date: p.date,
        amount: p.amount,
        rate: p.rate,
        quantity: p.quantity,
        daysSincePrevious: prev
          ? Math.round((p.date.getTime() - prev.date.getTime()) / DAY_MS)
          : null,
        detail: {
          days,
          perDayCost: p.amount / days,
          kgPerDay,
          nextDate: next ? next.date : null,
        },
      };
    });

    const totalAmount = purchasesInRange.reduce((s, p) => s + p.amount, 0);
    const totalKg = purchasesInRange.reduce((s, p) => s + p.quantity, 0);
    const totalDays = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS) + 1);
    const overallPerDayCost = totalAmount / totalDays;
    const overallPerKgCost = totalKg > 0 ? totalAmount / totalKg : 0;

    const completed = purchases.filter((p) => p.detail.kgPerDay !== null);
    const completedKg = completed.reduce((s, p) => s + p.quantity, 0);
    const completedDays = completed.reduce((s, p) => s + p.detail.days, 0);
    const averageKgPerDay = completed.length > 0 && completedDays > 0 ? completedKg / completedDays : null;

    return NextResponse.json({
      totalKg,
      totalAmount,
      totalDays,
      overallPerDayCost,
      overallPerKgCost,
      averageKgPerDay,
      purchases,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
