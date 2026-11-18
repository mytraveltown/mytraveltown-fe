import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Banknote,
  Calendar as CalendarIcon,
  Clock,
  Package as PackageIcon,
  Users,
  UserCheck,
  Boxes,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { useAuth } from "@/hooks/useAuth";
import { profileUrl } from "@/lib/utils";
import { getAmountReceived } from "@/lib/pricing";
import type {
  BookingInterface,
  PackageInterface,
  PaginatedResponse,
} from "@/lib/interface";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=80&h=80&fit=crop";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const statusBadge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

type AdminTotals = { users: number; agents: number; packages: number };

function StatCard({
  icon,
  value,
  label,
  tint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col items-center justify-center text-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${tint}`}>
        {icon}
      </div>
      <p className="text-title fw-bold">{value}</p>
      <p className="text-caption fw-semibold text-neutral-500 tracking-wider mt-1 uppercase">
        {label}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [myPackages, setMyPackages] = useState<PackageInterface[]>([]);
  const [adminTotals, setAdminTotals] = useState<AdminTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const bookingData = await GET<BookingInterface[]>(API.BOOKING.GET_MANAGE);
        if (cancelled) return;
        setBookings(Array.isArray(bookingData) ? bookingData : []);

        if (isAdmin) {
          const [usersRes, agentsRes, packagesRes] = await Promise.all([
            GET<PaginatedResponse<unknown>>(API.USER.GET_MANAGE, { limit: 1 }),
            GET<PaginatedResponse<unknown>>(API.AGENT.GET_MANAGE, { limit: 1 }),
            GET<PaginatedResponse<unknown>>(API.PACKAGE.GET_MANAGE, { limit: 1 }),
          ]);
          if (cancelled) return;
          setAdminTotals({
            users: usersRes.pagination?.total ?? 0,
            agents: agentsRes.pagination?.total ?? 0,
            packages: packagesRes.pagination?.total ?? 0,
          });
        } else {
          const pkgs = await GET<PackageInterface[]>(API.PACKAGE.GET_MINE);
          if (cancelled) return;
          setMyPackages(Array.isArray(pkgs) ? pkgs : []);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to load dashboard data";
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const pending = bookings.filter((b) => b.status === "pending");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    // Count only money actually received; platform revenue excludes balances paid to the agent.
    const earnings = confirmed.reduce(
      (sum, b) => sum + getAmountReceived(b, { platformOnly: isAdmin }),
      0
    );
    return {
      earnings,
      total: bookings.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
    };
  }, [bookings, isAdmin]);

  const recentBookings = useMemo(() => bookings.slice(0, 6), [bookings]);
  const publishedCount = useMemo(
    () => myPackages.filter((p) => p.status === "published").length,
    [myPackages]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="fw-bold">
          {`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        </h2>
        <p className="text-body-sm text-neutral-500">
          {isAdmin
            ? "Platform overview across all agents and bookings."
            : "Here's how your travel business is performing."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/10 rounded-full" />
          <Banknote className="absolute top-5 right-5 opacity-30" size={36} />
          <p className="text-body-sm opacity-90">
            {isAdmin ? "Platform Revenue" : "Total Earnings"}
          </p>
          <p className="text-headline fw-bold mt-2">{formatINR(stats.earnings)}</p>
          <span className="inline-block mt-4 bg-white/20 text-caption px-3 py-1 rounded-full">
            From {stats.confirmed} confirmed booking{stats.confirmed === 1 ? "" : "s"}
          </span>
        </div>

        <StatCard
          icon={<CalendarIcon className="text-blue-500" size={24} />}
          value={String(stats.total)}
          label="Total Bookings"
          tint="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="text-amber-500" size={24} />}
          value={String(stats.pending)}
          label="Pending Bookings"
          tint="bg-amber-50"
        />
        {isAdmin ? (
          <StatCard
            icon={<UserCheck className="text-purple-500" size={24} />}
            value={String(adminTotals?.agents ?? 0)}
            label="Total Agents"
            tint="bg-purple-50"
          />
        ) : (
          <StatCard
            icon={<PackageIcon className="text-emerald-500" size={24} />}
            value={String(publishedCount)}
            label="Active Packages"
            tint="bg-emerald-50"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent bookings */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="fw-semibold">Recent Bookings</h2>
              <Link
                to="/admin/bookings"
                className="text-blue-600 text-body-sm fw-medium hover:underline"
              >
                View All
              </Link>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-body-sm text-neutral-500 py-8 text-center">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-body-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left text-neutral-500 border-b border-neutral-200">
                      <th className="py-3 px-4 sm:px-0 fw-medium">Package</th>
                      <th className="py-3 fw-medium">Customer</th>
                      <th className="py-3 fw-medium">Travel Date</th>
                      <th className="py-3 fw-medium">Amount</th>
                      <th className="py-3 fw-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-b border-neutral-100 last:border-0">
                        <td className="py-4 px-4 sm:px-0 fw-medium">
                          {b.package_name || `Package #${b.package_id}`}
                          {isAdmin && b.agent_company && (
                            <span className="block text-caption text-neutral-400 fw-regular">
                              {b.agent_company}
                            </span>
                          )}
                        </td>
                        <td className="text-neutral-600">{b.name}</td>
                        <td className="text-neutral-600">
                          {b.travel_date
                            ? new Date(b.travel_date).toLocaleDateString("en-IN", {
                                day:"numeric",
                                month: "short",
                                year:"numeric",
                              })
                            : "—"}
                        </td>
                        <td className="fw-semibold">
                          {b.amount != null ? formatINR(Number(b.amount)) : "—"}
                          {b.payment_status === "paid" &&
                            getAmountReceived(b) < Number(b.amount) && (
                              <span className="block text-caption text-neutral-400 fw-regular">
                                Paid {formatINR(getAmountReceived(b))}
                              </span>
                            )}
                        </td>
                        <td>
                          <span
                            className={`text-caption fw-semibold px-2 py-1 rounded-full capitalize ${
 statusBadge[b.status] || statusBadge.pending
 }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Agent packages */}
          {!isAdmin && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="fw-semibold">My Packages</h2>
                <Link
                  to="/admin/mypackages"
                  className="text-blue-600 text-body-sm fw-medium hover:underline"
                >
                  View All
                </Link>
              </div>
              {myPackages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-body-sm text-neutral-500 mb-3">
                    You haven't created any packages yet.
                  </p>
                  <Link
                    to="/admin/add-listing"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-body-sm fw-semibold px-4 py-2 rounded-lg"
                  >
                    Add your first package
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-body-sm min-w-[500px]">
                    <thead>
                      <tr className="text-left text-neutral-500 border-b border-neutral-200">
                        <th className="py-3 px-4 sm:px-0 fw-medium">Package</th>
                        <th className="py-3 fw-medium">Type</th>
                        <th className="py-3 fw-medium">Status</th>
                        <th className="py-3 fw-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPackages.slice(0, 5).map((p) => (
                        <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                          <td className="py-4 px-4 sm:px-0">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.thumbnail ? profileUrl(p.thumbnail) : PLACEHOLDER_IMAGE}
                                className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                                alt=""
                              />
                              <span className="fw-medium">{p.package_name}</span>
                            </div>
                          </td>
                          <td className="text-neutral-600 capitalize">{p.package_type}</td>
                          <td>
                            <span
                              className={`text-caption fw-semibold px-2 py-1 rounded-full capitalize ${
 p.status === "published"
 ? "bg-green-50 text-green-700"
 : "bg-neutral-100 text-neutral-600"
 }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="fw-semibold">
                            {p.price != null && p.price > 0 ? formatINR(Number(p.price)) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Booking status breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="fw-semibold mb-4">Booking Status</h2>
            <div className="space-y-4">
              <StatusRow
                icon={<CheckCircle2 className="text-green-600" size={18} />}
                label="Confirmed"
                value={stats.confirmed}
                total={stats.total}
                bar="bg-green-500"
              />
              <StatusRow
                icon={<Clock className="text-amber-500" size={18} />}
                label="Pending"
                value={stats.pending}
                total={stats.total}
                bar="bg-amber-500"
              />
              <StatusRow
                icon={<XCircle className="text-red-500" size={18} />}
                label="Cancelled"
                value={stats.cancelled}
                total={stats.total}
                bar="bg-red-500"
              />
            </div>
          </div>

          {/* Role-specific overview */}
          {isAdmin ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="fw-semibold mb-4">Platform Overview</h2>
              <div className="space-y-3">
                <OverviewRow
                  to="/admin/users"
                  icon={<Users className="text-blue-600" size={18} />}
                  label="Total Users"
                  value={adminTotals?.users ?? 0}
                />
                <OverviewRow
                  to="/admin/agents"
                  icon={<UserCheck className="text-purple-600" size={18} />}
                  label="Total Agents"
                  value={adminTotals?.agents ?? 0}
                />
                <OverviewRow
                  to="/admin/packages"
                  icon={<Boxes className="text-emerald-600" size={18} />}
                  label="Total Packages"
                  value={adminTotals?.packages ?? 0}
                />
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="fw-semibold text-neutral-900 mb-2">Grow your business</h2>
              <p className="text-body-sm text-neutral-600 mb-4">
                You have {publishedCount} active package{publishedCount === 1 ? "" : "s"} and{" "}
                {stats.pending} pending booking{stats.pending === 1 ? "" : "s"} to review.
              </p>
              <Link
                to="/admin/add-listing"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white fw-semibold text-body-sm px-5 py-2.5 rounded-lg transition"
              >
                Add New Package
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  total,
  bar,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  bar: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-body-sm mb-1.5">
        <span className="flex items-center gap-2 text-neutral-700">
          {icon}
          {label}
        </span>
        <span className="fw-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function OverviewRow({
  to,
  icon,
  label,
  value,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition"
    >
      <span className="flex items-center gap-3 text-body-sm fw-medium text-neutral-700">
        {icon}
        {label}
      </span>
      <span className="text-body-lg fw-bold">{value}</span>
    </Link>
  );
}
