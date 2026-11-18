import { useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { encryptId } from "@/lib/crypto";
import { bookingBalanceText as t } from "@/lib/text";
import { payBalanceOnline } from "@/lib/balancePayment";
import type { BookingInterface } from "@/lib/interface";

/**
 * A balance is payable online only after the advance is paid, while the booking is active
 * and the balance has not been settled (online or marked received by the travel partner).
 * Bookings paid in full have no balance, so they never qualify.
 */
export function hasPendingBalance(booking: BookingInterface): boolean {
  return (
    booking.status !== "cancelled" &&
    booking.payment_status === "paid" &&
    booking.balance_status === "pending" &&
    Number(booking.balance_amount) > 0
  );
}

interface BookingBalancePanelProps {
  booking: BookingInterface;
  /** Called after the balance payment is verified so the parent can update its state. */
  onPaid: (bookingId: number) => void;
}

/** Shows paid vs remaining amounts and lets the customer pay the balance via the platform. */
export function BookingBalancePanel({ booking, onPaid }: BookingBalancePanelProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const paid = Number(booking.advance_amount) || 0;
  const remaining = Number(booking.balance_amount) || 0;
  const total = paid + remaining;
  const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;

  const handlePay = async () => {
    setError("");
    setIsStarting(true);
    await payBalanceOnline(encryptId(booking.id), {
      onPaid: () => onPaid(booking.id),
      onError: setError,
    });
    setIsStarting(false);
  };

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
      <div className="flex items-center justify-between text-body-sm">
        <span className="text-slate-500">{t.paidLabel}</span>
        <span className="fw-semibold text-slate-900">{formatINR(paid)}</span>
      </div>
      <div className="flex items-center justify-between text-body-sm">
        <span className="text-slate-500">{t.remainingLabel}</span>
        <span className="fw-semibold text-slate-900">{formatINR(remaining)}</span>
      </div>

      <div>
        <div
          className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={paidPercent}
          aria-label={t.progressLabel(paidPercent)}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
        <p className="mt-1 text-caption text-slate-400">{t.progressLabel(paidPercent)}</p>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={isStarting}
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-body-sm fw-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isStarting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isStarting ? t.paying : t.payButton(formatINR(remaining))}
      </button>

      <p className="text-caption text-slate-400 text-center">{t.note}</p>
      {error && <p className="text-caption text-red-600">{error}</p>}
    </div>
  );
}
