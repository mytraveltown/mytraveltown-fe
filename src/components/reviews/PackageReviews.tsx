import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/reviews/ConfirmDeleteDialog";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewsEmptyState } from "@/components/reviews/ReviewsEmptyState";
import { StarRating } from "@/components/reviews/StarRating";
import { useAuth } from "@/hooks/useAuth";
import { DELETE, GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/reviews";
import type { PackageReviewsResponse, ReviewInterface } from "@/lib/interface";
import { packageText } from "@/lib/text";

const text = packageText.reviews;
const PAGE_SIZE = 5;
const STAR_VALUES = [5, 4, 3, 2, 1] as const;

interface PackageReviewsProps {
  packageId: number;
  /** Review to scroll to, highlight and open the reply box on (e.g. from the partner's notification bell). */
  focusReviewId?: number | null;
}

export function PackageReviews({ packageId, focusReviewId = null }: PackageReviewsProps) {
  const user = useAuth((s) => s.user);
  // The focused review may sit beyond the first page, so it is fetched on its own and pinned on top.
  const [pinnedReview, setPinnedReview] = useState<ReviewInterface | null>(null);
  const scrolledToRef = useRef<number | null>(null);
  const [data, setData] = useState<PackageReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ReviewInterface | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Remounts the form after a submit so it starts empty.
  const [formKey, setFormKey] = useState(0);

  const fetchPage = useCallback(
    (page: number) =>
      GET<PackageReviewsResponse>(API.REVIEW.GET_BY_PACKAGE(packageId), { page, limit: PAGE_SIZE }),
    [packageId],
  );

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setData(await fetchPage(1));
    } catch (err: unknown) {
      setError(getErrorMessage(err, text.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  useEffect(() => {
    if (!data || !focusReviewId) {
      setPinnedReview(null);
      return;
    }
    const isLoaded = data.my_review?.id === focusReviewId || data.reviews.some((r) => r.id === focusReviewId);
    if (isLoaded) {
      setPinnedReview(null);
      return;
    }
    let cancelled = false;
    GET<{ review: ReviewInterface }>(API.REVIEW.GET_BY_ID(focusReviewId))
      .then((res) => {
        if (!cancelled && res.review.package_id === packageId) setPinnedReview(res.review);
      })
      .catch((err: unknown) => {
        // A deleted review simply is not highlighted; the rest of the list still shows.
        console.warn("Focused review could not be loaded", err);
      });
    return () => {
      cancelled = true;
    };
  }, [data, focusReviewId, packageId]);

  // Scroll once per focused review, after it has rendered.
  useEffect(() => {
    if (!focusReviewId || scrolledToRef.current === focusReviewId) return;
    const element = document.getElementById(`review-${focusReviewId}`);
    if (!element) return;
    scrolledToRef.current = focusReviewId;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const loadMore = async () => {
    if (!data) return;
    setIsLoadingMore(true);
    try {
      const next = await fetchPage(data.pagination.page + 1);
      setData({ ...next, reviews: [...data.reviews, ...next.reviews] });
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, text.loadFailed));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSubmitted = async () => {
    setFormKey((key) => key + 1);
    await loadFirstPage();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await DELETE(API.REVIEW.DELETE(deleteTarget.id));
      toast.success(text.deleted);
      setDeleteTarget(null);
      await loadFirstPage();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, text.deleteFailed));
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const myReview = data?.my_review ?? null;
  const listedReviews = data?.reviews.filter((r) => r.id !== myReview?.id && r.id !== pinnedReview?.id) ?? [];
  const otherReviews = pinnedReview ? [pinnedReview, ...listedReviews] : listedReviews;
  const canReview = data?.permissions.can_review ?? false;
  const canReply = data?.permissions.can_reply ?? false;
  const summary = data?.summary;
  const hasMore = data ? data.pagination.page < data.pagination.totalPages : false;
  // The review form already invites a first review, so the empty state only shows without it.
  const showEmptyState = summary?.total === 0 && !myReview && !canReview;

  return (
    <section className="mt-16" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading">{text.heading}</h2>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error || !summary ? (
        <p className="mt-6 text-body-sm text-red-600">{error || text.loadFailed}</p>
      ) : showEmptyState ? (
        <ReviewsEmptyState isOwner={canReply} />
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-secondary p-6 lg:sticky lg:top-24">
              {summary.total === 0 ? (
                <>
                  <StarRating value={0} size="lg" />
                  <p className="mt-3 text-body fw-semibold">{text.noRatingsYet}</p>
                  <p className="mt-1 text-body-sm text-muted-foreground">{text.empty}</p>
                </>
              ) : (
                <>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl fw-bold leading-none">
                      {summary.average.toFixed(1)}
                    </span>
                    <Star className="size-7 fill-amber-400 text-amber-400 mb-1" />
                  </div>
                  <StarRating value={summary.average} className="mt-3" />
                  <p className="mt-2 text-body-sm text-muted-foreground">
                    {text.basedOn(summary.total)}
                  </p>
                  <div className="mt-5 space-y-2">
                    {STAR_VALUES.map((star) => {
                      const count = summary.breakdown[star] ?? 0;
                      const percent = summary.total ? (count / summary.total) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 text-caption">
                          <span className="w-12 shrink-0 text-muted-foreground">
                            {text.starLabel(star)}
                          </span>
                          <div className="h-2 flex-1 rounded-full bg-background overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-6 shrink-0 text-right text-muted-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form + list */}
          <div className="lg:col-span-2 space-y-4">
            {myReview ? (
              <ReviewCard
                review={myReview}
                isMine
                isFocused={myReview.id === focusReviewId}
                canReply={canReply}
                onDelete={() => setDeleteTarget(myReview)}
              />
            ) : (
              canReview && (
                <ReviewForm key={formKey} packageId={packageId} onSubmitted={handleSubmitted} />
              )
            )}

            {otherReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isFocused={review.id === focusReviewId}
                canReply={canReply}
                onDelete={isAdmin ? () => setDeleteTarget(review) : undefined}
              />
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border text-body-sm fw-semibold hover:bg-secondary transition disabled:opacity-60"
              >
                {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                {text.loadMore}
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.id === myReview?.id ? text.deleteConfirmTitle : text.deleteReviewTitle}
        description={
          deleteTarget?.id === myReview?.id ? text.deleteConfirmDescription : text.deleteReviewDescription
        }
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
