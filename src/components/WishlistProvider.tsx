import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

/** Keeps the wishlist store in sync with the signed-in user. Renders nothing. */
export function WishlistProvider() {
  const isLoggedIn = useAuth((s) => s.isLoggedIn);
  const userId = useAuth((s) => s.user?.id);
  const load = useWishlist((s) => s.load);
  const reset = useWishlist((s) => s.reset);

  useEffect(() => {
    if (isLoggedIn) load();
    else reset();
  }, [isLoggedIn, userId, load, reset]);

  return null;
}
