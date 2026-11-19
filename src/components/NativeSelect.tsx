import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Classes for the wrapper, e.g. width in a flex row. */
  wrapperClassName?: string;
}

/**
 * Native <select> with the browser arrow replaced by a chevron inset like the input padding,
 * so it lines up with text inputs instead of hugging the right border.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn("relative", wrapperClassName)}>
      <select ref={ref} className={cn(className, "appearance-none pr-10 cursor-pointer")} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
      />
    </div>
  ),
);
NativeSelect.displayName = "NativeSelect";
