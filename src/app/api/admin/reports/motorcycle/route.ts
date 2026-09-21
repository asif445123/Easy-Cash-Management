import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";
import MotorcycleReading from "@/models/MotorcycleReading";
import FuelPurchase from "@/models/FuelPurchase";
import MobileReading from "@/models/MobileReading";
import TuningReading from "@/models/TuningReading";
import BudgetLimit from "@/models/BudgetLimit";

const DAY_MS = 86400000;

/**
 * Motorcycle Report — READ ONLY. All data (odometer readings, fuel
 * purchases, mobile/tuning readings, limits) is entered on the
 * Motorcycle entry page (Add Entry -> Motorcycle); this route only
 * reads and computes from it.
 *
 * For each fuel purchase, its "period" runs from its own date up to (but
 * not including) the NEXT purchase's date — e.g. fuel bought 01-07 then
 * again 15-07 means the first purchase covers 01-07 through 14-07 (14
 * days). The most recent purchase's period runs up to the report's `to`
 * date. Per-purchase figures:
 *   - days in period
 *   - km in period (nearest odometer reading at period end minus nearest
 *     reading at period start)
 *   - perDayCost = amount / days
 *   - perKmCost = amount / km
 *   - average = km / quantity (km per liter, this purchase only)
 *   - costPerKm = rate / average (Rs per km, derived from rate and this
 *     purchase's efficiency)
 *
 * Report-wide totals (over the whole selected range) use the same ideas
 * summed across every purchase in range.
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
    const userId = user.userId;

    // ALL of this user's readings/purchases, not just the range — needed so
    // a purchase near the edge of the range can still find its "next
    // purchase" and nearby odometer readings correctly.
    const [allReadings, allPurchases, allMobile, allTuning, limits] = await Promise.all([
      MotorcycleReading.find({ userId }).sort({ date: 1 }),
      FuelPurchase.find({ userId }).sort({ date: 1 }),
      MobileReading.find({ userId }).sort({ date: 1 }),
      TuningReading.find({ userId }).sort({ date: 1 }),
      BudgetLimit.findOne({ userId }),
    ]);

    // Odometer reading nearest to (at or before) a given date. Falls back
    // to the earliest known reading if the date is before all readings.
    function readingAtOrBefore(date: Date): number | null {
      let result: number | null = null;
      for (const r of allReadings) {
        if (r.date.getTime() <= date.getTime()) result = r.reading;
        else break;
      }
      return result ?? (allReadings.length > 0 ? allReadings[0].reading : null);
    }

    const purchasesInRange = allPurchases.filter(
      (p) => p.date.getTime() >= fromDate.getTime() && p.date.getTime() <= toDate.getTime()
    );

    const fuelPurchases = purchasesInRange.map((p, i) => {
      const indexInAll = allPurchases.findIndex((x) => x._id.equals(p._id));
      const next = allPurchases[indexInAll + 1];
      const periodEnd = next ? next.date : toDate;
      const days = Math.max(1, Math.round((periodEnd.getTime() - p.date.getTime()) / DAY_MS));

      const startReading = readingAtOrBefore(p.date);
      const endReading = readingAtOrBefore(periodEnd);
      const km = startReading !== null && endReading !== null ? Math.max(0, endReading - startReading) : 0;

      const average = p.quantity > 0 ? km / p.quantity : 0;
      const perDayCost = p.amount / days;
      const perKmCost = km > 0 ? p.amount / km : 0;
      const costPerKm = average > 0 ? p.rate / average : 0;

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
        detail: { days, km, perDayCost, perKmCost, average, costPerKm },
      };
    });

    // Report-wide totals across the range.
    const totalAmount = purchasesInRange.reduce((s, p) => s + p.amount, 0);
    const totalLiters = purchasesInRange.reduce((s, p) => s + p.quantity, 0);
    const readingsInRange = allReadings.filter(
      (r) => r.date.getTime() >= fromDate.getTime() && r.date.getTime() <= toDate.getTime()
    );
    const totalKm =
      readingsInRange.length >= 2
        ? readingsInRange[readingsInRange.length - 1].reading - readingsInRange[0].reading
        : 0;
    const totalDays = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / DAY_MS) + 1);
    const totalAverage = totalLiters > 0 ? totalKm / totalLiters : 0;
    const overallPerDayCost = totalAmount / totalDays;
    const overallPerKmCost = totalKm > 0 ? totalAmount / totalKm : 0;

    // Mobile / Tuning: "Last reading" is the odometer value recorded when
    // you actually changed the mobile / did the tuning (the most recent
    // entry on that tab). "Current reading" is NOT that tab's own entries
    // — it's the motorcycle's actual current odometer value, from the
    // Odometer log, since that's what's really moving day to day.
    //   - limit = lastReading + the flat manually-set limit (Set limits tab)
    //   - running = currentReading - lastReading (km since the change)
    //   - remaining = flat limit - running
    //   - percentUsed = running / flat limit
    //   - percentDue = 100 - percentUsed
    const currentReading = allReadings.length > 0 ? allReadings[allReadings.length - 1].reading : 0;

    function summarizeCategory(readings: { date: Date; reading: number }[], flatLimit: number) {
      const n = readings.length;
      const lastEntry = n > 0 ? readings[n - 1] : null;
      const lastReading = lastEntry?.reading ?? 0;
      const daysSinceLast = lastEntry
        ? Math.round((Date.now() - lastEntry.date.getTime()) / DAY_MS)
        : null;

      const limit = lastReading + flatLimit;
      const running = currentReading - lastReading;
      const remaining = flatLimit - running;

      return {
        lastReading,
        currentReading,
        lastDate: lastEntry?.date ?? null,
        daysSinceLast,
        limit,
        running,
        remaining,
        percentUsed: flatLimit > 0 ? (running / flatLimit) * 100 : 0,
        percentDue: flatLimit > 0 ? (remaining / flatLimit) * 100 : 0,
      };
    }

    return NextResponse.json({
      totalKm,
      totalLiters,
      totalAmount,
      totalDays,
      totalAverage,
      overallPerDayCost,
      overallPerKmCost,
      fuelPurchases,
      mobile: summarizeCategory(allMobile, limits?.mobileLimit || 0),
      tuning: summarizeCategory(allTuning, limits?.tuningLimit || 0),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
