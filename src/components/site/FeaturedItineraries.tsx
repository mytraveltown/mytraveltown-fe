import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl, capitalize, cn } from "@/lib/utils";
import type { PackageTypeCountsInterface, TrendingDestinationInterface } from "@/lib/interface";
import { homeText } from "@/lib/text";

const copy = homeText.featuredItineraries;

type PackageType = TrendingDestinationInterface["package_type"];

/** Max destinations per type; the row scrolls horizontally when they exceed the screen width. */
const DESTINATION_LIMIT = 12;
const DEFAULT_PACKAGE_TYPE: PackageType = "domestic";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=500&fit=crop";

/** Search page URL listing only packages of the given type going to the given destination. */
const destinationSearchPath = (destination: string, packageType: PackageType) => {
  const params = new URLSearchParams({ to: destination, package_type: packageType });
  return `/search?${params.toString()}`;
};

/**
 * Home page "Top Travel Packages" section.
 * Shows one card per destination (grouped by package `to_location`) for the selected
 * package type (domestic / international). Clicking a card opens the search page
 * filtered to that destination and type.
 */
export function FeaturedItineraries() {
  const [packageType, setPackageType] = useState<PackageType>(DEFAULT_PACKAGE_TYPE);
  const [destinations, setDestinations] = useState<TrendingDestinationInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeCounts, setTypeCounts] = useState<PackageTypeCountsInterface | null>(null);

  // Totals for both types are loaded once; they do not change with the toggle.
  useEffect(() => {
    let cancelled = false;
    GET<PackageTypeCountsInterface>(API.PACKAGE.TYPE_COUNTS)
      .then((counts) => {
        if (!cancelled) setTypeCounts(counts);
      })
      .catch((err) => {
        // Counts are supplementary; the toggle still works without them.
        console.error("Failed to load package type counts", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await GET<TrendingDestinationInterface[]>(API.PACKAGE.TRENDING_DESTINATIONS, {
          limit: DESTINATION_LIMIT,
          package_type: packageType,
        });
        if (!cancelled) setDestinations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load top destinations", err);
        if (!cancelled) {
          setDestinations([]);
          setError(copy.loadFailed);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [packageType]);

  const activeTypeLabel =
    copy.packageTypes.find((type) => type.value === packageType)?.label ?? "";

  return (
    <section id="itineraries" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 md:pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <span className="inline-block text-caption fw-semibold uppercase tracking-widest text-primary mb-2">
            {copy.eyebrow}
          </span>
          <h2>{copy.title}</h2>
          <p className="text-body-sm text-muted-foreground mt-2 max-w-md">{copy.subtitle}</p>
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <PackageTypeToggle
            value={packageType}
            onChange={setPackageType}
            counts={typeCounts}
            disabled={isLoading}
          />
          <Link
            to={`/search?package_type=${packageType}`}
            className="text-body-sm fw-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            {copy.viewAll} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error || destinations.length === 0 ? (
        <p className="py-16 text-center text-body-sm text-muted-foreground">
          {error || copy.empty(activeTypeLabel)}
        </p>
      ) : (
        <DestinationGrid destinations={destinations} packageType={packageType} />
      )}
    </section>
  );
}

type PackageTypeToggleProps = {
  value: PackageType;
  onChange: (value: PackageType) => void;
  /** Package totals per type; counts are hidden while null. */
  counts: PackageTypeCountsInterface | null;
  disabled?: boolean;
};

/** Pill-style segmented control for switching between domestic and international. */
function PackageTypeToggle({ value, onChange, counts, disabled }: PackageTypeToggleProps) {
  return (
    <div
      role="group"
      aria-label={copy.toggleLabel}
      className="inline-flex rounded-full bg-muted p-1"
    >
      {copy.packageTypes.map((type) => {
        const isActive = type.value === value;
        const count = counts?.[type.value];
        const hasCount = typeof count === "number";
        return (
          <button
            key={type.value}
            type="button"
            aria-pressed={isActive}
            aria-label={hasCount ? copy.typeCountLabel(type.label, count) : undefined}
            disabled={disabled && !isActive}
            onClick={() => !isActive && onChange(type.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-body-sm fw-semibold transition-colors disabled:cursor-not-allowed",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type.label}
            {hasCount && (
              <span
                aria-hidden="true"
                className={cn(
                  "min-w-6 rounded-full px-1.5 py-0.5 text-caption fw-bold leading-none tabular-nums text-center",
                  isActive ? "bg-white/25 text-primary-foreground" : "bg-background text-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

type DestinationGridProps = {
  destinations: TrendingDestinationInterface[];
  packageType: PackageType;
};

/** Fraction of the visible width moved per arrow click. */
const SCROLL_STEP_RATIO = 0.9;
/** Tolerance (px) for sub-pixel rounding when detecting the scroll edges. */
const EDGE_TOLERANCE_PX = 4;

/**
 * Horizontally scrollable row of destination cards on every screen size.
 * Swipe / trackpad scroll works everywhere; arrow buttons appear on desktop
 * only when the cards overflow the visible width.
 */
function DestinationGrid({ destinations, packageType }: DestinationGridProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > EDGE_TOLERANCE_PX);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - EDGE_TOLERANCE_PX);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [destinations, updateScrollState]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * SCROLL_STEP_RATIO, behavior: "smooth" });
  };

  return (
    <div className="relative" style={{ margin: "10px 0" }}>
      <div
        ref={scrollerRef}
        className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex gap-4 md:gap-5 pb-2">
          {destinations.map((destination, i) => (
            <DestinationCard
              key={destination.name}
              destination={destination}
              packageType={packageType}
              index={i}
            />
          ))}
        </div>
      </div>

      {canScrollPrev && (
        <ScrollArrow direction={-1} label={copy.scrollPrevious} onClick={() => scrollByPage(-1)} />
      )}
      {canScrollNext && (
        <ScrollArrow direction={1} label={copy.scrollNext} onClick={() => scrollByPage(1)} />
      )}
    </div>
  );
}

type ScrollArrowProps = {
  direction: -1 | 1;
  label: string;
  onClick: () => void;
};

/** Round arrow button overlaid on the card row edge (desktop only; touch users swipe). */
function ScrollArrow({ direction, label, onClick }: ScrollArrowProps) {
  const Icon = direction === -1 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "hidden md:flex absolute top-[40%] -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white/95 text-foreground shadow-[var(--shadow-card)] hover:bg-white hover:scale-105 transition",
        direction === -1 ? "-left-5" : "-right-5"
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

type DestinationCardProps = {
  destination: TrendingDestinationInterface;
  packageType: PackageType;
  index: number;
};

function DestinationCard({ destination, packageType, index }: DestinationCardProps) {
  const name = capitalize(destination.name);
  const hasPrice = destination.starting_price != null && destination.starting_price > 0;

  return (
    <Link
      to={destinationSearchPath(destination.name, packageType)}
      className="group block animate-rise shrink-0 snap-start basis-[72%] max-w-[260px] sm:max-w-none sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2*1.25rem)/3)] lg:basis-[calc((100%-4*1.25rem)/5)]"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <article>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-[var(--shadow-card)]">
          <img
            src={destination.thumbnail ? profileUrl(destination.thumbnail) : PLACEHOLDER_IMAGE}
            alt={copy.imageAlt(name)}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0" />
          <span className="absolute top-3 left-3 text-caption fw-bold uppercase tracking-wider bg-white/95 text-foreground px-2.5 py-1 rounded-full capitalize">
            {destination.package_type}
          </span>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="line-clamp-2 flex items-center gap-1.5">
              <MapPin className="h-5 w-5 shrink-0" />
              <span className="truncate">{name}</span>
            </h3>
            <p className="text-caption text-white/80 mt-0.5 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              {copy.explore} <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="text-body-sm">
            {hasPrice ? (
              <>
                <span className="text-caption text-muted-foreground">{copy.startingFrom} </span>
                <span className="fw-bold">
                  {copy.price(Number(destination.starting_price).toLocaleString("en-IN"))}
                </span>
                <span className="text-caption text-muted-foreground">{copy.perPerson}</span>
              </>
            ) : (
              <span className="fw-bold text-primary">{copy.explore}</span>
            )}
          </p>
          <span className="text-caption text-muted-foreground shrink-0">
            {copy.packageCount(destination.package_count)}
          </span>
        </div>
      </article>
    </Link>
  );
}
