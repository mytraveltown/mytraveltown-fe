import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Printer, Calendar, Users, Mail, Phone, MapPin, FileText } from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { formatINR, formatInvoiceNo } from "@/lib/utils";
import { payBalanceOnline } from "@/lib/balancePayment";
import { toPlainText } from "@/lib/description";
import { invoiceText as t, commonText } from "@/lib/text";
import type { BookingInterface } from "@/lib/interface";
import logo from "@/assets/mytraveltown-logo.png";

/** Indian invoice date format, e.g. "15 Oct 2026". */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** MyTravelTown's GSTIN printed on every invoice; set VITE_COMPANY_GSTIN in the env file. */
const COMPANY_GSTIN = (import.meta.env.VITE_COMPANY_GSTIN ?? "").trim().toUpperCase();

/** Struck-through fee shown when the convenience fee is waived. */
const WAIVED_FEE_PER_GUEST = 500;

const PAYMENT_STATUS_STYLES: Record<BookingInterface["payment_status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Failed", className: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS_STYLES: Record<BookingInterface["status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-caption fw-semibold uppercase tracking-widest text-muted-foreground mb-2">
      {children}
    </p>
  );
}

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="text-body-sm fw-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function TotalRow({ label, value, muted = false }: { label: ReactNode; value: ReactNode; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-1.5 text-body-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function BookingInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [balanceError, setBalanceError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await GET<BookingInterface>(API.BOOKING.GET_BY_ID(encodeURIComponent(id)));
        setBooking(data);
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : t.notFound;
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handlePayBalance = () => {
    if (!id) return;
    setBalanceError("");
    payBalanceOnline(id, {
      onPaid: () =>
        setBooking((prev) =>
          prev ? { ...prev, balance_status: "paid", balance_payment_mode: "platform" } : prev
        ),
      onError: setBalanceError,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-body-lg fw-semibold text-foreground">{error || t.notFound}</p>
        <Link to="/profile" className="mt-4 text-primary hover:underline text-body-sm fw-medium">
          {t.backToProfile}
        </Link>
      </div>
    );
  }

  const invoiceNo = formatInvoiceNo(booking.id);
  const total = Number(booking.amount ?? 0);
  const basePrice = Number(booking.basePrice ?? booking.amount ?? 0);
  const convenienceFee = Number(booking.convenienceFee ?? 0);
  const gst = total - (basePrice + convenienceFee);
  const advance = Number(booking.advance_amount ?? 0);
  const hasAdvance = advance > 0;
  const isBalancePaid = booking.balance_status === "paid";
  const status = STATUS_STYLES[booking.status];
  const paymentStatus = PAYMENT_STATUS_STYLES[booking.payment_status] ?? PAYMENT_STATUS_STYLES.pending;
  const packageTitle = booking.package_name
    ? toPlainText(booking.package_name)
    : t.packageRef(booking.package_id);
  const showPayBalance =
    booking.status !== "cancelled" &&
    booking.payment_status === "paid" &&
    booking.balance_status === "pending" &&
    Number(booking.balance_amount) > 0;

  return (
    <div className="invoice-page min-h-screen bg-muted py-8 px-4 print:min-h-0 print:bg-white">
      <div className="max-w-3xl mx-auto mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="size-4" />
          {t.backToProfile}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition"
        >
          <Printer className="size-4" />
          {t.print}
        </button>
      </div>

      <article className="max-w-3xl mx-auto bg-card rounded-2xl border border-border overflow-hidden [box-shadow:var(--shadow-card)] print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="h-1.5 bg-gradient-to-r from-brand to-primary" aria-hidden="true" />

        <div className="p-6 sm:p-10 space-y-8 print:p-0 print:pt-5 print:space-y-5">
          {/* Company and invoice title */}
          <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 print:flex-row">
            <div>
              <img src={logo} alt={commonText.brandName} width={1163} height={210} className="h-9 w-auto" />
              <p className="text-caption text-muted-foreground mt-2">{t.tagline}</p>
              <p className="text-caption text-muted-foreground mt-0.5">{t.supportEmail}</p>
              {COMPANY_GSTIN && (
                <p className="text-caption text-muted-foreground mt-0.5">
                  {t.gstinLabel}: <span className="fw-semibold text-foreground tracking-wide">{COMPANY_GSTIN}</span>
                </p>
              )}
            </div>
            <div className="sm:text-right print:text-right">
              <h1 className="sr-only">{t.title}</h1>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-caption fw-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </header>

          {/* Key references */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl bg-soft px-5 py-4 print:grid-cols-4">
            <MetaItem label={t.meta.invoiceNo} value={invoiceNo} />
            <MetaItem label={t.meta.bookingId} value={booking.id} />
            <MetaItem label={t.meta.issued} value={formatDate(booking.created_at)} />
            <MetaItem label={t.meta.travel} value={formatDate(booking.travel_date)} />
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
            <div>
              <SectionLabel>{t.billedTo}</SectionLabel>
              <p className="fw-semibold text-foreground">{booking.name}</p>
              <div className="mt-1.5 space-y-1 text-body-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0" />
                  {booking.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0" />
                  {booking.phone}
                </p>
                {booking.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="size-3.5 shrink-0 mt-0.5" />
                    {booking.address}
                  </p>
                )}
              </div>
            </div>
            {booking.agent_company && (
              <div className="sm:text-right print:text-right">
                <SectionLabel>{t.travelPartner}</SectionLabel>
                <p className="fw-semibold text-foreground">{booking.agent_company}</p>
                {booking.agent_gst_no && (
                  <p className="text-body-sm text-muted-foreground mt-1.5">
                    {t.partnerGstin}:{" "}
                    <span className="fw-medium text-foreground tracking-wide">
                      {booking.agent_gst_no.toUpperCase()}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Line items */}
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b-2 border-brand text-left">
                <th className="pb-2.5 text-caption fw-semibold uppercase tracking-widest text-muted-foreground">
                  {t.table.description}
                </th>
                <th className="pb-2.5 text-caption fw-semibold uppercase tracking-widest text-muted-foreground text-right">
                  {t.table.amount}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-4 pr-4 print:py-3">
                  <p className="fw-semibold text-foreground">{packageTitle}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-caption text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(booking.travel_date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3" />
                      {t.guests(booking.guests)}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-right fw-medium tabular-nums align-top">{formatINR(basePrice)}</td>
              </tr>
            </tbody>
          </table>

          {/* Payment details beside the totals */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_20rem] gap-6 sm:gap-10 -mt-2 print:grid-cols-[1fr_20rem] print:gap-10">
            <div className="space-y-5 order-2 sm:order-1 print:order-1">
              <div>
                {booking.payment_status === "paid" && booking.paid_at && (
                  <div className="flex items-center gap-2">
                    <dt className="text-muted-foreground">{t.payment.paidOn}:</dt>
                    <dd className="fw-medium text-foreground">{formatDate(booking.paid_at)}</dd>
                  </div>
                )}
                {booking.coupon_code && (
                  <div className="flex items-center gap-2">
                    <dt className="text-muted-foreground">{t.payment.coupon}:</dt>
                    <dd className="fw-medium text-foreground uppercase">{booking.coupon_code}</dd>
                  </div>
                )}
              </div>
            </div>

            <div className="order-1 sm:order-2 print:order-2">
              <TotalRow label={t.totals.subtotal} value={formatINR(basePrice)} />
              <TotalRow
                label={t.totals.convenienceFee}
                value={
                  convenienceFee > 0 ? (
                    formatINR(convenienceFee)
                  ) : (
                    <>
                      <span className="line-through text-muted-foreground">
                        {formatINR(WAIVED_FEE_PER_GUEST * booking.guests)}
                      </span>
                      <span className="ml-2 fw-semibold text-emerald-600">{t.totals.free}</span>
                    </>
                  )
                }
              />
              <TotalRow label={t.totals.gst} value={formatINR(gst)} />

              <div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-brand px-4 py-3 text-brand-foreground">
                <span className="text-body-sm fw-semibold">{t.totals.total}</span>
                <span className="text-body-lg fw-bold tabular-nums">{formatINR(total)}</span>
              </div>

              {hasAdvance && (
                <div className="mt-2">
                  <TotalRow muted label={t.totals.paidAtBooking} value={formatINR(advance)} />
                  <div className="flex items-center justify-between gap-4 py-1.5 text-body-sm border-t border-border mt-1 pt-2.5">
                    <span className="fw-semibold text-foreground">
                      {t.totals.balanceDue}
                      {isBalancePaid && booking.balance_payment_mode && (
                        <span className="ml-1.5 text-caption fw-regular text-muted-foreground">
                          ({t.totals.paidTo(booking.balance_payment_mode)})
                        </span>
                      )}
                    </span>
                    <span className="fw-bold tabular-nums">
                      {isBalancePaid ? (
                        <span className="text-emerald-600">{t.totals.paid}</span>
                      ) : (
                        formatINR(booking.balance_amount ?? 0)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showPayBalance && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-soft px-4 py-3 print:hidden">
              <p className="text-body-sm text-foreground">
                {t.balanceNotice(formatINR(booking.balance_amount ?? 0))}
              </p>
              <button
                type="button"
                onClick={handlePayBalance}
                className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition"
              >
                {t.payBalance}
              </button>
              {balanceError && <p className="w-full text-caption text-destructive">{balanceError}</p>}
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-border pt-6 print:pt-4">
            <p className="text-body-sm fw-semibold text-foreground">{t.thankYou}</p>
            <p className="text-caption text-muted-foreground mt-1.5">{t.terms}</p>
            <p className="text-caption text-muted-foreground/80 mt-3 italic">{t.computerGenerated}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}
