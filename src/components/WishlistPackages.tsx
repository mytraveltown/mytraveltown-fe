import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { useWishlist } from "@/hooks/useWishlist";
import { PackageCard } from "@/components/PackageCard";
import type { PackageInterface } from "@/lib/interface";
import { packageCardText } from "@/lib/text";

/** Grid of the signed-in user's saved packages. */
export function WishlistPackages() {
  const [packages, setPackages] = useState<PackageInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const wishlistIds = useWishlist((s) => s.ids);

  useEffect(() => {
    let cancelled = false;
    GET<PackageInterface[]>(API.WISHLIST.GET_ALL)
      .then((data) => !cancelled && setPackages(data))
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : packageCardText.wishlist.loadFailed
        );
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Packages un-hearted here disappear immediately
  const visible = packages.filter((pkg) => wishlistIds.includes(pkg.id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm">{error}</div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-12 h-12 mx-auto text-slate-300" />
        <h3 className="mt-3 text-body fw-semibold text-slate-900">{packageCardText.wishlist.emptyTitle}</h3>
        <p className="text-body-sm text-slate-500 mt-1 mb-4">{packageCardText.wishlist.emptyDescription}</p>
        <Link to="/search" className="text-body-sm text-blue-600 fw-medium hover:underline">
          {packageCardText.wishlist.explore}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {visible.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}
