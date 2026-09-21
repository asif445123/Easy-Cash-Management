import { demoIncomeAccountsMonthly, demoExpenseAccountsMonthly, type MonthlyAccountRow } from "./demoMonthWiseReport";

export const YEARS = [2023, 2024, 2025, 2026];

// A plausible "the business has been growing" curve. 2026 is the real
// (well — real-for-the-demo) total, derived straight from the monthly data;
// earlier years are that total scaled down, so the whole history is
// internally consistent instead of blank columns.
const YEAR_RATIO: Record<number, number> = { 2023: 0.58, 2024: 0.74, 2025: 0.87, 2026: 1 };

export interface YearlyAccountRow {
  name: string;
  values: Record<number, number>;
}

function toYearly(rows: MonthlyAccountRow[], years: number[], ratios: Record<number, number>): YearlyAccountRow[] {
  return rows.map((row) => {
    const total2026 = row.values.reduce((sum, v) => sum + v, 0);
    const values: Record<number, number> = {};
    years.forEach((y) => {
      values[y] = Math.round((total2026 * ratios[y]) / 10) * 10;
    });
    return { name: row.name, values };
  });
}

export const demoIncomeAccountsYearly: YearlyAccountRow[] = toYearly(demoIncomeAccountsMonthly, YEARS, YEAR_RATIO);
export const demoExpenseAccountsYearly: YearlyAccountRow[] = toYearly(demoExpenseAccountsMonthly, YEARS, YEAR_RATIO);

// ── Extended 5-year range used by Year Wise Comparison ──────────────────────
// Same 2026 baseline and same ratios for the overlapping years (2023-2026),
// just with one more year (2022) added at the front of the curve.
export const YEARS_EXTENDED = [2022, 2023, 2024, 2025, 2026];
const YEAR_RATIO_EXTENDED: Record<number, number> = { 2022: 0.45, 2023: 0.58, 2024: 0.74, 2025: 0.87, 2026: 1 };

export const demoIncomeAccountsYearlyExtended: YearlyAccountRow[] = toYearly(
  demoIncomeAccountsMonthly,
  YEARS_EXTENDED,
  YEAR_RATIO_EXTENDED
);
export const demoExpenseAccountsYearlyExtended: YearlyAccountRow[] = toYearly(
  demoExpenseAccountsMonthly,
  YEARS_EXTENDED,
  YEAR_RATIO_EXTENDED
);
