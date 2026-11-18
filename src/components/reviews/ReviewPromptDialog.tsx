import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviewPrompt } from "@/hooks/useReviewPrompt";
import { packagePath } from "@/lib/routes";
import { reviewPromptText as text } from "@/lib/text";

/** Formats a YYYY-MM-DD date as "14 Nov 2026" without timezone shifts. */
function formatTripDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Post-trip review request. Step 1 is a one-tap star rating with easy outs;
 * the full review form only opens once the traveller chooses to rate.
 */
export function ReviewPromptDialog() {
  const { prompt, close, dismissForever } = useReviewPrompt();
  const [rating, setRating] = useState(0);

  // Start fresh for every trip that is prompted.
  useEffect(() => setRating(0), [prompt?.booking_id]);

  if (!prompt) return null;

  const isWriting = rating > 0;
  const packageLink = packagePath({ id: prompt.package_id, slug: prompt.package_slug });

  return (
    <Dialog open onOpenChange={(next) => !next && close()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-2xl">
        <div className="space-y-2 pr-6">
          <DialogTitle className="leading-snug">{text.title}</DialogTitle>
          <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <Link to={packageLink} onClick={close} className="hover:underline">
              {text.tripSummary(
                prompt.package_name,
                formatTripDate(prompt.travel_date),
                formatTripDate(prompt.trip_end_date),
              )}
            </Link>
          </p>
          <DialogDescription>{isWriting ? text.formDescription : text.description}</DialogDescription>
        </div>

        {isWriting ? (
          <ReviewForm packageId={prompt.package_id} initialRating={rating} embedded onSubmitted={close} />
        ) : (
          <div className="space-y-5">
            <div className="flex justify-center py-2">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={dismissForever} className="text-muted-foreground">
                {text.never}
              </Button>
              <Button variant="outline" onClick={close}>
                {text.later}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
