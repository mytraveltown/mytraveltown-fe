import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the semantic typography utilities from global.css as font-size classes so that
// tailwind-merge does not mistake them for text colours (and drop colour/size classes).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "headline",
            "title",
            "price-lg",
            "body-lg",
            "body",
            "body-sm",
            "caption",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  let hour = d.getHours();
  const minute = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const hourStr = hour.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hourStr}:${minute} ${ampm}`;
}

type OrderAmountSource = {
  payment_status: string;
  subtotal?: string | number;
  total_amount?: string | number;
  payment?: { amount?: string | number; status?: string } | null;
};

export function getOrderDisplayAmount(order: OrderAmountSource) {
  const paidAmount = order.payment?.amount;
  if (
    (order.payment_status === "paid" || order.payment?.status === "success") &&
    paidAmount != null &&
    paidAmount !== ""
  ) {
    return Number(paidAmount);
  }
  return Number(order.total_amount ?? order.subtotal ?? 0);
}

export function getPaymentStatusLabel(order: OrderAmountSource) {
  return order.payment?.status ?? order.payment_status;
}

export function getPaidAmount(order: OrderAmountSource) {
  const amount = order.payment?.amount;
  if (amount == null || amount === "") return null;
  return Number(amount);
}

/** Display invoice number for a booking, e.g. INV-00042. */
export function formatInvoiceNo(bookingId: number | string) {
  return `INV-${String(bookingId).padStart(5, "0")}`;
}

export function formatINR(amount: string | number) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

/**
 * Browser URL for a stored media value. The API returns S3 files as full presigned URLs, used
 * as-is; older relative paths ("/uploads/...", "/media/...") are served by the API host.
 */
export function profileUrl(url: string) {
  if (!url || url.trim() === "") {
    return import.meta.env.VITE_MEDIA_URL + "/uploads/profile/default-avatar.png";
  }
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  return import.meta.env.VITE_MEDIA_URL + url;
}

/** File extension of a path or URL, ignoring any query string (presigned S3 URLs carry one). */
export function fileExtension(url: string) {
  const pathname = url.split(/[?#]/)[0];
  const dot = pathname.lastIndexOf(".");
  return dot === -1 ? "" : pathname.slice(dot + 1).toLowerCase();
}

/** MySQL may return has_company as 0/1 — never use `{value && ...}` directly in JSX. */
export function parseHasCompany(
  value: unknown,
  fallbackFromCompanyName?: string | null
): boolean | null {
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  if (fallbackFromCompanyName?.trim()) return true;
  return null;
}

export function agentHasCompany(agent: {
  has_company?: unknown;
  company_name?: string | null;
}) {
  const parsed = parseHasCompany(agent.has_company);
  if (parsed !== null) return parsed;
  return Boolean(agent.company_name?.trim());
}

export function isGuestAccountEmail(email?: string | null) {
  return /^guest_\d{10}@mytraveltown\.local$/i.test(String(email || "").trim());
}

export const capitalize = (text?: string) => text ? text.replace(/\b\w/g, (char) => char.toUpperCase()) : "";
const ADMIN_PANEL_PREFIX = "/admin";

export function isStaffRole(role?: string) {
  return role === "admin" || role === "agent";
}

/** Default landing page for a role: staff go to the panel dashboard, everyone else to home. */
export function getHomePathForRole(role?: string) {
  return isStaffRole(role) ? `${ADMIN_PANEL_PREFIX}/dashboard` : "/";
}

/** Whether a saved "return to" path is safe to send this role back to after login. */
export function canRoleReturnTo(role: string | undefined, pathname: string) {
  return isStaffRole(role) || !pathname.startsWith(ADMIN_PANEL_PREFIX);
}

const RELATIVE_UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** Short relative time such as "5 min ago" or "2 days ago"; null for anything under a minute. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string | null {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto", style: "short" });
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) return formatter.format(Math.round(seconds / unitSeconds), unit);
  }
  return null;
}
