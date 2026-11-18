import { useCallback, useEffect, useRef, useState } from "react";
import { ChefHat, Hotel } from "lucide-react";
import { DayDescription } from "@/components/DayDescription";
import { ReadMore } from "@/components/ReadMore";
import { toPlainText } from "@/lib/description";
import { cn } from "@/lib/utils";
import { packageText } from "@/lib/text";
import type { PackageDayInterface } from "@/lib/interface";

/** Where on screen the progress marker "is", as a fraction of the viewport height. */
const VIEWPORT_FOCUS = 0.5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Day-by-day itinerary on a vertical timeline. As the reader scrolls, a progress bar fills
 * down the line and each day's dot lights up once it is reached.
 */
export function ItineraryTimeline({ days }: { days: PackageDayInterface[] }) {
  const listRef = useRef<HTMLOListElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [dotOffsets, setDotOffsets] = useState<number[]>([]);
  const [progressY, setProgressY] = useState(0);

  // Centre of every day's dot, measured from the top of the list.
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const listTop = list.getBoundingClientRect().top;
    setDotOffsets(
      dotRefs.current
        .slice(0, days.length)
        .map((dot) => (dot ? dot.getBoundingClientRect().top - listTop + dot.offsetHeight / 2 : 0)),
    );
  }, [days.length]);

  const updateProgress = useCallback(() => {
    const list = listRef.current;
    if (!list || !dotOffsets.length) return;
    const focus = window.innerHeight * VIEWPORT_FOCUS - list.getBoundingClientRect().top;
    setProgressY(clamp(focus, dotOffsets[0], dotOffsets[dotOffsets.length - 1]));
  }, [dotOffsets]);

  // Re-measure when the layout changes (window resize, text wrapping).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);

  // Advance the progress bar with scrolling, at most once per animation frame.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateProgress]);

  const measured = dotOffsets.length === days.length && days.length > 0;
  const firstDot = dotOffsets[0] ?? 0;
  const lastDot = dotOffsets[dotOffsets.length - 1] ?? 0;

  return (
    <ol ref={listRef} className="relative mt-6">
      {measured && (
        <>
          <span
            aria-hidden
            className="absolute left-[7px] w-px bg-border"
            style={{ top: firstDot, height: lastDot - firstDot }}
          />
          <span
            aria-hidden
            className="absolute left-[7px] w-0.5 -translate-x-px bg-primary"
            style={{ top: firstDot, height: Math.max(0, progressY - firstDot) }}
          />
        </>
      )}

      {days.map((day, index) => {
        const reached = measured && progressY >= dotOffsets[index] - 1;
        return (
          <li key={day.day_number} className="relative pl-12 pb-8 last:pb-0">
            <span
              ref={(el) => {
                dotRefs.current[index] = el;
              }}
              className={cn(
                "absolute left-0 top-1 size-4 rounded-full border-2 border-primary transition-colors duration-300",
                reached ? "bg-primary" : "bg-background",
              )}
            />
            <div className="text-caption fw-bold tracking-wider text-primary">
              {packageText.details.dayLabel(day.day_number)}
            </div>
            <ReadMore>
              <DayDescription text={day.description} />
              {day.activities?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {day.activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2 text-body-sm text-foreground">
                      <span className="mt-1 text-primary">•</span>
                      {toPlainText(activity)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-caption text-muted-foreground">
                {day.hotel_stars > 1 && (
                  <span className="flex items-center gap-1">
                    <Hotel className="size-3" /> {packageText.details.hotelStars(day.hotel_stars)}
                  </span>
                )}
                {day.hotel_stars < 3 && (
                  <span className="flex items-center gap-1">
                    <Hotel className="size-3" /> {packageText.details.standardHotel}
                  </span>
                )}
                {day.meals && (
                  <span className="flex items-center gap-1">
                    <ChefHat className="size-3" /> {day.meals}
                  </span>
                )}
              </div>
            </ReadMore>
          </li>
        );
      })}
    </ol>
  );
}
