import type { BookingInterface } from "@/lib/interface";

export const CONVENIENCE_FEE_PER_GUEST = 500;
export const GST_RATE = 0.05;
export const ADVANCE_PERCENT = 10;
/** Coupon applied by the "apply coupon" checkbox; validated again by the server. */
export const FEE_WAIVER_COUPON = "MYTRAVELTOWN";

/**
 * "advance": pay ADVANCE_PERCENT now, balance later (online or to the travel partner).
 * "full": pay the whole amount now. Must match the backend's PAYMENT_PLANS.
 */
export type PaymentPlan = "advance" | "full";

export interface PricingBreakdown {
  basePrice: number;
  convenienceFee: number;
  /** Fee that would be charged without the coupon (shown struck-through when waived). */
  originalConvenienceFee: number;
  gst: number;
  total: number;
  advance: number;
  balance: number;
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

type BookingPayment = Pick<
  BookingInterface,
  "amount" | "advance_amount" | "balance_amount" | "balance_status" | "balance_payment_mode" | "payment_status"
>;

/**
 * Money actually received for a booking: the advance once paid, plus the balance once settled.
 * With `platformOnly`, a balance paid directly to the travel partner is excluded.
 */
export function getAmountReceived(
  booking: BookingPayment,
  { platformOnly = false }: { platformOnly?: boolean } = {}
): number {
  if (booking.payment_status !== "paid") return 0;

  const total = Number(booking.amount) || 0;
  // Legacy bookings without an advance split were paid in full.
  const advance = Number(booking.advance_amount) > 0 ? Number(booking.advance_amount) : total;
  const balanceSettled =
    booking.balance_status === "paid" &&
    (!platformOnly || booking.balance_payment_mode === "platform");

  return round2(advance + (balanceSettled ? Number(booking.balance_amount) || 0 : 0));
}

export function calculatePricing(
  unitPrice: number,
  guests: number,
  couponApplied: boolean,
  paymentPlan: PaymentPlan = "advance"
): PricingBreakdown {
  const basePrice = round2(unitPrice * guests);
  const originalConvenienceFee = round2(CONVENIENCE_FEE_PER_GUEST * guests);
  const convenienceFee = couponApplied ? 0 : originalConvenienceFee;
  const gst = round2((basePrice + convenienceFee) * GST_RATE);
  const total = round2(basePrice + convenienceFee + gst);
  const advance =
    paymentPlan === "full" ? total : round2((total * ADVANCE_PERCENT) / 100);

  return {
    basePrice,
    convenienceFee,
    originalConvenienceFee,
    gst,
    total,
    advance,
    balance: round2(total - advance),
  };
}

/** International packages cannot be listed below this price (INR); mirrors the backend rule. No maximum. */
export const INTERNATIONAL_MIN_PRICE = 20000;
