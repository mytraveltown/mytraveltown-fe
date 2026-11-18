import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

const AUTOPLAY_INTERVAL_MS = 3000;
/** Spreads card start times so a grid of carousels does not flip in unison. */
const MAX_START_JITTER_MS = 1500;

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** Height/shape of the carousel, e.g. "h-44". */
  className?: string;
}

/**
 * Small auto-playing, infinitely looping image carousel for cards.
 * - A single image renders as a plain image (no carousel).
 * - Autoplay only runs while the carousel is on screen, and pauses on hover.
 * - A click that ends a drag is swallowed so swiping never triggers the parent link.
 */
export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draggedRef = useRef(false);
  const isCarousel = images.length > 1;

  useEffect(() => {
    if (!embla) return;
    const sync = () => setSelected(embla.selectedScrollSnap());
    const onPointerDown = () => {
      draggedRef.current = false;
    };
    const onScroll = () => {
      draggedRef.current = true;
    };
    sync();
    embla.on("select", sync).on("pointerDown", onPointerDown).on("scroll", onScroll);
    return () => {
      embla.off("select", sync).off("pointerDown", onPointerDown).off("scroll", onScroll);
    };
  }, [embla]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !isCarousel) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [isCarousel]);

  useEffect(() => {
    if (!embla || !visible || hovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      embla.scrollNext();
      interval = setInterval(() => embla.scrollNext(), AUTOPLAY_INTERVAL_MS);
    }, AUTOPLAY_INTERVAL_MS + Math.random() * MAX_START_JITTER_MS);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [embla, visible, hovered]);

  const swallowClickAfterDrag = useCallback((e: React.MouseEvent) => {
    if (draggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      draggedRef.current = false;
    }
  }, []);

  if (!isCarousel) {
    return (
      <img
        src={images[0]}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn("w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClickCapture={swallowClickAfterDrag}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="h-full min-w-0 flex-[0_0_100%]">
              <img
                src={src}
                alt={index === 0 ? alt : ""}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
        {images.map((src, index) => (
          <span
            key={`${src}-dot-${index}`}
            className={cn(
              "h-1.5 rounded-full bg-white shadow transition-all",
              index === selected ? "w-4 opacity-100" : "w-1.5 opacity-60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
