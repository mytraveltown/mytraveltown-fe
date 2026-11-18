import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MapPin, Plus, Pencil, Trash2, Package } from "lucide-react";
import { GET, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl } from "@/lib/utils";
import type { PackageInterface } from "@/lib/interface";
import { packagePath } from "@/lib/routes";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop";

export default function MyPackages() {
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await GET<PackageInterface[]>(API.PACKAGE.GET_MINE);
      setPackages(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load packages";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleDelete = async (pkg: PackageInterface) => {
    if (!window.confirm(`Delete "${pkg.package_name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(pkg.id);
    try {
      await DELETE(API.PACKAGE.DELETE(pkg.id));
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="fw-bold">My Packages</h2>
          <p className="text-body-sm text-neutral-500">All your packages in one place.</p>
        </div>
        <Link
          to="/admin/add-listing"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white fw-semibold px-4 py-2.5 rounded-lg text-body-sm cursor-pointer"
        >
          <Plus size={16} /> Add New Package
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h2 className="text-body-lg fw-semibold text-neutral-800">No packages yet</h2>
          <p className="text-body-sm text-neutral-500 mt-1 mb-5">
            Create your first travel package to start listing on the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
            >
              <Link to={packagePath(pkg)} target="_blank" rel="noopener noreferrer">
                <img
                  src={pkg.thumbnail ? profileUrl(pkg.thumbnail) : PLACEHOLDER_IMAGE}
                  alt={pkg.package_name}
                  className="w-full h-44 object-cover hover:opacity-95 transition"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-caption text-neutral-500 capitalize">
                    {pkg.package_type}
                  </span>
                  <span
                    className={`text-caption fw-semibold px-2 py-1 rounded-full shrink-0 ${
 pkg.status === "published"
 ? "bg-green-50 text-green-600"
 : "bg-neutral-100 text-neutral-600"
 }`}
                  >
                    {pkg.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <h3 className="fw-semibold line-clamp-1">
                  <Link
                    to={packagePath(pkg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition"
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
                  {pkg.flight_option === "included" ?" · Flight included" : ""}
                </p>
                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/admin/edit-listing/${pkg.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-200 hover:bg-neutral-50 text-body-sm py-2 rounded-lg cursor-pointer"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(pkg)}
                    disabled={deletingId === pkg.id}
                    className="flex items-center justify-center border border-neutral-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 text-body-sm py-2 px-3 rounded-lg cursor-pointer"
                    aria-label={`Delete ${pkg.package_name}`}
                  >
                    {deletingId === pkg.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
