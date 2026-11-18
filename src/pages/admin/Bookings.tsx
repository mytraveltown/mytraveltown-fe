import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DateRange } from "react-day-picker";
import { ChevronDown, Eye, Loader2 } from "lucide-react";
import { GET, PUT } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { formatINR, formatInvoiceNo } from "@/lib/utils";
import { encryptId } from "@/lib/crypto";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { TruncatedText } from "@/components/admin/TruncatedText";
import type { BookingInterface, PaginatedResponse, PaginationMeta } from "@/lib/interface";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

/** Local calendar date as YYYY-MM-DD (toISOString would shift the day for IST users). */
const toApiDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const invoicePath = (bookingId: number) => `/booking/${encryptId(bookingId)}/invoice`;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | BookingInterface["status"]>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const fromDate = dateRange?.from;
      const toDate = dateRange?.to ?? dateRange?.from;
      const result = await GET<PaginatedResponse<BookingInterface>>(API.BOOKING.GET_MANAGE, {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
        ...(fromDate &&
          toDate && {
            from: toApiDate(fromDate),
            to: toApiDate(toDate),
          }),
      });
      setBookings(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load bookings";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, dateRange]);

  const hasFilters = Boolean(statusFilter || dateRange?.from);

  const resetToFirstPage = () => setPagination((p) => ({ ...p, page: 1 }));

  const clearFilters = () => {
    setStatusFilter("");
    setDateRange(undefined);
    resetToFirstPage();
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: number, status: BookingInterface["status"]) => {
    setUpdatingId(id);
    try {
      const updated = await PUT<BookingInterface>(API.BOOKING.UPDATE_STATUS(id), {
        status,
      });
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update status";
      alert(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const markBalanceReceived = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await PUT<{ data: BookingInterface }>(API.BOOKING.BALANCE_RECEIVED(id));
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...res.data } : b)));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update balance";
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="fw-bold flex items-center gap-3">
          {/* <BookOpen className="icon-heading text-blue-600" /> */}
          Bookings
        </h2>
        <p className="text-body-sm text-neutral-500">
          View guest bookings with name, email, phone, and address.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative w-fit">
          <select
            aria-label="Filter by booking status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              resetToFirstPage();
            }}
            className="peer appearance-none h-full border border-neutral-200 rounded-lg pl-4 pr-9 py-2.5 text-body-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 transition-transform peer-focus:rotate-180"
          />
        </div>
        <DateRangeFilter
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            resetToFirstPage();
          }}
          placeholder="Select travel date range"
          className="lg:w-80"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-lg border border-neutral-200 text-body-sm fw-medium text-neutral-700 hover:bg-neutral-50"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            {hasFilters ? "No bookings match these filters." : "No bookings yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm min-w-[1400px]">
              <thead>
                <tr className="text-left text-caption uppercase tracking-wide text-neutral-500 border-b border-neutral-200 bg-neutral-50 whitespace-nowrap">
                  <th className="py-3 px-4 fw-medium">ID</th>
                  <th className="py-3 px-4 fw-medium">Guest</th>
                  <th className="py-3 px-4 fw-medium">Contact</th>
                  <th className="py-3 px-4 fw-medium">Address</th>
                  <th className="py-3 px-4 fw-medium">Package</th>
                  <th className="py-3 px-4 fw-medium">Travel Date</th>
                  <th className="py-3 px-4 fw-medium">Amount</th>
                  <th className="py-3 px-4 fw-medium">Status</th>
                  <th className="py-3 px-4 fw-medium">Payment Status</th>
                  <th className="py-3 px-4 fw-medium">Balance</th>
                  <th className="py-3 px-4 fw-medium">Invoice</th>
                  <th className="py-3 px-4 fw-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80 align-top [&>td]:whitespace-nowrap"
                  >
                    <td className="py-4 px-4 font-mono text-caption">#{b.id}</td>
                    <td className="py-4 px-4 fw-medium">
                      <TruncatedText text={b.name} maxWidthClass="max-w-[140px]" className="capitalize" />
                    </td>
                    <td className="py-4 px-4 text-neutral-600">
                      <TruncatedText text={b.email} maxWidthClass="max-w-[220px]" />
                      <span className="block text-caption text-neutral-400">{b.phone}</span>
                    </td>
                    <td className="py-4 px-4 text-neutral-600">
                      <TruncatedText text={b.address} maxWidthClass="max-w-[180px]" />
                    </td>
                    <td className="py-4 px-4 text-neutral-600">
                      <TruncatedText
                        text={b.package_name || `Package #${b.package_id}`}
                        maxWidthClass="max-w-[200px]"
                      />
                    </td>
                    <td className="py-4 px-4 text-neutral-600 whitespace-nowrap">
                      {formatDate(b.travel_date)}
                      <span className="block text-caption text-neutral-400">
                        {b.guests} guest{b.guests === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="py-4 px-4 fw-semibold whitespace-nowrap">
                      {b.amount != null ? formatINR(b.amount) : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-caption fw-semibold px-2.5 py-1 rounded-full capitalize ${
                          statusStyle[b.status] || statusStyle.pending
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-caption fw-semibold px-2.5 py-1 rounded-full capitalize ${
                          statusStyle[b.payment_status] || statusStyle.pending
                        }`}
                      >
                        {b.payment_status}
                      </span>
                      {b.payment_status === "paid" && b.paid_at && (
                        <span className="block mt-1.5 text-caption text-neutral-400">
                          {formatDateTime(b.paid_at)}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {b.payment_status !== "paid" ? (
                        "—"
                      ) : !Number(b.balance_amount) ? (
                        <span className="text-caption fw-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Paid in full
                        </span>
                      ) : b.balance_status === "paid" ? (
                        <span className="text-caption fw-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Paid {b.balance_payment_mode === "agent" ? "to agent" : "online"}
                        </span>
                      ) : (
                        <div className="space-y-2">
                          <span className="block fw-semibold">
                            {formatINR(b.balance_amount ?? 0)}
                          </span>
                          {b.status !== "cancelled" && (
                            <button
                              type="button"
                              disabled={updatingId === b.id}
                              onClick={() => markBalanceReceived(b.id)}
                              className="px-3 py-1.5 rounded-lg border border-green-200 text-green-700 text-caption fw-semibold hover:bg-green-50 disabled:opacity-50"
                            >
                              Mark received
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="font-mono text-caption text-neutral-700">
                          {formatInvoiceNo(b.id)}
                        </span>
                        <Link
                          to={invoicePath(b.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View invoice for booking #${b.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 text-caption fw-medium text-neutral-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {b.payment_status == "paid" && (
                          <>
                            {b.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingId === b.id}
                                  onClick={() => updateStatus(b.id, "confirmed")}
                                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-caption fw-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  Confirm
                                </button>

                                <button
                                  type="button"
                                  disabled={updatingId === b.id}
                                  onClick={() => updateStatus(b.id, "cancelled")}
                                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-caption fw-semibold hover:bg-red-50 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {b.status === "confirmed" && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingId === b.id}
                                  onClick={() => updateStatus(b.id, "pending")}
                                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-caption fw-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  Pending
                                </button>

                                <button
                                  type="button"
                                  disabled={updatingId === b.id}
                                  onClick={() => updateStatus(b.id, "cancelled")}
                                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-caption fw-semibold hover:bg-red-50 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {b.status === "cancelled" && (
                              <>
                                <button
                                  type="button"
                                  disabled={updatingId === b.id}
                                  onClick={() => updateStatus(b.id, "pending")}
                                  className="px-3 py-1.5 rounded-lg bg-amber-100 text-caption fw-semibold hover:text-amber-800 disabled:opacity-50"
                                >
                                  Pending
                                </button>

                                <button
                                  type="button"
                                  disabled={updatingId === b.id}
                                  onClick={() => updateStatus(b.id, "confirmed")}
                                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-caption fw-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && bookings.length > 0 && (
          <div className="px-5 pb-5">
            <AdminPagination
              pagination={pagination}
              onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
