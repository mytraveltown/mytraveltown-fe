import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  MapPin,
  Clock,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PriceBreakdown } from "@/components/PriceBreakdown";
import { PaymentPlanSelector } from "@/components/PaymentPlanSelector";
import { usePackageAvailability } from "@/hooks/usePackageAvailability";
import { calculatePricing, FEE_WAIVER_COUPON, type PaymentPlan } from "@/lib/pricing";
import { encryptId } from "@/lib/crypto";
import { payBalanceOnline } from "@/lib/balancePayment";
import { GET, POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { formatINR, profileUrl } from "@/lib/utils";
import { toPlainText } from "@/lib/description";
import { useAuth } from "@/hooks/useAuth";
import { packageText } from "@/lib/text";
import type { BookingInterface, PackageInterface, UserInterface } from "@/lib/interface";
import { packagePath } from "@/lib/routes";

interface RazorpayBookingResponse {
  booking: BookingInterface;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  key: string;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop";

const inputClass =
  "w-full border border-border rounded-xl px-3 py-2.5 text-body-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

function formatTravelDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day:"numeric",
    month: "short",
    year:"numeric",
  });
}

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateParam(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed >= today ? parsed : undefined;
}

export default function BookPackagePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [pkg, setPkg] = useState<PackageInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const initialGuests = Math.max(1, Number(searchParams.get("guests")) || 2);
  const [guests, setGuests] = useState(initialGuests);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [travelDate, setTravelDate] = useState<Date | undefined>(() =>
    parseDateParam(searchParams.get("date"))
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingInterface | null>(null);
  const [couponApplied, setCouponApplied] = useState(searchParams.get("coupon") === "1");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("advance");
  const [balancePaid, setBalancePaid] = useState(false);
  const { isDateUnavailable, refresh: refreshAvailability } = usePackageAvailability(pkg?.id);

  useEffect(() => {
    if (!id) return;

    const fetchPackage = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await GET<PackageInterface>(API.PACKAGE.GET_BY_ID(id));
        setPkg(data);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Package not found";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await GET<UserInterface>(API.AUTH.MY_PROFILE);
        setFullName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone != null ? String(data.phone) : "");
      } catch {
        if (user) {
          setFullName(user.name || "");
          setEmail(user.email || "");
          setPhone(user.phone != null ? String(user.phone) : "");
        }
      }
    };

    loadProfile();
  }, [user]);

  const hasPrice = pkg?.price != null && Number(pkg.price) > 0;
  const advancePricing = hasPrice
    ? calculatePricing(Number(pkg.price), guests, couponApplied, "advance")
    : null;
  const pricing = hasPrice
    ? calculatePricing(Number(pkg.price), guests, couponApplied, paymentPlan)
    : null;

  const thumbnail = useMemo(() => {
    if (pkg?.thumbnail) return profileUrl(pkg.thumbnail);
    const image = pkg?.media?.find((m) => m.media_type === "image");
    if (image) return profileUrl(image.file_path);
    return PLACEHOLDER_IMAGE;
  }, [pkg]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(null);

    if (!travelDate) {
      setBookingError("Please select a travel date.");
      setCalendarOpen(true);
      return;
    }

    const name = fullName.trim();
    const emailVal = email.trim();
    const phoneVal = String(phone).trim();
    const addressVal = address.trim();

    if (!name || !emailVal || !phoneVal || !addressVal) {
      setBookingError("Please fill in name, email, phone, and address.");
      return;
    }

    if (phoneVal.length != 10) {
      setBookingError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!pkg) return;

    setIsBooking(true);
    try {
      const response = await POST<RazorpayBookingResponse>(API.BOOKING.CREATE, {
        package_id: pkg.id,
        name,
        email: emailVal,
        phone: phoneVal,
        address: addressVal,
        travel_date: toDateInputValue(travelDate),
        guests,
        payment_plan: paymentPlan,
        ...(couponApplied && { coupon_code: FEE_WAIVER_COUPON }),
      });

      handlePayment(response.order, response.booking, response.key);
      // setBookingSuccess(booking);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Booking failed. Please try again.";
      setBookingError(message);
      // Dates may have just been taken by someone else.
      refreshAvailability();
    } finally {
      setIsBooking(false);
    }
  };

  const handlePayment = async (order: any, booking: any, key: any) => {

    const order_id = order.id;

    const options = {
      key: key,
      amount: order.amount,
      currency: "INR",
      name: "MyTravelTown",
      description: booking.package_name,
      order_id: order_id,
      handler: async function (response: any) {
        try {
          await POST(API.BOOKING.VERIFY_PAYMENT, {
            booking_id: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          setBookingSuccess(booking);
        } catch (err: unknown) {
          setBookingError(
            err && typeof err === "object" && "message" in err
              ? String((err as { message: string }).message)
              : "Payment could not be verified. Please contact support."
          );
          refreshAvailability();
        }
      },
      prefill: {
        name: booking.name,
        email: booking.email,
        contact: booking.phone,
      },
      theme: {
        color: "#0d6efd",
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

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
        <p className="text-body-lg fw-semibold text-foreground">{error || "Package not found"}</p>
        <Link to="/search" className="mt-4 text-primary hover:underline text-body-sm fw-medium">
          Browse packages
        </Link>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-lg mx-auto px-6 py-16">
          <div className="rounded-2xl border bg-card p-8 shadow-lg text-center space-y-4">
            <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <div>
              <h1 className="fw-bold">Booking Confirmed!</h1>
              <p className="text-body-sm text-muted-foreground mt-2">
                Booking ID #{bookingSuccess.id} — our partner will contact you soon.
              </p>
            </div>
            <div className="rounded-xl bg-secondary/60 border border-border p-4 text-left text-body-sm space-y-2">
              <p>
                <span className="text-muted-foreground">Package:</span>{" "}
                <span className="fw-medium">{toPlainText(pkg.package_name)}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="fw-medium">{bookingSuccess.name}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="fw-medium">{bookingSuccess.email}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                <span className="fw-medium">{bookingSuccess.phone}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Address:</span>{" "}
                <span className="fw-medium">{bookingSuccess.address}</span>
              </p>
              {bookingSuccess.amount != null && (
                <div className="pt-2 border-t border-border space-y-1">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="fw-medium">{formatINR(bookingSuccess.amount)}</span>
                  </p>
                  <p className="flex justify-between fw-semibold text-primary">
                    <span>Paid now</span>
                    <span>{formatINR(bookingSuccess.advance_amount ?? 0)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Balance due</span>
                    <span className="fw-medium">
                      {balancePaid || Number(bookingSuccess.balance_amount) <= 0
                        ? "Paid"
                        : formatINR(bookingSuccess.balance_amount ?? 0)}
                    </span>
                  </p>
                </div>
              )}
            </div>
            {!balancePaid && Number(bookingSuccess.balance_amount) > 0 && (
              <div className="rounded-xl border border-border p-4 text-left text-body-sm space-y-3">
                <p className="text-muted-foreground">
                  Pay the balance now through MyTravelTown, or pay it directly to your travel
                  partner later.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    payBalanceOnline(encryptId(bookingSuccess.id), {
                      onPaid: () => setBalancePaid(true),
                      onError: setBookingError,
                    })
                  }
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition"
                >
                  Pay balance online
                </button>
              </div>
            )}
            {bookingError && (
              <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {bookingError}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={packagePath(pkg)}
                className="flex-1 py-2.5 rounded-xl border border-border text-body-sm fw-semibold hover:bg-secondary transition text-center"
              >
                Back to package
              </Link>
              <button
                type="button"
                onClick={() => {
                  setBookingSuccess(null);
                  setBalancePaid(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition"
              >
                Book another date
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Link
          to={packagePath(pkg)}
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to {toPlainText(pkg.package_name)}
        </Link>

        <h1 className="fw-bold">Complete your booking</h1>
        <p className="text-muted-foreground mt-1 text-body-sm">
          Fill in your details to confirm this package.
        </p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Package summary */}
          <aside className="lg:col-span-2">
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <img
                src={thumbnail}
                alt={toPlainText(pkg.package_name)}
                className="w-full aspect-[16/10] object-cover"
              />
              <div className="p-5 space-y-3">
                <h2 className="fw-bold text-body-lg leading-snug">{toPlainText(pkg.package_name)}</h2>
                <div className="flex flex-wrap gap-3 text-body-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {pkg.from_location} → {pkg.to_location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {pkg.days} Days
                  </span>
                </div>
                {pkg.price != null ? (
                  <p className="text-title fw-bold text-primary">{formatINR(pkg.price)}</p>
                ) : (
                  <p className="text-body-sm fw-semibold">Contact agent for quote</p>
                )}
              </div>
            </div>
          </aside>

          {/* Booking form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleBuy}
              className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-caption fw-bold tracking-wider text-muted-foreground mb-2">
                    TRAVEL DATE
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(!calendarOpen)}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-lg border text-body-sm hover:bg-secondary transition"
                    >
                      <Calendar className="size-4 text-primary" />
                      {travelDate ? formatTravelDate(travelDate) : "Select travel date"}
                    </button>

                    {calendarOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm sm:inset-auto sm:absolute sm:top-full sm:left-0 sm:right-0 sm:mt-2 sm:bg-transparent sm:backdrop-blur-none sm:z-10">
                        <div className="w-11/12 max-w-sm bg-card border rounded-lg p-4 shadow-lg sm:w-auto">
                          <CalendarComponent
                            mode="single"
                            selected={travelDate}
                            onSelect={(date) => {
                              setTravelDate(date);
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
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-caption fw-bold tracking-wider text-muted-foreground mb-2">
                    GUESTS
                  </label>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border">
                    <div className="flex items-center gap-2 text-body-sm">
                      <Users className="size-4" /> {guests}{" "}
                      {guests === 1 ? "Guest" : "Guests"}
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
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <p className="text-caption fw-bold tracking-wider text-muted-foreground">
                  YOUR DETAILS
                </p>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="Email address"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(value);
                    }}
                    className={inputClass}
                    placeholder="Phone Number"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Full address (city, state, pin code)"
                />
              </div>

              {pricing && (
                <PriceBreakdown
                  pricing={pricing}
                  couponApplied={couponApplied}
                  onCouponChange={setCouponApplied}
                />
              )}

              {advancePricing && (
                <PaymentPlanSelector
                  value={paymentPlan}
                  onChange={setPaymentPlan}
                  advancePricing={advancePricing}
                />
              )}

              {bookingError && (
                <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {bookingError}
                </p>
              )}

              <button
                type="submit"
                disabled={isBooking}
                className="w-full py-3.5 rounded-full bg-primary text-primary-foreground fw-semibold hover:opacity-90 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" />
                    {pricing
                      ? packageText.booking.payButton(formatINR(pricing.advance))
                      : "Buy Now"}
                  </>
                )}
              </button>

              <p className="text-caption text-center text-muted-foreground">
                Free cancellation policy applies per agent terms.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
