import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { layoutText } from "@/lib/text";

interface PartnerCtaProps {
  /** "pill" for the desktop navbar, "block" for the full-width mobile menu button. */
  variant?: "pill" | "block";
  onClick?: () => void;
}

const VARIANT_CLASSES: Record<NonNullable<PartnerCtaProps["variant"]>, string> = {
  // h-9 is the shared height for every pill in the header (login, partner, profile).
  pill: "rounded-full px-4 h-9 border text-body-sm",
  block: "w-full justify-center rounded-xl py-3 border text-body-sm",
};

export function PartnerCta({ variant = "pill", onClick }: PartnerCtaProps) {
  return (
    <Link
      to={ROUTES.PARTNER}
      onClick={onClick}
      className={`partner-cta inline-flex items-center gap-2 fw-semibold whitespace-nowrap ${VARIANT_CLASSES[variant]}`}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/80 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      <Handshake className="h-4 w-4 shrink-0" aria-hidden="true" />
      {layoutText.header.becomePartner}
    </Link>
  );
}
