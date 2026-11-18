import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { StarRating } from "@/components/reviews/StarRating";
import { cn } from "@/lib/utils";
import { POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { ReviewInterface } from "@/lib/interface";
import { packageText } from "@/lib/text";
import {
  REVIEW_LIMITS,
  REVIEW_MEDIA_ACCEPT,
  getErrorMessage,
  isVideoFile,
  validateReviewMedia,
} from "@/lib/reviews";

const text = packageText.reviews.form;

interface ReviewFormProps {
  packageId: number;
  onSubmitted: (review: ReviewInterface) => void;
  /** Pre-selected star rating, e.g. when the traveller tapped a star in the post-trip prompt. */
  initialRating?: number;
  /** Renders without the card frame and heading, for use inside a dialog. */
  embedded?: boolean;
}

export function ReviewForm({ packageId, onSubmitted, initialRating = 0, embedded = false }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const handleFilesSelected = (selected: FileList | null) => {
    if (!selected?.length) return;
    const next = [...files, ...Array.from(selected)];
    const mediaError = validateReviewMedia(next);
    if (mediaError) {
      setError(mediaError);
    } else {
      setError("");
      setFiles(next);
    }
    // Allow re-selecting the same file after removing it.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = comment.trim();
    if (!rating) return setError(text.ratingRequired);
    if (trimmed.length < REVIEW_LIMITS.minCommentLength) {
      return setError(text.commentTooShort(REVIEW_LIMITS.minCommentLength));
    }
    const mediaError = validateReviewMedia(files);
    if (mediaError) return setError(mediaError);

    const formData = new FormData();
    formData.append("rating", String(rating));
    formData.append("comment", trimmed);
    files.forEach((file) => formData.append("media", file));

    setError("");
    setIsSubmitting(true);
    try {
      // Video uploads can exceed the default 15s client timeout.
      const res = await POST<{ review: ReviewInterface }>(API.REVIEW.CREATE(packageId), formData, {
        timeout: 120000,
      });
      toast.success(text.success);
      onSubmitted(res.review);
    } catch (err: unknown) {
      setError(getErrorMessage(err, text.submitFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-5", !embedded && "rounded-2xl border bg-card p-5 md:p-6")}
    >
      {!embedded && <h3 className="text-body-lg fw-bold">{text.heading}</h3>}

      <div>
        <p className="text-caption fw-bold tracking-wider text-muted-foreground mb-2">{text.ratingLabel}</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="block text-caption fw-bold tracking-wider text-muted-foreground mb-2"
        >
          {text.commentLabel}
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={REVIEW_LIMITS.maxCommentLength}
          rows={4}
          placeholder={text.commentPlaceholder}
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-body-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
        />
        <p className="mt-1 text-right text-caption text-muted-foreground">
          {text.characterCount(comment.length, REVIEW_LIMITS.maxCommentLength)}
        </p>
      </div>

      <div>
        <p className="text-caption fw-bold tracking-wider text-muted-foreground mb-1">{text.mediaLabel}</p>
        <p className="text-caption text-muted-foreground mb-3">
          {text.mediaHint(REVIEW_LIMITS.maxMediaFiles, REVIEW_LIMITS.maxFileSizeMb)}
        </p>
        <div className="flex flex-wrap gap-3">
          {previews.map(({ file, url }, index) => (
            <div key={url} className="relative size-20 rounded-lg overflow-hidden border bg-muted">
              {isVideoFile(file) ? (
                <video src={url} className="h-full w-full object-cover" muted />
              ) : (
                <img src={url} alt={file.name} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={text.removeMedia}
                className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {files.length < REVIEW_LIMITS.maxMediaFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="size-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-caption text-muted-foreground hover:border-primary hover:text-primary transition"
            >
              <ImagePlus className="size-5" />
              {text.addMedia}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={REVIEW_MEDIA_ACCEPT}
          multiple
          hidden
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? text.submitting : text.submit}
      </button>
    </form>
  );
}
