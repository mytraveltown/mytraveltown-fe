import { Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { stopCardNavigation } from "@/lib/share";
import { packageText } from "@/lib/text";

interface WishlistButtonProps {
  packageId: number;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ packageId, className, size = "md" }: WishlistButtonProps) {
  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const wishlisted = useWishlist((s) => s.ids.includes(packageId));
  const toggle = useWishlist((s) => s.toggle);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    stopCardNavigation(e);
    if (!isLoggedIn) {
      toast.info(packageText.wishlist.loginRequired);
      navigate("/login", { state: { from: location } });
      return;
    }
    toggle(packageId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? packageText.wishlist.remove : packageText.wishlist.add}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-110",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        className
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          wishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
        )}
      />
    </button>
  );
}
