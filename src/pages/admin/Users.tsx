import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Trash2, Users } from "lucide-react";
import { GET, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { PaginatedResponse, UserInterface } from "@/lib/interface";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { NativeSelect } from "@/components/NativeSelect";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "user", label: "User" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
];

const roleStyle: Record<string, string> = {
  admin: "bg-purple-50 text-purple-700",
  agent: "bg-blue-50 text-blue-700",
  user: "bg-neutral-100 text-neutral-700",
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await GET<PaginatedResponse<UserInterface>>(API.USER.GET_MANAGE, {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { q: search }),
        ...(roleFilter && { role: roleFilter }),
      });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load users";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applySearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    setSearch(searchInput.trim());
  };

  const handleDelete = async (user: UserInterface) => {
    if (user.role === "admin") return;

    const details =
      user.role === "agent"
        ? `Delete "${user.name}"? This will permanently remove their account, agent profile, packages, and bookings.`
        : `Delete "${user.name}"? This will permanently remove their account and all related data.`;

    if (!window.confirm(details)) return;

    setDeletingId(user.id);
    try {
      await DELETE(API.USER.DELETE(user.id));
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to delete user";
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (user: UserInterface) =>
    user.role !== "admin" && user.id !== currentUser?.id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="fw-bold flex items-center gap-3">
          {/* <Users className="icon-heading text-blue-600" /> */}
          Users
        </h2>
        <p className="text-body-sm text-neutral-500">Browse and search registered users.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-200 text-body-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <NativeSelect
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
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

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No users found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm min-w-[760px]">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                    <th className="py-3 px-5 fw-medium">User</th>
                    <th className="py-3 px-5 fw-medium">Email</th>
                    <th className="py-3 px-5 fw-medium">Phone</th>
                    <th className="py-3 px-5 fw-medium">Role</th>
                    <th className="py-3 px-5 fw-medium">Joined</th>
                    <th className="py-3 px-5 fw-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={profileUrl(user.profile)}
                            alt={user.name}
                            className="h-9 w-9 rounded-full object-cover bg-neutral-100"
                          />
                          <span className="fw-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-neutral-600">{user.email}</td>
                      <td className="py-4 px-5 text-neutral-600">{user.phone || "—"}</td>
                      <td className="py-4 px-5">
                        <span
                          className={`text-caption fw-semibold px-2 py-1 rounded-full capitalize ${
 roleStyle[user.role] || roleStyle.user
 }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-neutral-500 text-caption whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString("en-IN", {
                          day:"numeric",
                          month: "short",
                          year:"numeric",
                        })}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {canDelete(user) ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={deletingId === user.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-body-sm fw-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        ) : (
                          <span className="text-caption text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-5">
              <AdminPagination
                pagination={pagination}
                onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
