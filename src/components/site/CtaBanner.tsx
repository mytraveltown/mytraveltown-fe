import readyToTravel from "@/assets/ready_to_travel.jpeg";
import { Link } from "react-router-dom";
import { heroText } from "@/lib/text";

const t = heroText.ctaBanner;

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
        <img
          src={readyToTravel}
          alt={t.imageAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="relative px-8 py-16 md:px-14 md:py-24 max-w-xl">
          <h2 className="font-display text-white">
            {t.title}
          </h2>
          <p className="text-white/85 mt-3">
            {t.description}{" "}
            <span className="fw-semibold text-white">{t.price}</span>
          </p>
          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-body-sm fw-semibold text-brand shadow-sm transition hover:bg-white/90"
          >
            {t.button}
          </Link>
        </div>
      </div>
    </section>
  );
}
