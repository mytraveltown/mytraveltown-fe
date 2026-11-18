import phones from "@/assets/phones-mockup.png";
import { heroText } from "@/lib/text";
import {
  Apple,
  Play,
  Compass,
  Wallet,
  CalendarCheck,
} from "lucide-react";
const t = heroText.appSection;

const FEATURE_ICONS = [Compass, Wallet, CalendarCheck] as const;

export function AppSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-primary to-primary text-primary-foreground shadow-[var(--shadow-card)]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-6 items-center p-8 md:p-12 lg:p-16">
          {/* Text content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h2 className="font-display mt-5">
              {t.title}
            </h2>

            <p className="mt-4 text-primary-foreground/80 max-w-md mx-auto lg:mx-0">
              {t.description}
            </p>

            <ul className="mt-6 space-y-3 inline-block text-left">
              {t.features.map((text, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-body-sm text-primary-foreground/90">{text}</span>
                </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-5 py-3 text-body-sm fw-semibold ring-1 ring-white/20 cursor-default">
                <Apple className="h-6 w-6" />
                <span className="flex flex-col leading-tight text-left">
                  <span className="text-caption fw-regular opacity-80">
                    {t.appStore.label}
                  </span>
                  {t.appStore.name}
                </span>
              </span>
              <span className="inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-5 py-3 text-body-sm fw-semibold ring-1 ring-white/20 cursor-default">
                <Play className="h-6 w-6" />
                <span className="flex flex-col leading-tight text-left">
                  <span className="text-caption fw-regular opacity-80">
                    {t.googlePlay.label}
                  </span>
                  {t.googlePlay.name}
                </span>
              </span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 -z-10 mx-auto h-full w-[70%] translate-y-6 rounded-[3rem] bg-white/10 blur-2xl" />
              <img
                src={phones}
                alt={t.phonesAlt}
                loading="lazy"
                className="w-full max-w-sm lg:max-w-md h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
