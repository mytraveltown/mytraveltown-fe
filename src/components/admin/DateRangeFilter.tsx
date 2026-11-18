import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

const formatShortDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const formatRangeLabel = (range: DateRange | undefined) => {
  if (!range?.from) return null;
  if (!range.to || range.to.getTime() === range.from.getTime()) return formatShortDate(range.from);
  return `${formatShortDate(range.from)} - ${formatShortDate(range.to)}`;
};

/** Button that opens a two-month calendar for picking a from/to date range, with a clear action. */
export function DateRangeFilter({
  value,
  onChange,
  placeholder = "Select dates",
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const label = formatRangeLabel(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative", className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-2 border border-neutral-200 rounded-lg pl-3 py-2.5 text-body-sm text-left bg-white focus:outline-none focus:border-blue-500",
              label ? "pr-9 text-neutral-900" : "pr-3 text-neutral-500"
            )}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="truncate">{label || placeholder}</span>
          </button>
        </PopoverTrigger>
        {label && (
          <button
            type="button"
            aria-label="Clear dates"
            onClick={() => onChange(undefined)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={value?.from}
          selected={value}
          onSelect={(range) => {
            onChange(range);
            if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
