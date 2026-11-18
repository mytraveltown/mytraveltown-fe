import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { packageText } from "@/lib/text";

export type LightboxImage = { src: string; alt: string };

interface ImageLightboxProps {
  images: LightboxImage[];
  /** Index of the image currently shown. */
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/** Full-screen image viewer with prev/next arrows, a thumbnail rail and keyboard support. */
export function ImageLightbox({ images, index, onIndexChange, onClose }: ImageLightboxProps) {
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);
  const total = images.length;
  const current = images[index];

  const goPrev = useCallback(
    () => onIndexChange((index - 1 + total) % total),
    [index, total, onIndexChange]
  );
  const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext, onClose]);

  // Prevent the page behind the viewer from scrolling.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Keep the selected thumbnail visible in the rail.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  if (!current) return null;

  const iconButton =
    "flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={packageText.gallery.title(total)}
      className="fixed inset-0 z-[100] flex flex-col bg-neutral-950 text-white"
    >
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          className={cn(iconButton, "h-10 w-10")}
          aria-label={packageText.gallery.backAria}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-body-sm fw-medium text-white/80">
          {packageText.gallery.counter(index + 1, total)}
        </span>
        <button
          type="button"
          onClick={onClose}
          className={cn(iconButton, "h-10 w-10")}
          aria-label={packageText.gallery.closeAria}
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-3">
          <img
            key={current.src}
            src={current.src}
            alt={current.alt}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label={packageText.gallery.prevAria}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow hover:bg-white transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={packageText.gallery.nextAria}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow hover:bg-white transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <aside className="shrink-0 border-t border-white/10 md:w-56 md:border-l md:border-t-0 overflow-auto p-2 md:p-3">
            <div className="flex gap-2 md:flex-col">
              {images.map((img, i) => (
                <button
                  key={`${img.src}-${i}`}
                  ref={i === index ? activeThumbRef : null}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={packageText.gallery.thumbAria(i + 1)}
                  aria-current={i === index}
                  className={cn(
                    "shrink-0 overflow-hidden rounded-md border-2 transition",
                    "h-16 w-24 md:h-28 md:w-full",
                    i === index ? "border-red-500" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
