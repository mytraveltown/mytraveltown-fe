import { useState } from "react";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDeleteDialog } from "@/components/reviews/ConfirmDeleteDialog";
import { useAuth } from "@/hooks/useAuth";
import { DELETE, POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { REVIEW_LIMITS, formatReviewDate, getErrorMessage } from "@/lib/reviews";
import { profileUrl } from "@/lib/utils";
import type { ReviewReplyInterface } from "@/lib/interface";
import { packageText } from "@/lib/text";

const text = packageText.reviews.replies;

interface ReviewRepliesProps {
  reviewId: number;
  initialReplies: ReviewReplyInterface[];
  /** Admin or the package's travel partner; everyone else only reads the thread. */
  canReply: boolean;
}

/** Reply thread under a review: admins and the package's agent can reply, authors and admins can delete. */
export function ReviewReplies({ reviewId, initialReplies, canReply }: ReviewRepliesProps) {
  const user = useAuth((s) => s.user);
  const [replies, setReplies] = useState(initialReplies);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReviewReplyInterface | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === "admin";
  const canDelete = (reply: ReviewReplyInterface) =>
    isAdmin || (reply.user_id !== null && reply.user_id === user?.id);

  const closeForm = () => {
    setIsFormOpen(false);
    setComment("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = comment.trim();
    if (trimmedComment.length < REVIEW_LIMITS.minReplyLength) {
      return setError(text.tooShort(REVIEW_LIMITS.minReplyLength));
    }

    setError("");
    setIsSubmitting(true);
    try {
      const res = await POST<{ reply: ReviewReplyInterface }>(API.REVIEW.REPLY(reviewId), {
        comment: trimmedComment,
      });
      setReplies((current) => [...current, res.reply]);
      toast.success(text.posted);
      closeForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err, text.postFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await DELETE(API.REVIEW.DELETE_REPLY(deleteTarget.id));
      setReplies((current) => current.filter((reply) => reply.id !== deleteTarget.id));
      toast.success(text.deleted);
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, text.deleteFailed));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4">
      {replies.length > 0 && (
        <ul className="space-y-3 border-l-2 border-border pl-4">
          {replies.map((reply) => (
            <li key={reply.id} className="flex items-start gap-3">
              <Avatar className="size-8">
                <AvatarImage src={profileUrl(reply.user_profile ?? "")} alt={reply.user_name} />
                <AvatarFallback>{reply.user_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 rounded-xl bg-secondary px-3 py-2">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="text-body-sm fw-semibold">{reply.user_name}</span>
                  <span className="text-caption text-muted-foreground">{formatReviewDate(reply.created_at)}</span>
                  {canDelete(reply) && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(reply)}
                      aria-label={text.deleteAria}
                      className="ml-auto text-muted-foreground hover:text-red-600 transition"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-body-sm text-foreground/90 whitespace-pre-line break-words">
                  {reply.comment}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!canReply ? null : isFormOpen ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border p-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={REVIEW_LIMITS.maxReplyLength}
            rows={2}
            placeholder={text.placeholder}
            aria-label={text.placeholder}
            autoFocus
            className="w-full rounded-lg border bg-background px-3 py-2 text-body-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
          />
          {error && (
            <p className="text-caption text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-body-sm fw-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {text.submit}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border text-body-sm fw-semibold hover:bg-secondary transition"
            >
              {packageText.reviews.cancel}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-body-sm fw-medium text-primary hover:underline"
        >
          <MessageCircle className="size-4" />
          {text.reply}
        </button>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title={text.deleteConfirmTitle}
        description={text.deleteConfirmDescription}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
