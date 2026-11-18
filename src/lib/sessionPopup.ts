/**
 * Site-wide guard so visitors see at most one marketing/engagement popup per browser session
 * (e.g. the post-trip review prompt and the partner promo never stack).
 */
const SESSION_POPUP_KEY = "mtt_session_popup_shown";

export function hasShownSessionPopup(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_POPUP_KEY) === "1";
  } catch (error) {
    console.warn("Session popup guard: storage read failed", error);
    return false;
  }
}

export function markSessionPopupShown(): void {
  try {
    window.sessionStorage.setItem(SESSION_POPUP_KEY, "1");
  } catch (error) {
    console.warn("Session popup guard: storage write failed", error);
  }
}
