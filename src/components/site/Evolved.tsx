import grow from "@/assets/grow_travel.jpeg";
import { Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { homeText } from "@/lib/text";
import { ROUTES } from "@/lib/routes";

export function Evolved() {
  const copy = homeText.evolved;

  return (
    <section id="evolved" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="mt-4">
            {copy.headingLine1}
            <span className="block bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">
              {copy.headingLine2}
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">{copy.description}</p>
          <div className="mt-6">
            <Link
              to={ROUTES.PARTNER}
              className="inline-flex px-5 py-2.5 rounded-xl bg-[var(--cta)] text-white fw-semibold text-body-sm hover:opacity-90 transition"
            >
              {copy.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="relative h-[420px] flex items-center justify-center">
          <div className="absolute top-8 left-6 md:left-12 z-10 bg-card border border-border rounded-2xl px-4 py-2.5 shadow-[var(--shadow-card)] flex items-center gap-2 text-body-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="fw-medium">{copy.locationBadge}</span>
          </div>

          <img
            src={grow}
            alt={copy.imageAlt}
            loading="lazy"
            className="relative z-0 h-full w-full object-cover rounded-3xl"
          />

          <div className="absolute bottom-8 right-6 md:right-10 z-10 bg-foreground text-background rounded-2xl px-4 py-3 max-w-[260px] shadow-[var(--shadow-card)]">
            <Quote className="h-3.5 w-3.5 mb-1 opacity-60" />
            <p className="text-caption">{copy.quote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
