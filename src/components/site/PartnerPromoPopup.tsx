import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePartnerPromo } from "@/hooks/usePartnerPromo";
import { ROUTES } from "@/lib/routes";
import { homeText, layoutText, partnerPromoText } from "@/lib/text";
import partnerImage from "@/assets/grow_travel.jpeg";

const { headingLine1, headingLine2, description, imageAlt } = homeText.evolved;

/** Delayed, frequency-capped invitation for travel businesses to join as partners. */
export function PartnerPromoPopup() {
  const { open, dismiss, accept } = usePartnerPromo();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl [&>button]:rounded-full [&>button]:bg-background/90 [&>button]:p-1.5 [&>button]:opacity-100">
        <img src={partnerImage} alt={imageAlt} className="h-36 w-full object-cover sm:h-44" loading="lazy" />
        <div className="space-y-4 bg-background p-5 sm:p-6">
          <div className="space-y-2">
            <DialogTitle className="leading-snug">{`${headingLine1} ${headingLine2}`}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={dismiss}>
              {partnerPromoText.laterLabel}
            </Button>
            <Link
              to={ROUTES.PARTNER}
              onClick={accept}
              className="partner-cta inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-body-sm fw-semibold"
            >
              <Handshake className="h-4 w-4" aria-hidden="true" />
              {layoutText.header.becomePartner}
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
