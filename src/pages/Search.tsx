import { searchText, commonText, seoText } from "@/lib/text";
import {
  LayoutGrid,
  List,
  ChevronDown,
  Filter,
  HelpCircle,
  Loader2,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { Slider } from "@/components/ui/slider";
import { formatINR } from "@/lib/utils";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { PackageCard } from "@/components/PackageCard";
import { SEO } from "@/components/SEO";
import type { PackageInterface, PaginatedResponse } from "@/lib/interface";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ROUTES } from "@/lib/routes";
import { useIsOverflowing } from "@/hooks/useIsOverflowing";

const PAGE_SIZE = 9;
const EMPTY_BOUNDS: PriceBounds = { min: 0, max: 0, step: 1000 };

// Slider ends are the exact lowest and highest published package prices from the DB.
// The step only controls drag granularity; the thumbs can always reach both ends.
const toPriceBounds = (range: { min: number; max: number }): PriceBounds => ({
  min: range.min,
  max: range.max,
  step: range.max - range.min >= 20000 ? 1000 : 100,
});

// Minimum time the "loading more" indicator stays visible, so the load feels deliberate.
const LOAD_MORE_MIN_DELAY_MS = 1000;

const MEAL_OPTIONS = searchText.mealOptions;

const SORT_OPTIONS = [
  { v: "newest", l: searchText.sortOptions.newest },
  { v: "price_asc", l: searchText.sortOptions.priceAsc },
  { v: "price_desc", l: searchText.sortOptions.priceDesc },
] as const;

const PACKAGE_TYPE_OPTIONS = [
  { v: "", l: searchText.packageTypeOptions.all },
  { v: "domestic", l: searchText.packageTypeOptions.domestic },
  { v: "international", l: searchText.packageTypeOptions.international },
] as const;

const DURATION_OPTIONS = [
  { v: "", l: searchText.durationOptions.any },
  { v: "1-3", l: searchText.durationOptions.short },
  { v: "4-7", l: searchText.durationOptions.medium },
  { v: "8+", l: searchText.durationOptions.long },
] as const;

const HOTEL_OPTIONS = [
  { v: "", l: searchText.hotelOptions.any },
  { v: "3", l: searchText.hotelOptions.threeStar },
  { v: "4", l: searchText.hotelOptions.fourStar },
  { v: "5", l: searchText.hotelOptions.fiveStar },
] as const;

const FLIGHT_OPTIONS = [
  { v: "", l: searchText.flightOptions.any },
  { v: "included", l: searchText.flightOptions.included },
  { v: "excluded", l: searchText.flightOptions.excluded },
] as const;

const TRANSFER_OPTIONS = [
  { v: "", l: searchText.transferOptions.any },
  { v: "airport", l: searchText.transferOptions.airport },
  { v: "railway", l: searchText.transferOptions.railway },
] as const;

const VISA_OPTIONS = [
  { v: "", l: searchText.visaOptions.any },
  { v: "not_required", l: searchText.visaOptions.notRequired },
  { v: "required", l: searchText.visaOptions.required },
] as const;

const EXPERIENCE_OPTIONS = [
  { v: "", l: searchText.experienceOptions.any },
  { v: "5", l: searchText.experienceOptions.fivePlus },
  { v: "10", l: searchText.experienceOptions.tenPlus },
] as const;

/** Every filter is stored in the URL under these query keys, which match the API params. */
const FILTER_KEYS = [
  "q",
  "from",
  "to",
  "package_type",
  "duration",
  "hotel_stars",
  "meals",
  "min_price",
  "max_price",
  "flights",
  "transfer",
  "visa",
  "min_experience",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];
type Filters = Record<FilterKey, string>;
type SetFilter = (key: FilterKey, value: string) => void;
type RadioOption = { readonly v: string; readonly l: string };
type PriceBounds = { min: number; max: number; step: number };

const DEFAULT_SORT = "newest";

const readFilters = (params: URLSearchParams): Filters =>
  Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key)?.trim() || ""])) as Filters;

/** Visa only applies to international trips, so it is dropped when Domestic is chosen. */
const normalizeFilters = (filters: Filters): Filters =>
  filters.package_type === "domestic" ? { ...filters, visa: "" } : filters;

/**
 * The results box only scrolls on desktop (see the layout below). On mobile it is a plain block,
 * so the page viewport (null) must stay the observer root or every page would load at once.
 */
const getScrollRoot = (element: HTMLElement | null) =>
  element && getComputedStyle(element).overflowY === "auto" ? element : null;

/**
 * Sets one filter. Changing the package type also resets the budget, because each type has its
 * own price range and the old selection could fall outside the new slider ends.
 */
const withFilter = (filters: Filters, key: FilterKey, value: string): Filters => {
  const next = { ...filters, [key]: value };
  if (key === "package_type" && value !== filters.package_type) {
    next.min_price = "";
    next.max_price = "";
  }
  return next;
};

const toSearchParams = (filters: Filters, sort: string) => {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key].trim();
    if (value) params.set(key, value);
  }
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  return params;
};

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const resultsScrollRef = useRef<HTMLDivElement | null>(null);
  const resultsContentRef = useRef<HTMLDivElement | null>(null);
  // Border is only shown when the cards are taller than the box, i.e. when it actually scrolls.
  const isResultsOverflowing = useIsOverflowing(resultsScrollRef, resultsContentRef);
  // Cancellation flag for the current filter set; stale responses are dropped.
  const signalRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const [filterOpen, setFilterOpen] = useState(false);

  // Applied filters live in the URL; `draft` holds edits not yet applied from the panel.
  const searchKey = searchParams.toString();
  const applied = useMemo(() => readFilters(new URLSearchParams(searchKey)), [searchKey]);
  const sort = searchParams.get("sort") || DEFAULT_SORT;
  const [draft, setDraft] = useState<Filters>(applied);
  const [priceBounds, setPriceBounds] = useState<PriceBounds>(EMPTY_BOUNDS);

  // Budget slider ends follow the package type being picked, so they refresh on every type change.
  const draftPackageType = draft.package_type;
  useEffect(() => {
    let cancelled = false;
    GET<{ min: number; max: number }>(
      API.PACKAGE.PRICE_RANGE,
      draftPackageType ? { package_type: draftPackageType } : undefined
    )
      .then((range) => !cancelled && setPriceBounds(toPriceBounds(range)))
      .catch(() => !cancelled && setPriceBounds(EMPTY_BOUNDS));
    return () => {
      cancelled = true;
    };
  }, [draftPackageType]);

  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  const setDraftFilter: SetFilter = useCallback(
    (key, value) => setDraft((prev) => withFilter(prev, key, value)),
    []
  );

  const queryParams = useMemo(
    () => Object.fromEntries(toSearchParams(applied, sort)),
    [applied, sort]
  );

  const getErrorMessage = (err: unknown) =>
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : searchText.errors.loadFailed;

  // Fetch one page from the backend. Page 1 replaces the list, later pages append.
  const fetchPage = useCallback(
    async (pageNumber: number, signal: { cancelled: boolean }) => {
      const isFirstPage = pageNumber === 1;
      if (isFirstPage) setIsLoading(true);
      else setIsLoadingMore(true);
      setError("");
      try {
        const request = GET<PaginatedResponse<PackageInterface>>(API.PACKAGE.GET_ALL, {
          ...queryParams,
          page: pageNumber,
          limit: PAGE_SIZE,
        });
        const [result] = await Promise.all([
          request,
          isFirstPage
            ? Promise.resolve()
            : new Promise((resolve) => setTimeout(resolve, LOAD_MORE_MIN_DELAY_MS)),
        ]);
        if (signal.cancelled) return;
        setPackages((prev) => {
          if (isFirstPage) return result.data;
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...result.data.filter((p) => !seen.has(p.id))];
        });
        setPage(result.pagination.page);
        setTotal(result.pagination.total);
        setHasMore(result.pagination.page < result.pagination.totalPages);
      } catch (err: unknown) {
        if (signal.cancelled) return;
        setError(getErrorMessage(err));
        setHasMore(false);
      } finally {
        if (!signal.cancelled) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [queryParams]
  );

  // Filters, search or sort changed: start again from page 1.
  useEffect(() => {
    const signal = { cancelled: false };
    signalRef.current = signal;
    resultsScrollRef.current?.scrollTo({ top: 0 });
    setPackages([]);
    setHasMore(false);
    fetchPage(1, signal);
    return () => {
      signal.cancelled = true;
    };
  }, [fetchPage]);

  // Load the next page when the sentinel below the list scrolls into view.
  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          fetchPage(page + 1, signalRef.current);
        }
      },
      { root: getScrollRoot(resultsScrollRef.current), rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, page, fetchPage]);

  const applyFilters = (closeDrawer = false) => {
    setSearchParams(toSearchParams(normalizeFilters(draft), sort));
    if (closeDrawer) setFilterOpen(false);
  };

  const clearFilters = (closeDrawer = false) => {
    setSearchParams(toSearchParams(readFilters(new URLSearchParams()), sort));
    if (closeDrawer) setFilterOpen(false);
  };

  const updateSort = (value: string) => {
    setSearchParams(toSearchParams(applied, value));
  };

  /** Mobile quick chips apply instantly, keeping the other applied filters. */
  const applyQuickFilter: SetFilter = (key, value) => {
    setSearchParams(toSearchParams(normalizeFilters(withFilter(applied, key, value)), sort));
  };

  const activeFilterCount = FILTER_KEYS.filter((key) => applied[key]).length;
  const hasActiveFilters = activeFilterCount > 0;
  const { q, from, to, package_type: packageType, duration } = applied;

  const heading = isLoading
    ? searchText.heading.searching
    : searchText.heading.found(total);
  const filterSummary = [
    from && searchText.summary.from(from),
    to && searchText.summary.to(to),
    q && searchText.summary.keyword(q),
  ]
    .filter(Boolean)
    .join(searchText.summary.separator);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={hasActiveFilters ? heading : seoText.packages.title}
        description={
          filterSummary
            ? searchText.seo.withFilters(heading, filterSummary, commonText.brandName)
            : seoText.packages.description
        }
        canonical="/search"
        noIndex={hasActiveFilters}
      />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-brand">
              {heading}
            </h1>
            <p className="text-muted-foreground mt-1 text-body-sm">
              {hasActiveFilters ? filterSummary : searchText.heading.defaultSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 border border-border bg-card rounded-lg px-3 py-2 text-body-sm fw-medium hover:border-primary/40 transition"
            >
              <Filter className="h-4 w-4 text-primary" />
              {searchText.toolbar.filters}
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-caption fw-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateSort(e.target.value)}
                className="appearance-none border border-border bg-card rounded-lg pl-3 pr-8 py-2 text-body-sm fw-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`px-3 py-1.5 text-body-sm rounded-md flex items-center gap-1.5 ${
                  view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> {searchText.toolbar.grid}
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-body-sm rounded-md flex items-center gap-1.5 ${
                  view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <List className="h-4 w-4" /> {searchText.toolbar.list}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile quick filter chips — horizontal slider */}
        <div className="lg:hidden -mx-4 px-4 mb-5 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 w-max pb-1">
            {PACKAGE_TYPE_OPTIONS.map((o) => (
              <button
                key={o.v || "all"}
                type="button"
                onClick={() => applyQuickFilter("package_type", o.v)}
                className={`shrink-0 text-caption px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
                  packageType === o.v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {o.l}
              </button>
            ))}
            {DURATION_OPTIONS.filter((o) => o.v).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => applyQuickFilter("duration", duration === o.v ? "" : o.v)}
                className={`shrink-0 text-caption px-3.5 py-2 rounded-full border transition whitespace-nowrap ${
                  duration === o.v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {o.l}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="shrink-0 text-caption px-3.5 py-2 rounded-full border border-dashed border-primary/40 bg-primary/5 text-primary fw-medium whitespace-nowrap"
            >
              {searchText.toolbar.moreFilters}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block bg-card border border-border rounded-2xl p-5 h-fit">
            <FilterPanel
              idPrefix="desktop"
              filters={draft}
              onChange={setDraftFilter}
              onApply={() => applyFilters()}
              onClear={() => clearFilters()}
              hasActiveFilters={hasActiveFilters}
              priceBounds={priceBounds}
            />
          </aside>

          {/*
            Desktop: the results are taken out of flow (absolute), so the grid row height comes from
            the filter sidebar alone and the results scroll inside a box of exactly that height.
            Mobile: the sidebar is hidden, so results flow normally with the page.
          */}
          <div className="lg:relative">
            <div
              ref={resultsScrollRef}
              className={`lg:absolute lg:inset-0 lg:overflow-y-auto lg:overscroll-contain lg:border lg:rounded-2xl lg:p-4 transition-colors ${
                isResultsOverflowing ? "lg:border-border" : "lg:border-transparent"
              }`}
            >
              <div ref={resultsContentRef}>
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : packages.length === 0 ? (
                  <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <SearchIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <h2 className="text-body-lg fw-semibold">{searchText.empty.title}</h2>
                    <p className="text-body-sm text-muted-foreground mt-1 mb-4">
                      {searchText.empty.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => clearFilters()}
                      className="text-body-sm text-primary fw-medium hover:underline"
                    >
                      {searchText.empty.clearFilters}
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                        : "flex flex-col gap-4"
                    }
                  >
                    {packages.map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} list={view === "list"} />
                    ))}
                  </div>
                )}

                {!isLoading && packages.length > 0 && (
                  <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        {searchText.loadingMore}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter drawer (slide-up) */}
      <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
        <DrawerContent className="max-h-[92vh] lg:hidden">
          <DrawerHeader className="text-left border-b border-border pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <DrawerTitle className="font-display text-body-lg fw-bold">{searchText.drawer.title}</DrawerTitle>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"
                  aria-label={searchText.drawer.closeAria}
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>
            <DrawerDescription className="text-caption text-primary fw-medium">
              {searchText.drawer.description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto px-4 py-2 overscroll-contain">
            <FilterPanel
              idPrefix="mobile"
              filters={draft}
              onChange={setDraftFilter}
              onApply={() => applyFilters(true)}
              onClear={() => clearFilters(true)}
              hasActiveFilters={hasActiveFilters}
              priceBounds={priceBounds}
              hideActions
            />
          </div>

          <DrawerFooter className="border-t border-border pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => applyFilters(true)}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-body-sm fw-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <SearchIcon className="h-4 w-4" /> {searchText.drawer.apply}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => clearFilters(true)}
                className="w-full text-body-sm text-muted-foreground hover:text-foreground py-1"
              >
                {searchText.drawer.clearAll}
              </button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default SearchPage;

function FilterPanel({
  idPrefix,
  filters,
  onChange,
  onApply,
  onClear,
  hasActiveFilters,
  priceBounds,
  hideActions = false,
}: {
  idPrefix: string;
  filters: Filters;
  onChange: SetFilter;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  priceBounds: PriceBounds;
  hideActions?: boolean;
}) {
  const showVisa = filters.package_type !== "domestic";

  return (
    <>
      {!hideActions && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-body-lg">{searchText.panel.title}</h2>
          </div>
          <p className="text-caption text-primary fw-medium mb-5">{searchText.panel.subtitle}</p>
        </>
      )}

      <div className="space-y-3">
        <FilterField label={searchText.panel.keyword}>
          <input
            value={filters.q}
            onChange={(e) => onChange("q", e.target.value)}
            placeholder={searchText.panel.keywordPlaceholder}
            className="w-full border border-border rounded-lg px-3 py-2 text-body-sm bg-background focus:outline-none focus:border-primary"
          />
        </FilterField>
        <FilterField label={searchText.panel.from}>
          <LocationAutocomplete
            type="from"
            related={filters.to}
            value={filters.from}
            onChange={(value) => onChange("from", value)}
            placeholder={searchText.panel.fromPlaceholder}
            className="w-full border border-border rounded-lg px-3 py-2 text-body-sm bg-background focus:outline-none focus:border-primary"
          />
        </FilterField>
        <FilterField label={searchText.panel.to}>
          <LocationAutocomplete
            type="to"
            related={filters.from}
            value={filters.to}
            onChange={(value) => onChange("to", value)}
            placeholder={searchText.panel.toPlaceholder}
            className="w-full border border-border rounded-lg px-3 py-2 text-body-sm bg-background focus:outline-none focus:border-primary"
          />
        </FilterField>
      </div>

      <FilterGroup title={searchText.panel.packageType}>
        <div className="flex flex-wrap gap-2">
          {PACKAGE_TYPE_OPTIONS.map((o) => (
            <button
              key={o.v || "all"}
              type="button"
              onClick={() => onChange("package_type", o.v)}
              className={`text-caption px-3 py-1.5 rounded-full border transition ${
                filters.package_type === o.v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-muted hover:border-primary/40"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </FilterGroup>

      <BudgetSlider
        bounds={priceBounds}
        minPrice={filters.min_price}
        maxPrice={filters.max_price}
        onChange={(min, max) => {
          onChange("min_price", min);
          onChange("max_price", max);
        }}
      />

      <RadioGroup
        name={`${idPrefix}-duration`}
        title={searchText.panel.duration}
        options={DURATION_OPTIONS}
        value={filters.duration}
        onChange={(value) => onChange("duration", value)}
      />

      <RadioGroup
        name={`${idPrefix}-hotel`}
        title={searchText.panel.hotel}
        options={HOTEL_OPTIONS}
        value={filters.hotel_stars}
        onChange={(value) => onChange("hotel_stars", value)}
      />

      <RadioGroup
        name={`${idPrefix}-flights`}
        title={searchText.panel.flights}
        options={FLIGHT_OPTIONS}
        value={filters.flights}
        onChange={(value) => onChange("flights", value)}
      />

      <RadioGroup
        name={`${idPrefix}-transfer`}
        title={searchText.panel.transfers}
        options={TRANSFER_OPTIONS}
        value={filters.transfer}
        onChange={(value) => onChange("transfer", value)}
      />

      {showVisa && (
        <RadioGroup
          name={`${idPrefix}-visa`}
          title={searchText.panel.visa}
          options={VISA_OPTIONS}
          value={filters.visa}
          onChange={(value) => onChange("visa", value)}
        />
      )}

      <RadioGroup
        name={`${idPrefix}-experience`}
        title={searchText.panel.experience}
        options={EXPERIENCE_OPTIONS}
        value={filters.min_experience}
        onChange={(value) => onChange("min_experience", value)}
      />

      <FilterGroup title={searchText.panel.meals}>
        <div className="relative">
          <select
            value={filters.meals}
            onChange={(e) => onChange("meals", e.target.value)}
            className="w-full appearance-none border border-border rounded-lg pl-3 pr-10 py-2 text-body-sm bg-background focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">{searchText.panel.anyMeals}</option>
            {MEAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </FilterGroup>

      {!hideActions && (
        <>
          <button
            type="button"
            onClick={onApply}
            className="mt-5 w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-body-sm fw-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <SearchIcon className="h-4 w-4" /> {searchText.panel.search}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="mt-3 w-full text-body-sm text-muted-foreground hover:text-foreground"
            >
              {searchText.panel.clearAll}
            </button>
          )}
          <Link
            to={ROUTES.CONTACT}
            className="mt-3 w-full text-body-sm text-muted-foreground flex items-center justify-center gap-1.5 hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" /> {searchText.panel.support}
          </Link>
        </>
      )}
    </>
  );
}

function BudgetSlider({
  bounds,
  minPrice,
  maxPrice,
  onChange,
}: {
  bounds: PriceBounds;
  minPrice: string;
  maxPrice: string;
  onChange: (min: string, max: string) => void;
}) {
  if (bounds.max <= bounds.min) return null;

  const low = Math.max(bounds.min, Number(minPrice) || bounds.min);
  const high = Math.min(bounds.max, Number(maxPrice) || bounds.max);

  // A thumb resting on its end of the track means "no limit", so it is not sent to the API.
  const handleChange = ([nextLow, nextHigh]: number[]) =>
    onChange(
      nextLow <= bounds.min ? "" : String(nextLow),
      nextHigh >= bounds.max ? "" : String(nextHigh)
    );

  return (
    <FilterGroup title={searchText.panel.budget}>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={[low, high]}
        onValueChange={handleChange}
        aria-label={searchText.panel.budget}
        className="my-3"
      />
      <div className="flex items-center justify-between text-caption fw-medium text-muted-foreground">
        <span>{formatINR(low)}</span>
        <span>{formatINR(high)}</span>
      </div>
    </FilterGroup>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-caption fw-semibold text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 pt-5 border-t border-border">
      <h3 className="text-body-sm fw-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function RadioGroup({
  name,
  title,
  options,
  value,
  onChange,
}: {
  name: string;
  title: string;
  options: readonly RadioOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FilterGroup title={title}>
      {options.map((o) => (
        <label key={o.v || `${name}-any`} className="flex items-center gap-2 py-1.5 text-body-sm cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === o.v}
            onChange={() => onChange(o.v)}
            className="accent-[var(--primary)] h-4 w-4"
          />
          {o.l}
        </label>
      ))}
    </FilterGroup>
  );
}
