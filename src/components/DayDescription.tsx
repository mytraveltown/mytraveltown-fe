import { useMemo } from "react";
import { parseDayDescription } from "@/lib/description";

/** Renders an itinerary day's description as an optional heading plus a bullet list. */
export function DayDescription({ text }: { text: string | null | undefined }) {
  const { title, items } = useMemo(() => parseDayDescription(text), [text]);
  if (!title && !items.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {title && <p className="text-body-sm fw-semibold text-foreground">{title}</p>}
      {items.length === 1 && !title ? (
        <p className="text-body-sm text-muted-foreground">{items[0]}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-body-sm text-muted-foreground">
              <span className="mt-1 text-primary">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
