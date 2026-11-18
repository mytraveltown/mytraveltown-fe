import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { packageText } from "@/lib/text";

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number;
  /** When provided the stars become an interactive rating input. */
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS = { sm: "size-3.5", md: "size-4", lg: "size-7" } as const;

/** Read-only star display, or a 1 to 5 rating picker when `onChange` is passed. */
export function StarRating({ value, onChange, size = "md", className }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  if (!onChange) {
    return (
      <div
        className={cn("flex items-center gap-0.5", className)}
        role="img"
        aria-label={packageText.reviews.ratingAria(value)}
      >
        {STARS.map((star) => (
          <Star
            key={star}
            className={cn(
              SIZE_CLASS[size],
              star <= Math.round(display) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="radiogroup"
      onMouseLeave={() => setHovered(0)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={packageText.reviews.selectRatingAria(star)}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          className="rounded transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Star
            className={cn(
              SIZE_CLASS[size],
              star <= display ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
    </div>
  );
}
