import { create } from "zustand";
import { toast } from "sonner";
import { GET, POST, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";

interface WishlistState {
  ids: number[];
  isLoaded: boolean;
  isWishlisted: (packageId: number) => boolean;
  load: () => Promise<void>;
  reset: () => void;
  toggle: (packageId: number) => Promise<void>;
}

const errorMessage = (err: unknown, fallback: string) =>
  err && typeof err === "object" && "message" in err
    ? String((err as { message: string }).message)
    : fallback;

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: [],
  isLoaded: false,

  isWishlisted: (packageId) => get().ids.includes(packageId),

  load: async () => {
    try {
      const ids = await GET<number[]>(API.WISHLIST.GET_IDS);
      set({ ids, isLoaded: true });
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  },

  reset: () => set({ ids: [], isLoaded: false }),

  toggle: async (packageId) => {
    const wasWishlisted = get().isWishlisted(packageId);
    const previousIds = get().ids;

    // Optimistic update, rolled back if the request fails
    set({
      ids: wasWishlisted
        ? previousIds.filter((id) => id !== packageId)
        : [packageId, ...previousIds],
    });

    try {
      if (wasWishlisted) await DELETE(API.WISHLIST.REMOVE(packageId));
      else await POST(API.WISHLIST.ADD(packageId));
      toast.success(wasWishlisted ? "Removed from wishlist" : "Saved to wishlist");
    } catch (err) {
      set({ ids: previousIds });
      toast.error(errorMessage(err, "Could not update wishlist"));
    }
  },
}));
