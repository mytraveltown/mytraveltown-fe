import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GET, POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { ApiResponse, ReviewPromptInterface } from "@/lib/interface";
import { hasShownSessionPopup, markSessionPopupShown } from "@/lib/sessionPopup";

/** Let the page settle before asking; never interrupt the first paint. */
const DELAY_MS = 4_000;
/** Per-user flag so the server is asked at most once per browser session. */
const CHECKED_KEY_PREFIX = "mtt_review_prompt_checked_";

/** Pages where a popup would interrupt a task (auth, checkout, admin, onboarding). */
const EXCLUDED_PREFIXES = ["/login", "/signup", "/forgot-password", "/admin", "/booking", "/agent-registration"];

const isExcludedPath = (pathname: string) =>
  EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
  /^\/package\/[^/]+\/book$/.test(pathname);

function wasCheckedThisSession(userId: number): boolean {
  try {
    return window.sessionStorage.getItem(`${CHECKED_KEY_PREFIX}${userId}`) === "1";
  } catch (error) {
    console.warn("Review prompt: storage read failed", error);
    return false;
  }
}

function markCheckedThisSession(userId: number) {
  try {
    window.sessionStorage.setItem(`${CHECKED_KEY_PREFIX}${userId}`, "1");
  } catch (error) {
    console.warn("Review prompt: storage write failed", error);
  }
}

/**
 * Asks travellers to review a trip from its last day onwards, without nagging.
 * Frequency is enforced on the server (max 3 asks, 3 days apart, within 30 days of the trip,
 * stops once reviewed or dismissed). The client adds: travellers only, once per session,
 * a short delay, no task pages, and never alongside another popup.
 */
export function useReviewPrompt() {
  const { pathname } = useLocation();
  const { isLoggedIn, user } = useAuth();
  const [prompt, setPrompt] = useState<ReviewPromptInterface | null>(null);

  const userId = isLoggedIn && user?.role === "user" ? user.id : null;
  const canAskHere = userId !== null && !isExcludedPath(pathname);

  useEffect(() => {
    if (!canAskHere || userId === null || prompt) return;
    if (wasCheckedThisSession(userId) || hasShownSessionPopup()) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      markCheckedThisSession(userId);
      try {
        const res = await GET<ApiResponse<ReviewPromptInterface | null>>(API.REVIEW.PROMPT);
        if (cancelled || !res.data || hasShownSessionPopup()) return;
        markSessionPopupShown();
        setPrompt(res.data);
        // Counting the impression snoozes the prompt server-side, so simply closing it acts as "later".
        await POST(API.REVIEW.PROMPT_SEEN(res.data.booking_id));
      } catch (error) {
        // A missed prompt is harmless; it is retried next session.
        console.warn("Review prompt: request failed", error);
      }
    }, DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canAskHere, userId, prompt]);

  // Hide immediately on logout or when moving onto a task page.
  useEffect(() => {
    if (!canAskHere) setPrompt(null);
  }, [canAskHere]);

  const close = useCallback(() => setPrompt(null), []);

  const dismissForever = useCallback(async () => {
    if (!prompt) return;
    setPrompt(null);
    try {
      await POST(API.REVIEW.PROMPT_DISMISS(prompt.booking_id));
    } catch (error) {
      console.warn("Review prompt: dismiss failed", error);
    }
  }, [prompt]);

  return { prompt, close, dismissForever };
}
