import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { REVIEW_FOCUS_PARAM, packagePath } from "@/lib/routes";
import {
  Clock,
  MapPin,
  Hotel,
  ChefHat,
  Plane,
  Car,
  ShieldCheck,
  Calendar,
  Users,
  Minus,
  Plus,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { usePackageAvailability } from "@/hooks/usePackageAvailability";
import { useAuth } from "@/hooks/useAuth";
import { calculatePricing } from "@/lib/pricing";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { SEO } from "@/components/SEO";
import { PackageGallery } from "@/components/PackageGallery";
import { PackageActions } from "@/components/PackageActions";
import { PackageCard } from "@/components/PackageCard";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";
import { PackageDescription } from "@/components/PackageDescription";
import { PackageReviews } from "@/components/reviews/PackageReviews";
import { toPlainText } from "@/lib/description";
import { formatINR, profileUrl, capitalize } from "@/lib/utils";
import type { PackageInterface } from "@/lib/interface";
import { packageText } from "@/lib/text";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop";

function buildInclusions(pkg: PackageInterface) {
  const items: { icon: typeof Plane; label: string }[] = [];

  if (pkg.flight_option === "included") {
    items.push({ icon: Plane, label: packageText.inclusions.flights });
  }
  if (pkg.cab_to_hotel) {
    const from =
      pkg.cab_to_hotel_from === "both"
        ? packageText.inclusions.airportOrRailway
        : pkg.cab_to_hotel_from === "airport"
          ? packageText.inclusions.airport
          : packageText.inclusions.railwayStation;
    items.push({ icon: Car, label: packageText.inclusions.cabToHotel(from) });
  }
  if (pkg.cab_from_hotel) {
    const to =
      pkg.cab_from_hotel_to === "both"
        ? packageText.inclusions.airportOrRailway
        : pkg.cab_from_hotel_to === "airport"
          ? packageText.inclusions.airport
          : packageText.inclusions.railwayStation;
    items.push({ icon: Car, label: packageText.inclusions.cabFromHotel(to) });
  }

  const maxStars = pkg.itinerary?.length
    ? Math.max(...pkg.itinerary.map((d) => d.hotel_stars))
    : 3;
  const starsLabel = maxStars < 3 ? packageText.inclusions.standardStars : String(maxStars);
  items.push({ icon: Hotel, label: packageText.inclusions.hotelStay(starsLabel) });

  if (pkg.itinerary?.some((d) => d.meals)) {
    items.push({ icon: ChefHat, label: packageText.inclusions.meals });
  }
  if (pkg.package_type === "international" && pkg.visa_required) {
    items.push({ icon: ShieldCheck, label: packageText.inclusions.visa });
  }

  return items;
}

function agentInitials(name?: string) {
  if (!name) return "AG";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTravelDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function PackagePage() {
  // Route param is the package slug; numeric ids from older links still resolve and get redirected.
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageInterface | null>(null);
  const [related, setRelated] = useState<PackageInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [guests, setGuests] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [travelDate, setTravelDate] = useState<Date | undefined>();
  const [bookHint, setBookHint] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { isDateUnavailable } = usePackageAvailability(pkg?.id);
  const isLoggedIn = useAuth((s) => s.isLoggedIn);

  useEffect(() => {
    if (!id) return;

    const fetchPackage = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [data, all] = await Promise.all([
          GET<PackageInterface>(API.PACKAGE.GET_BY_ID(id)),
          GET<PackageInterface[]>(API.PACKAGE.GET_ALL),
        ]);
        setPkg(data);
        setRelated(all.filter((p) => p.id !== data.id).slice(0, 3));
        if (data.slug && id !== data.slug) {
          navigate(packagePath(data), { replace: true });
        }
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : packageText.notFound;
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [id, navigate]);

  const bookUrl =
    pkg && travelDate
      ? `${packagePath(pkg)}/book?date=${toDateInputValue(travelDate)}&guests=${guests}${couponApplied ? "&coupon=1" : ""}`
      : null;

  const images = useMemo(() => {
    const media = pkg?.media?.filter((m) => m.media_type === "image") || [];
    if (media.length) {
      return media.map((m) => ({
        src: profileUrl(m.file_path),
        alt: pkg?.package_name || packageText.photoAlt,
      }));
    }
    return [{ src: PLACEHOLDER_IMAGE, alt: pkg?.package_name || packageText.fallbackAlt }];
  }, [pkg]);

  const inclusions = useMemo(() => (pkg ? buildInclusions(pkg) : []), [pkg]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <p className="text-body-lg fw-semibold text-foreground">{error || packageText.notFound}</p>
        <Link to="/search" className="mt-4 text-primary hover:underline text-body-sm fw-medium">
          {packageText.browse}
        </Link>
      </div>
    );
  }

  // const packagePrice = pkg.price != null && Number(pkg.price) > 0 ? Number(pkg.price) * guests : null;
  const pricing =
    pkg.price != null && Number(pkg.price) > 0
      ? calculatePricing(Number(pkg.price), guests, couponApplied)
      : null;

  const seoTitle = toPlainText(pkg.package_name);
  const plainDescription = pkg.location_description ? toPlainText(pkg.location_description) : "";
  const seoDescription = [
    packageText.seo.summary(seoTitle, pkg.days, pkg.nights),
    packageText.seo.route(capitalize(pkg.from_location), capitalize(pkg.to_location)),
    pkg.price != null && Number(pkg.price) > 0
      ? packageText.seo.fromPrice(formatINR(Number(pkg.price)))
      : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={plainDescription.slice(0, 160) || seoDescription}
        canonical={packagePath(pkg)}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: seoTitle,
          description: plainDescription || seoDescription,
          image: images.map((i) => i.src),
          touristType: pkg.package_type,
          ...(pricing && {
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: Number(pkg.price),
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <PackageGallery
          images={images}
          overlay={
            <PackageActions
              packageId={pkg.id}
              slug={pkg.slug}
              title={seoTitle}
              className="top-4 right-4"
            />
          }
        />

        {/* Content + Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-caption fw-semibold uppercase capitalize">
                {pkg.package_type}
              </span>
              {pkg.status === "published" && (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-caption fw-semibold uppercase">
                  {packageText.details.available}
                </span>
              )}
            </div>
            <h1 className="mt-4 tracking-tight">{capitalize(seoTitle)}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-5 text-body-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                <b className="text-foreground">
                  {packageText.details.duration(pkg.days, pkg.nights)}
                </b>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {capitalize(pkg.from_location)} → {capitalize(pkg.to_location)}
              </span>
            </div>

            {pkg.location_description && (
              <>
                <h2 className="mt-10">{packageText.details.aboutHeading}</h2>
                <PackageDescription text={pkg.location_description} />
              </>
            )}

            {inclusions.length > 0 && (
              <>
                <h2 className="mt-10">{packageText.inclusions.heading}</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {inclusions.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3"
                    >
                      <item.icon className="size-5 text-primary" />
                      <span className="text-body-sm fw-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <>
                <h2 className="mt-12">{packageText.details.itineraryHeading}</h2>
                <ItineraryTimeline days={pkg.itinerary} />
              </>
            )}

            {/* Partner */}
            <div className="mt-12 rounded-2xl bg-secondary p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="size-16 rounded-full bg-foreground/90 flex items-center justify-center text-background fw-bold shrink-0">
                {agentInitials(pkg.agent_company || pkg.agent_name)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-body-lg fw-bold">{pkg.agent_company || pkg.agent_name}</h3>
                  <span className="flex items-center gap-1 text-caption px-2 py-0.5 rounded-full bg-primary/10 text-primary fw-medium">
                    <BadgeCheck className="size-3" /> {packageText.partner.verified}
                  </span>
                </div>
                <p className="text-body-sm italic text-muted-foreground mt-1">
                  {packageText.partner.tagline}
                </p>
              </div>
              <Link
                to={`/agent/${pkg.agent_id}`}
                className="px-5 py-2.5 rounded-full border-2 border-foreground/80 text-body-sm fw-semibold hover:bg-foreground hover:text-background transition"
              >
                {packageText.partner.viewProfile}
              </Link>
            </div>
          </div>

          {/* Booking sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-lg space-y-4">
              <div>
                <div className="text-body-sm text-muted-foreground">{packageText.booking.pricing}</div>
                {pkg.price != null ? (
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-price-lg fw-bold text-foreground">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-body-sm text-muted-foreground">{packageText.booking.perPerson}</span>
                  </div>
                ) : (
                  <div className="mt-1 text-body-lg fw-semibold text-foreground">
                    {packageText.booking.contactForQuote}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-caption fw-bold tracking-wider text-muted-foreground mb-2">
                  {packageText.booking.travelDateLabel}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setCalendarOpen(!calendarOpen);
                      setBookHint("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border text-body-sm hover:bg-secondary transition"
                  >
                    <Calendar className="size-4 text-primary" />
                    {travelDate ? formatTravelDate(travelDate) : packageText.booking.selectDate}
                  </button>

                  {calendarOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm md:inset-auto md:absolute md:top-full md:left-0 md:right-0 md:mt-2 md:bg-transparent md:backdrop-blur-none md:z-10">
                      <div className="w-11/12 max-w-sm bg-card border rounded-lg p-4 shadow-lg md:w-auto">
                        <CalendarComponent
                          mode="single"
                          selected={travelDate}
                          onSelect={(date) => {
                            setTravelDate(date);
                            setBookHint("");
                            if (date) setCalendarOpen(false);
                          }}
                          disabled={isDateUnavailable}
                          className="rounded-md border mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setCalendarOpen(false)}
                          className="mt-3 w-full py-2 text-body-sm fw-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                        >
                          {packageText.booking.done}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-caption fw-bold tracking-wider text-muted-foreground mb-2">
                  {packageText.booking.guestsLabel}
                </label>
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border">
                  <div className="flex items-center gap-2 text-body-sm">
                    <Users className="size-4" /> {guests}{" "}
                    {guests === 1 ? packageText.booking.guest : packageText.booking.guests}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="size-7 rounded-full border flex items-center justify-center hover:bg-secondary"
                    >
                      <Minus className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      className="size-7 rounded-full border flex items-center justify-center hover:bg-secondary"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* {packagePrice != null && (
                <div className="flex justify-between text-body-sm fw-bold pt-1 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(packagePrice)}</span>
                </div>
              )} */}

              {pricing && (
                <PriceBreakdown
                  pricing={pricing}
                  couponApplied={couponApplied}
                  onCouponChange={setCouponApplied}
                />
              )}

              {bookHint && (
                <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {bookHint}
                </p>
              )}

              {bookUrl ? (
                <Link
                  to={bookUrl}
                  className="block w-full py-3.5 rounded-full bg-primary text-primary-foreground fw-semibold hover:opacity-90 transition text-center"
                >
                  {packageText.booking.bookNow}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBookHint(packageText.booking.dateHint);
                    setCalendarOpen(true);
                  }}
                  className="w-full py-3.5 rounded-full bg-primary text-primary-foreground fw-semibold hover:opacity-90 transition"
                >
                  {packageText.booking.bookNow}
                </button>
              )}

              <p className="text-caption text-center text-muted-foreground">
                {packageText.booking.cancellationNote}
              </p>
            </div>
          </aside>
        </section>

        {/* Ratings & reviews are visible to logged-in users only. */}
        {isLoggedIn && (
          <PackageReviews
            packageId={pkg.id}
            focusReviewId={Number(searchParams.get(REVIEW_FOCUS_PARAM)) || null}
          />
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 pb-16">
            <h2>{packageText.related.heading}</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <PackageCard key={r.id} pkg={r} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
