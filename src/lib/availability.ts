export interface BlockedDatesResponse {
  success: boolean;
  data: {
    /** Days blocked from today, including today (3 = today + next 2 days). */
    blockedDaysFromToday: number;
    /** First bookable travel date, YYYY-MM-DD, decided by the server. */
    earliestDate: string;
  };
}

/** Used until the server responds, and if it cannot be reached. Server re-validates on booking. */
export const DEFAULT_BLOCKED_DAYS_FROM_TODAY = 3;

/** Local midnight `days` days from today. */
export function startOfDayFromToday(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

/** Parses YYYY-MM-DD as a local-midnight Date (avoids UTC shifting the day). */
export function parseIsoDate(iso: string): Date | null {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}
