import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  MapPin,
  Package,
  Search,
  ExternalLink,
  Trash2,
  UserCheck,
} from "lucide-react";
import { GET, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl } from "@/lib/utils";
import type { AgentInterface, PackageInterface, PaginatedResponse } from "@/lib/interface";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { packagePath } from "@/lib/routes";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop";

type AgentGroup = {
  agentId: number;
  agentName: string;
  companyName: string;
  packages: PackageInterface[];
};

export default function AdminPackages() {
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [agents, setAgents] = useState<AgentInterface[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const result = await GET<PaginatedResponse<AgentInterface>>(API.AGENT.GET_MANAGE, {
        page: 1,
        limit: 100,
      });
      setAgents(result.data);
    } catch {
      setAgents([]);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await GET<PaginatedResponse<PackageInterface>>(API.PACKAGE.GET_MANAGE, {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { q: search }),
        ...(agentFilter && { agent_id: agentFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      setPackages(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load packages";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, agentFilter, statusFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const groupedByAgent = useMemo(() => {
    const map = new Map<number, AgentGroup>();

    packages.forEach((pkg) => {
      const existing = map.get(pkg.agent_id);
      if (existing) {
        existing.packages.push(pkg);
      } else {
        map.set(pkg.agent_id, {
          agentId: pkg.agent_id,
          agentName: pkg.agent_name || "Unknown agent",
          companyName: pkg.agent_company || "—",
          packages: [pkg],
        });
      }
    });

    return Array.from(map.values());
  }, [packages]);

  const applySearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    setSearch(searchInput.trim());
  };

  const handleDelete = async (pkg: PackageInterface) => {
    if (!window.confirm(`Delete "${pkg.package_name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(pkg.id);
    try {
      await DELETE(API.PACKAGE.DELETE(pkg.id));
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to delete package";
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="fw-bold flex items-center gap-3">
          {/* <Package className="icon-heading text-blue-600" /> */}
          All Packages
        </h2>
        <p className="text-body-sm text-neutral-500">
          Review travel packages listed by each agent.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Search package, route, or agent..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-200 text-body-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={agentFilter}
          onChange={(e) => {
            setAgentFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.company_name} ({agent.user_name})
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button
          type="button"
          onClick={applySearch}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-body-sm fw-semibold hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500">
          No packages found.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByAgent.map((group) => (
            <section
              key={group.agentId}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="fw-semibold">{group.companyName}</h2>
                    <p className="text-caption text-neutral-500">{group.agentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body-sm text-neutral-500">
                    {group.packages.length} package{group.packages.length === 1 ? "" : "s"}
                  </span>
                  <Link
                    to={`/agent/${group.agentId}`}
                    className="text-body-sm text-blue-600 fw-medium hover:underline inline-flex items-center gap-1"
                  >
                    View agent <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.packages.map((pkg) => (
                  <article
                    key={pkg.id}
                    className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-sm transition"
                  >
                    <Link to={packagePath(pkg)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={pkg.thumbnail ? profileUrl(pkg.thumbnail) : PLACEHOLDER_IMAGE}
                        alt={pkg.package_name}
                        className="w-full h-36 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-caption text-neutral-500 capitalize">
                          {pkg.package_type}
                        </span>
                        <span
                          className={`text-caption fw-semibold px-2 py-1 rounded-full ${
 pkg.status === "published"
 ? "bg-green-50 text-green-600"
 : "bg-neutral-100 text-neutral-600"
 }`}
                        >
                          {pkg.status}
                        </span>
                      </div>
                      <h3 className="fw-semibold line-clamp-1">
                        <Link
                          to={packagePath(pkg)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {pkg.package_name}
                        </Link>
                      </h3>
                      <p className="text-body-sm text-neutral-600 mt-1 flex items-center gap-1">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">
                          {pkg.from_location} → {pkg.to_location}
                        </span>
                      </p>
                      <p className="text-caption text-neutral-500 mt-1">
                        {pkg.days} days · {pkg.nights} nights
                        {pkg.price != null && pkg.price > 0
                          ? ` · ₹${Number(pkg.price).toLocaleString("en-IN")}`
                          : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg)}
                        disabled={deletingId === pkg.id}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-caption fw-semibold hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === pkg.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-white border border-neutral-200 rounded-2xl px-5 pb-5">
            <AdminPagination
              pagination={pagination}
              onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
