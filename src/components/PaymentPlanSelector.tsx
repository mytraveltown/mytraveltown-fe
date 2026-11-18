import { cn, formatINR } from "@/lib/utils";
import { packageText } from "@/lib/text";
import { ADVANCE_PERCENT, type PaymentPlan, type PricingBreakdown } from "@/lib/pricing";

interface PaymentPlanSelectorProps {
  value: PaymentPlan;
  onChange: (plan: PaymentPlan) => void;
  /** Pricing calculated for the advance plan; the full plan charges its `total`. */
  advancePricing: PricingBreakdown;
}

/** Lets the customer choose between paying the advance now or the full amount now. */
export function PaymentPlanSelector({ value, onChange, advancePricing }: PaymentPlanSelectorProps) {
  const t = packageText.booking;
  const options: { plan: PaymentPlan; title: string; note: string; amount: number }[] = [
    {
      plan: "advance",
      title: t.planAdvanceTitle(ADVANCE_PERCENT),
      note: t.planAdvanceNote,
      amount: advancePricing.advance,
    },
    { plan: "full", title: t.planFullTitle, note: t.planFullNote, amount: advancePricing.total },
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-caption fw-bold tracking-wider text-muted-foreground">
        {t.paymentPlanLabel}
      </legend>
      {options.map((option) => {
        const selected = value === option.plan;
        return (
          <label
            key={option.plan}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
              selected ? "border-primary bg-primary/5" : "hover:bg-secondary/60"
            )}
          >
            <input
              type="radio"
              name="payment-plan"
              value={option.plan}
              checked={selected}
              onChange={() => onChange(option.plan)}
              className="mt-1 size-4 accent-primary"
            />
            <span className="flex-1">
              <span className="flex justify-between gap-2 text-body-sm fw-semibold">
                <span>{option.title}</span>
                <span className="text-primary">{formatINR(option.amount)}</span>
              </span>
              <span className="block text-caption text-muted-foreground">{option.note}</span>
            </span>
          </label>
        );
      })}

      {value === "advance" && (
        <div className="flex justify-between px-1 text-caption text-muted-foreground">
          <span>{t.payLater}</span>
          <span>{formatINR(advancePricing.balance)}</span>
        </div>
      )}
    </fieldset>
  );
}
