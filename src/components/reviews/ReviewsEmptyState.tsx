import { StarRating } from "@/components/reviews/StarRating";
import { packageText } from "@/lib/text";

const text = packageText.reviews.emptyState;

interface ReviewsEmptyStateProps {
  /** The viewer is the package's travel partner (or an admin) and will be able to reply. */
  isOwner: boolean;
}

/**
 * Replaces the whole summary + list layout when a package has no reviews,
 * using the same surface as the rating summary card so the section stays consistent.
 */
export function ReviewsEmptyState({ isOwner }: ReviewsEmptyStateProps) {
  return (
    <div className="mt-6 rounded-2xl bg-secondary px-6 py-10 text-center md:py-12">
      <StarRating value={0} size="lg" className="justify-center" />
      <p className="mt-4 text-body-lg fw-semibold">{text.title}</p>
      <p className="mx-auto mt-2 max-w-xl text-body-sm text-muted-foreground">
        {isOwner ? text.ownerDescription : text.travellerDescription}
      </p>
    </div>
  );
}
