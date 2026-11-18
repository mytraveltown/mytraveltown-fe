import { useState } from "react";
import { BadgeCheck, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ReadMore } from "@/components/ReadMore";
import { ReviewReplies } from "@/components/reviews/ReviewReplies";
import { StarRating } from "@/components/reviews/StarRating";
import { profileUrl } from "@/lib/utils";
import { formatReviewDate } from "@/lib/reviews";
import type { ReviewInterface } from "@/lib/interface";
import { packageText } from "@/lib/text";

const text = packageText.reviews;

interface ReviewCardProps {
  review: ReviewInterface;
  isMine?: boolean;
  /** Opened from a deep link: highlighted, with the reply box ready. */
  isFocused?: boolean;
  /** Whether the viewer may reply (admin or the package's travel partner). */
  canReply?: boolean;
  /** Shown only when provided (author or admin). */
  onDelete?: () => void;
}

export function ReviewCard({ review, isMine = false, isFocused = false, canReply = false, onDelete }: ReviewCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = review.media
    .filter((m) => m.media_type === "image")
    .map((m) => ({ src: profileUrl(m.file_path), alt: text.photoAlt(review.user_name) }));
  const videos = review.media.filter((m) => m.media_type === "video");

  return (
    <article
      id={`review-${review.id}`}
      className={`scroll-mt-24 rounded-2xl border p-5 ${isMine ? "bg-primary/5 border-primary/30" : "bg-card"} ${
        isFocused ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <header className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarImage src={profileUrl(review.user_profile ?? "")} alt={review.user_name} />
          <AvatarFallback>{review.user_name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body-sm fw-semibold truncate">{review.user_name}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-caption px-2 py-0.5 rounded-full bg-green-100 text-green-700 fw-medium">
                <BadgeCheck className="size-3" /> {text.verified}
              </span>
            )}
            {isMine && (
              <span className="text-caption px-2 py-0.5 rounded-full bg-primary/10 text-primary fw-medium">
                {text.yourReview}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating value={review.rating} size="sm" />
            <span className="text-caption text-muted-foreground">{formatReviewDate(review.created_at)}</span>
          </div>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 text-caption text-muted-foreground hover:text-red-600 transition"
          >
            <Trash2 className="size-3.5" /> {text.delete}
          </button>
        )}
      </header>

      <ReadMore className="mt-3 text-body-sm text-foreground/90 whitespace-pre-line">{review.comment}</ReadMore>

      {review.media.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="size-20 md:size-24 rounded-lg overflow-hidden border bg-muted"
            >
              <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover hover:scale-105 transition" />
            </button>
          ))}
          {videos.map((video) => (
            <video
              key={video.id}
              src={profileUrl(video.file_path)}
              controls
              preload="metadata"
              aria-label={text.playVideo}
              className="h-20 md:h-24 max-w-[200px] rounded-lg border bg-black"
            />
          ))}
        </div>
      )}

      <ReviewReplies
        reviewId={review.id}
        initialReplies={review.replies}
        canReply={canReply}
        defaultFormOpen={isFocused}
      />

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </article>
  );
}
