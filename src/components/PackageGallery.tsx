import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Images } from "lucide-react";
import { ImageLightbox, type LightboxImage } from "@/components/ImageLightbox";
import { cn } from "@/lib/utils";
import { packageText } from "@/lib/text";

const AUTOPLAY_INTERVAL_MS = 4000;
const HEIGHT_CLASSES = "h-56 sm:h-72 md:h-[420px]";
const TILE_CLASSES = "relative overflow-hidden rounded-2xl min-h-0 h-full w-full bg-muted";
/** Max images shown as separate tiles in the 4+ layout (1 large + 4 small). */
const MAX_TILES = 5;

interface PackageGalleryProps {
  images: LightboxImage[];
  /** Rendered over the top-right corner of the main image (e.g. wishlist/share buttons). */
  overlay?: ReactNode;
  className?: string;
}

/**
 * Photo gallery that adapts its layout to the number of images:
 *  1   -> single full-width image
 *  2   -> auto-playing, infinitely looping carousel
 *  3   -> 1 large image + 2 stacked halves
 *  4   -> 1 large image + 3 stacked thirds (no empty cells, nothing hidden)
 *  5+  -> 1 large image + 2x2 grid, the last tile shows the "+N" remainder
 * Clicking any image opens the full-screen lightbox at that image.
 */
export function PackageGallery({ images, overlay, className }: PackageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const count = images.length;

  if (count === 0) return null;

  const open = (index: number) => setLightboxIndex(index);

  return (
    <section className={className}>
      {count === 1 && (
        <div className={HEIGHT_CLASSES}>
          <ImageTile image={images[0]} onClick={() => open(0)} priority>
            {overlay}
          </ImageTile>
        </div>
      )}

      {count === 2 && (
        <AutoCarousel images={images} onSelect={open}>
          {overlay}
        </AutoCarousel>
      )}

      {count >= 3 && (
        <MosaicGallery images={images} onSelect={open}>
          {overlay}
        </MosaicGallery>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

function ImageTile({
  image,
  onClick,
  priority = false,
  children,
  imageChildren,
}: {
  image: LightboxImage;
  onClick: () => void;
  priority?: boolean;
  /** Overlay content placed outside the click target (so buttons are never nested). */
  children?: ReactNode;
  /** Content placed inside the click target, on top of the image. */
  imageChildren?: ReactNode;
}) {
  return (
    <div className={TILE_CLASSES}>
      <button
        type="button"
        onClick={onClick}
        className="group relative block h-full w-full cursor-zoom-in"
        aria-label={packageText.gallery.viewPhotoAria(image.alt)}
      >
        <img
          src={image.src}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {imageChildren}
      </button>
      {children}
    </div>
  );
}

function MosaicGallery({
  images,
  onSelect,
  children,
}: {
  images: LightboxImage[];
  onSelect: (index: number) => void;
  children?: ReactNode;
}) {
  const count = images.length;
  const sideImages = images.slice(1, MAX_TILES);
  const hiddenCount = Math.max(0, count - MAX_TILES);

  // 3 images: two halves, 4 images: three thirds, 5+: a 2x2 grid.
  const sideGridClass =
    count === 3
      ? "grid-cols-1 grid-rows-2"
      : count === 4
        ? "grid-cols-1 grid-rows-3"
        : "grid-cols-2 grid-rows-2";

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
      <div className={cn("md:col-span-2", HEIGHT_CLASSES)}>
        <ImageTile image={images[0]} onClick={() => onSelect(0)} priority>
          {children}
          {count > 4 ? null : (
            <button
              type="button"
              onClick={() => onSelect(0)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-caption fw-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Images className="h-3.5 w-3.5" />
              {packageText.gallery.viewAll(count)}
            </button>
          )}
        </ImageTile>
      </div>

      <div className={cn("grid gap-2 md:gap-3", sideGridClass, HEIGHT_CLASSES)}>
        {sideImages.map((image, i) => {
          const index = i + 1;
          const isLastTile = index === MAX_TILES - 1;
          const showRemainder = isLastTile && hiddenCount > 0;
          return (
            <ImageTile
              key={`${image.src}-${index}`}
              image={image}
              onClick={() => onSelect(index)}
              imageChildren={
                showRemainder && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-body-sm fw-semibold text-white transition group-hover:bg-black/60">
                    {packageText.gallery.morePhotos(hiddenCount)}
                  </span>
                )
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function AutoCarousel({
  images,
  onSelect,
  children,
}: {
  images: LightboxImage[];
  onSelect: (index: number) => void;
  children?: ReactNode;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const draggedRef = useRef(false);

  // Remember whether the pointer moved the carousel, so a swipe is not treated as a click.
  useEffect(() => {
    if (!embla) return;
    const onPointerDown = () => {
      draggedRef.current = false;
    };
    const onScroll = () => {
      draggedRef.current = true;
    };
    embla.on("pointerDown", onPointerDown).on("scroll", onScroll);
    return () => {
      embla.off("pointerDown", onPointerDown).off("scroll", onScroll);
    };
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    const sync = () => setSelected(embla.selectedScrollSnap());
    sync();
    embla.on("select", sync);
    return () => {
      embla.off("select", sync);
    };
  }, [embla]);

  // Auto-advance forever; pauses while hovered/focused and for users who prefer reduced motion.
  useEffect(() => {
    if (!embla || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => embla.scrollNext(), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [embla, paused]);

  const handleClick = useCallback(
    (index: number) => {
      if (draggedRef.current) return;
      onSelect(index);
    },
    [onSelect]
  );

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl bg-muted", HEIGHT_CLASSES)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => handleClick(index)}
              className="relative h-full min-w-0 flex-[0_0_100%] cursor-zoom-in"
              aria-label={packageText.gallery.viewPhotoAria(image.alt)}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {children}

      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((image, index) => (
          <span
            key={`${image.src}-dot-${index}`}
            className={cn(
              "h-1.5 rounded-full bg-white shadow transition-all",
              index === selected ? "w-5 opacity-100" : "w-1.5 opacity-60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
