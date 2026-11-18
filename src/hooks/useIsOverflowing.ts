import { useEffect, useState, type RefObject } from "react";

/**
 * Tracks whether a scroll container's content is taller than the container itself.
 * Watches both the container and its content wrapper, so it updates when the box is resized
 * (e.g. the filter sidebar grows) and when content changes (e.g. another page of cards loads).
 */
export function useIsOverflowing(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>
) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measure = () => setIsOverflowing(container.scrollHeight > container.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    measure();

    return () => observer.disconnect();
  }, [containerRef, contentRef]);

  return isOverflowing;
}
