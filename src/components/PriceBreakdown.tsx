import { formatINR } from "@/lib/utils";
import { packageText } from "@/lib/text";
import type { PricingBreakdown } from "@/lib/pricing";

interface PriceBreakdownProps {
  pricing: PricingBreakdown;
  couponApplied?: boolean;
  /** When provided, the coupon toggle is shown. */
  onCouponChange?: (applied: boolean) => void;
}

/** Price summary with optional coupon toggle. */
export function PriceBreakdown({
  pricing,
  couponApplied = false,
  onCouponChange,
}: PriceBreakdownProps) {
  const t = packageText.booking;

  return (
    <div className="pt-2 border-t space-y-2 text-body-sm">
      <div className="flex justify-between">
        <span>{t.packagePrice}</span>
        <span>{formatINR(pricing.basePrice)}</span>
      </div>

      <div className="flex justify-between items-center">
        <span>{t.convenienceFee}</span>
        {couponApplied ? (
          <span className="flex items-center gap-2">
            <span className="text-gray-400 line-through">
              {formatINR(pricing.originalConvenienceFee)}
            </span>
            <span className="fw-semibold text-green-600">{t.free}</span>
          </span>
        ) : (
          <span>{formatINR(pricing.convenienceFee)}</span>
        )}
      </div>

      <div className="flex justify-between">
        <span>{t.gst}</span>
        <span>{formatINR(pricing.gst)}</span>
      </div>

      <div className="flex justify-between text-body fw-bold border-t pt-2">
        <span>{t.totalPayable}</span>
        <span className="text-primary">{formatINR(pricing.total)}</span>
      </div>

      {onCouponChange && (
        <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-dashed px-3 py-2">
          <input
            type="checkbox"
            checked={couponApplied}
            onChange={(e) => onCouponChange(e.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="flex-1">{t.couponLabel}</span>
          {couponApplied && (
            <span className="text-caption fw-semibold text-green-600">{t.couponApplied}</span>
          )}
        </label>
      )}

    </div>
  );
}
