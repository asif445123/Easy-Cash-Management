import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireApprovedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/db-errors";
import ElectricityReading from "@/models/ElectricityReading";
import ElectricityBill from "@/models/ElectricityBill";

/**
 * Electricity Bill Report — READ ONLY. Units for each meter reading are
 * this reading minus the PREVIOUS reading (same as the Motorcycle
 * Odometer), computed across the full chronological reading history —
 * not just start/end typed on one row. For each bill (its period is
 * derived from meter reading dates — starting the day after the previous
 * meter reading and ending on/before the next one), this sums the daily
 * units that fall within that period into two separate totals — units
 * used WITH the motor running and units used WITHOUT — plus the bill's
 * own manually-entered charges and their total.
 */
export async function GET() {
  const user = await requireApprovedUser();
  if (!user) {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    await connectDB();

    const [bills, readings] = await Promise.all([
      ElectricityBill.find({ userId: user.userId }).sort({ periodStart: -1 }),
      ElectricityReading.find({ userId: user.userId }).sort({ date: 1 }),
    ]);

    // Units for each reading = this reading minus the previous one
    // (chronologically) — the very first reading ever has no previous
    // reading to compare against, so it contributes 0 units.
    const readingsWithSpend = readings.map((r, i) => ({
      date: r.date,
      withMotor: r.withMotor,
      spend: i === 0 ? 0 : r.reading - readings[i - 1].reading,
    }));

    const rows = bills.map((bill) => {
      const readingsInPeriod = readingsWithSpend.filter(
        (r) => r.date.getTime() >= bill.periodStart.getTime() && r.date.getTime() <= bill.periodEnd.getTime()
      );

      let withMotorUnits = 0;
      let withoutMotorUnits = 0;
      for (const r of readingsInPeriod) {
        if (r.withMotor) withMotorUnits += r.spend;
        else withoutMotorUnits += r.spend;
      }
      const totalUnits = withMotorUnits + withoutMotorUnits;

      const totalCharges = bill.charges.reduce((s: number, c: { label: string; amount: number }) => s + c.amount, 0);

      return {
        id: bill._id.toString(),
        periodStart: bill.periodStart,
        periodEnd: bill.periodEnd,
        withMotorUnits,
        withoutMotorUnits,
        totalUnits,
        daysInPeriod: readingsInPeriod.length,
        charges: bill.charges,
        totalCharges,
      };
    });

    return NextResponse.json({ bills: rows });
  } catch (err) {
    return handleApiError(err);
  }
}
