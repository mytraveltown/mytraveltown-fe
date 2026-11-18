import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { packageText } from "@/lib/text";

const DEFAULT_COLLAPSED_LINES = 3;

/** Rendered text lines inside `container`, as top/bottom offsets from its top edge. */
function measureTextLines(container: HTMLElement): { top: number; bottom: number }[] {
  const containerTop = container.getBoundingClientRect().top;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const lines: { top: number; bottom: number }[] = [];

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width === 0 || rect.height === 0) continue;
      const top = rect.top - containerTop;
      const bottom = rect.bottom - containerTop;
      // Rects on the same visual line (e.g. a bullet and its text) count once.
      const sameLine = lines.find((line) => top < line.bottom && bottom > line.top);
      if (sameLine) {
        sameLine.top = Math.min(sameLine.top, top);
        sameLine.bottom = Math.max(sameLine.bottom, bottom);
      } else {
        lines.push({ top, bottom });
      }
    }
  }
  return lines.sort((a, b) => a.top - b.top);
}

/**
 * Height that shows exactly `lines` text lines, cut in the gap before the next line.
 * Measured from the rendered text so it is correct whatever font size or line-height
 * the content (or global styles) use. Returns null when the content already fits.
 */
function collapsedHeightFor(container: HTMLElement, lines: number): number | null {
  const textLines = measureTextLines(container);
  if (textLines.length <= lines) return null;
  const lastVisible = textLines[lines - 1];
  const firstHidden = textLines[lines];
  return Math.ceil((lastVisible.bottom + firstHidden.top) / 2);
}

interface ReadMoreProps {
  children: ReactNode;
  /** Number of text lines shown before "Read more". */
  lines?: number;
  /** Classes for the clamped content box (typography, spacing between blocks). */
  className?: string;
}

/**
 * Shows the first few lines of its content with a "Read more" / "Read less" toggle.
 * Works with multi-block content (paragraphs, lists) and hides the toggle when the
 * content already fits.
 */
export function ReadMore({ children, lines = DEFAULT_COLLAPSED_LINES, className }: ReadMoreProps) {
  const contentId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const measure = () => {
      const maxHeight = collapsedHeightFor(element, lines);
      setCollapsedHeight(maxHeight);
      setIsOverflowing(maxHeight != null);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [lines, children]);

  const isClamped = isOverflowing && !isExpanded;

  return (
    <div>
      <div
        ref={contentRef}
        id={contentId}
        className={cn("overflow-hidden", className)}
        style={isClamped && collapsedHeight ? { maxHeight: collapsedHeight } : undefined}
      >
        {children}
      </div>

      {isOverflowing && (
        <button
          type="button"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          className="mt-2 text-body-sm fw-semibold text-primary hover:underline"
        >
          {isExpanded ? packageText.details.readLess : packageText.details.readMore}
        </button>
      )}
    </div>
  );
}
