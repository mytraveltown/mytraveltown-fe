import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import { hasShownSessionPopup, markSessionPopupShown } from "@/lib/sessionPopup";

/** Time on site before the popup may appear. */
const DELAY_MS = 10_000;
/** Fraction of the page scrolled that also triggers the popup (whichever comes first). */
const SCROLL_RATIO = 0.4;
/** How long to stay hidden after the visitor closes the popup. */
const DISMISS_DAYS = 7;
/** How long to stay hidden after the visitor clicks through to the partner page. */
const ACCEPT_DAYS = 60;

const HIDE_UNTIL_KEY = "mtt_partner_promo_hide_until";
const SESSION_SEEN_KEY = "mtt_partner_promo_seen";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Pages where an interruption would hurt (forms, checkout, admin) or is redundant. */
const EXCLUDED_PREFIXES = [
  ROUTES.PARTNER,
  ROUTES.REFUND_POLICY,
  "/agent-registration",
  "/login",
  "/signup",
  "/forgot-password",
  "/admin",
  "/booking",
  "/profile",
  "/terms-and-conditions",
  "/privacy-policy",
  "/pricing-policy",
];

const isExcludedPath = (pathname: string) =>
  EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
  /^\/package\/[^/]+\/book$/.test(pathname);

/** Storage can be unavailable (private mode, blocked cookies); treat that as "not seen". */
function readStorage(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch (error) {
    console.warn("Partner promo: storage read failed", error);
    return null;
  }
}

function writeStorage(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch (error) {
    console.warn("Partner promo: storage write failed", error);
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

function isSnoozed(): boolean {
  if (readStorage(session, SESSION_SEEN_KEY) || hasShownSessionPopup()) return true;
  const hideUntil = Number(readStorage(local, HIDE_UNTIL_KEY));
  return Number.isFinite(hideUntil) && hideUntil > Date.now();
}

/**
 * Decides when to show the "Become a Partner" popup so it never feels spammy:
 * only to guests and regular users, never on landing, not on sensitive pages,
 * at most once per session, and snoozed for days after being closed or accepted.
 */
export function usePartnerPromo() {
  const { pathname } = useLocation();
  const { isLoggedIn, user } = useAuth();
  const [open, setOpen] = useState(false);

  const isEligibleAudience = !isLoggedIn || user?.role === "user";
  const canShowHere = isEligibleAudience && !isExcludedPath(pathname);

  useEffect(() => {
    if (!canShowHere || open || isSnoozed()) return;

    let triggered = false;
    const show = () => {
      if (triggered || isSnoozed()) return;
      triggered = true;
      writeStorage(session, SESSION_SEEN_KEY, "1");
      markSessionPopupShown();
      setOpen(true);
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_RATIO) show();
    };

    const timer = window.setTimeout(show, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [canShowHere, open]);

  // Close if the visitor navigates somewhere the popup should not appear (e.g. logs in as an agent).
  useEffect(() => {
    if (!canShowHere) setOpen(false);
  }, [canShowHere]);

  const snoozeFor = useCallback((days: number) => {
    writeStorage(local, HIDE_UNTIL_KEY, String(Date.now() + days * DAY_MS));
    setOpen(false);
  }, []);

  const dismiss = useCallback(() => snoozeFor(DISMISS_DAYS), [snoozeFor]);
  const accept = useCallback(() => snoozeFor(ACCEPT_DAYS), [snoozeFor]);

  return { open, dismiss, accept };
}
