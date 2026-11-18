import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text?: string | null;
  /** Tailwind max-width class that sets where the text is cut off, e.g. "max-w-[200px]". */
  maxWidthClass: string;
  className?: string;
  fallback?: string;
}

/** Single-line text that ends in "…" when too long and shows the full value in a tooltip on hover. */
export function TruncatedText({ text, maxWidthClass, className, fallback = "—" }: TruncatedTextProps) {
  if (!text) {
    return <span className={className}>{fallback}</span>;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className={cn("block truncate cursor-default outline-none", maxWidthClass, className)}>
            {text}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs whitespace-normal break-words">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
