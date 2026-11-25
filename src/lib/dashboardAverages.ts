const DAY_MS = 86400000;

/**
 * Converts a YYYY-MM-DD string (or Date/ISO string) into UTC midnight
 * milliseconds for its calendar day, avoiding DST and timezone shifts.
 */
function toUtcDayMs(input: string | Date | null | undefined, fallback?: Date): number {
  if (typeof input === "string" && input.trim()) {
    const trimmed = input.trim();
    const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (ymd) {
      return Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
  } else if (input instanceof Date && !Number.isNaN(input.getTime())) {
    return Date.UTC(input.getFullYear(), input.getMonth(), input.getDate());
  }

  if (fallback && !Number.isNaN(fallback.getTime())) {
    return Date.UTC(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }

  return NaN;
}

/**
 * Inclusive number of calendar days between `from` and `to` (minimum 1).
 * For example, 2026-11-01 to 2026-11-25 returns 25; same-day returns 1.
 */
export function countSelectedDays(
  from: string | Date | null | undefined,
  to: string | Date | null | undefined,
  fallbackFrom?: Date,
  fallbackTo?: Date
): number {
  const startMs = toUtcDayMs(from, fallbackFrom);
  const endMs = toUtcDayMs(to, fallbackTo);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return 1;
  const diffDays = Math.round((endMs - startMs) / DAY_MS);
  return Math.max(1, diffDays + 1);
}

/**
 * Calculates daily averages over the selected date range:
 *   averageIncomePerDay = totalIncome / selectedDays
 *   averageExpensePerDay = totalExpense / selectedDays
 */
export function calculateDailyAverages(income: number, expense: number, selectedDays: number) {
  const days = Number.isFinite(selectedDays) && selectedDays >= 1 ? Math.round(selectedDays) : 1;
  return {
    selectedDays: days,
    averageIncomePerDay: income / days,
    averageExpensePerDay: expense / days,
  };
}
