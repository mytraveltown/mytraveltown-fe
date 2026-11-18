import { useCallback, useEffect, useState } from "react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import {
  DEFAULT_BLOCKED_DAYS_FROM_TODAY,
  parseIsoDate,
  startOfDayFromToday,
  type BlockedDatesResponse,
} from "@/lib/availability";

/**
 * Loads the first bookable travel date so calendars can disable everything before it.
 * Today and the next few days are blocked for every package, whatever the bookings or payments.
 */
export function usePackageAvailability(packageId: string | number | undefined) {
  const [earliestDate, setEarliestDate] = useState<Date>(() =>
    startOfDayFromToday(DEFAULT_BLOCKED_DAYS_FROM_TODAY)
  );

  const refresh = useCallback(async () => {
    if (!packageId) return;
    try {
      const res = await GET<BlockedDatesResponse>(API.BOOKING.BLOCKED_DATES(packageId));
      const serverDate = parseIsoDate(res.data.earliestDate);
      if (serverDate) setEarliestDate(serverDate);
    } catch (error) {
      // Keep the local default; the server re-validates the date on booking.
      console.error("Failed to load blocked dates", error);
    }
  }, [packageId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isDateUnavailable = useCallback((date: Date) => date < earliestDate, [earliestDate]);

  return { isDateUnavailable, earliestDate, refresh };
}
