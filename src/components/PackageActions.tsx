import { ShareButton } from "@/components/ShareButton";
import { WishlistButton } from "@/components/WishlistButton";
import { cn } from "@/lib/utils";

interface PackageActionsProps {
  packageId: number;
  /** Used for the shared link; falls back to the id when missing. */
  slug?: string | null;
  title: string;
  size?: "sm" | "md";
  className?: string;
}

/** Wishlist + share buttons, meant to sit on top of a package card image. */
export function PackageActions({ packageId, slug, title, size = "md", className }: PackageActionsProps) {
  return (
    <div className={cn("absolute top-2 right-2 flex items-center gap-1.5", className)}>
      <WishlistButton packageId={packageId} size={size} />
      <ShareButton packageSlugOrId={slug || packageId} title={title} size={size} />
    </div>
  );
}
