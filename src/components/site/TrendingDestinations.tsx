import { Link } from "react-router-dom";
import { ArrowUpRight, Flame, MapPin } from "lucide-react";
import { homeText } from "@/lib/text";

import bali from "@/assets/f_bali.jpg";
import thailand from "@/assets/f_thailand.jpg";
import usa from "@/assets/f_usa.jpeg";
import vietnam from "@/assets/f_vietnam.jpg";
import india from "@/assets/f_india.jpg";

// Mobile (2-col): 1 full, 1 full, then 2 side-by-side, then 1 full
// Desktop (6-col / 2-row): India | Vietnam | UAE+Thailand / Bali
const LAYOUT_CLASSES = [
  "col-span-2 h-[220px] sm:h-[260px] lg:col-span-2 lg:row-span-2 lg:h-auto",
  "col-span-2 h-[220px] sm:h-[260px] lg:col-span-2 lg:row-span-2 lg:h-auto",
  "col-span-1 h-[180px] sm:h-[200px] lg:col-span-1 lg:row-span-1 lg:h-auto",
  "col-span-1 h-[180px] sm:h-[200px] lg:col-span-1 lg:row-span-1 lg:h-auto",
  "col-span-2 h-[180px] sm:h-[200px] lg:col-span-2 lg:row-span-1 lg:h-auto",
];

const DESTINATION_IMAGES: Record<string, string> = {
  india,
  vietnam,
  uae: usa, // swap in a UAE image when available
  thailand,
  bali,
};

const copy = homeText.trendingDestinations;

export function TrendingDestinations() {
  return (
    <section
      id="destinations"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-muted/40 via-background to-primary/5 p-4 sm:p-5 md:p-6 shadow-[var(--shadow-soft)]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mb-4 flex flex-col gap-4 px-1 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 text-caption fw-semibold uppercase tracking-widest text-primary">
              <Flame className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </span>

            <h2>{copy.title}</h2>

            <p className="mt-1.5 max-w-lg text-body-sm text-muted-foreground">{copy.subtitle}</p>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:h-[400px] lg:grid-cols-6 lg:grid-rows-2">
          {copy.destinations.map((item, index) => (
            <Link
              key={item.key}
              to={`/search?to=${encodeURIComponent(item.search)}`}
              className={`group relative min-h-0 w-full overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:shadow-xl sm:rounded-3xl ${LAYOUT_CLASSES[index]}`}
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              <img
                src={DESTINATION_IMAGES[item.key]}
                alt={item.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 transition-colors duration-500 group-hover:from-black/90" />

              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 sm:rounded-3xl" />

              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-caption fw-semibold uppercase tracking-wider text-foreground/90 sm:left-4 sm:top-4">
                <MapPin className="h-3 w-3 text-primary" />
                {item.region}
              </span>

              <span className="absolute right-3 top-3 flex h-8 w-8 scale-75 items-center justify-center rounded-full border border-white/20 bg-white/15 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:right-4 sm:top-4 sm:h-9 sm:w-9">
                <ArrowUpRight className="h-4 w-4 text-white" />
              </span>

              <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:p-4 md:p-5">
                <p className="line-clamp-1 text-caption fw-semibold uppercase tracking-widest text-white/65">
                  {item.tag}
                </p>

                <h3 className="mt-0.5">
                  {item.title}
                </h3>

                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-caption fw-medium text-white/75 backdrop-blur-sm">
                    {item.info}
                  </span>

                  <div className="h-0.5 max-w-16 flex-1 origin-left scale-x-0 bg-gradient-to-r from-amber-300 to-rose-300 transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}