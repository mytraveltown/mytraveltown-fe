import { useState } from "react"
import { useNavigate } from "react-router-dom"
import heroImg from "@/assets/hero-taj.jpg"
import { LocationAutocomplete } from "@/components/LocationAutocomplete"
import { heroText } from "@/lib/text"
import { ShieldCheck, Search, MapPin, ArrowRight, Users, GitCompare, Lock, Minus, Plus } from "lucide-react"

const t = heroText.hero

const FEATURE_STYLES = [
  { icon: ShieldCheck, color: "from-emerald-400 to-teal-500" },
  { icon: GitCompare, color: "from-sky-400 to-indigo-500" },
  { icon: Search, color: "from-amber-400 to-rose-400" },
  { icon: Lock, color: "from-fuchsia-400 to-purple-500" },
] as const

export function Hero() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [guests, setGuests] = useState(1)
  const navigate = useNavigate()

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (from.trim()) params.set("from", from.trim())
    if (to.trim()) params.set("to", to.trim())
    if (guests > 0) params.set("guests", String(guests))
    navigate(`/search?${params.toString()}`)
  }

  return (
    // Image + overlapping feature cards together fill the viewport below the sticky header (h-16 + 1px border),
    // so the next section starts right at the fold.
    <section className="relative overflow-x-hidden flex flex-col min-h-[calc(100svh-4rem-1px)]">
      <div className="relative grid w-full flex-1 min-h-[520px]">
        {/* Background layers are clipped here so the search dropdown can overflow the hero */}
        <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroImg}
          alt={t.imageAlt}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />
        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.45_0.22_258_/_0.35),_transparent_60%)]" />

        {/* Floating glow blobs */}
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-400/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-rose-500/25 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center text-white pb-14 sm:pb-20">
          <h1 className="mt-6 font-display text-display max-w-4xl animate-rise" style={{ animationDelay: "0.1s" }}>
            {t.title}
          </h1>

          {/* Search bar */}
          <form
            onSubmit={submit}
            className="relative z-30 mt-8 w-full max-w-3xl animate-rise"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex flex-col sm:flex-row items-stretch bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-2 sm:pl-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
              <div className="flex-1 flex items-center gap-3 px-3 py-2 sm:py-1 cursor-text">
                <MapPin className="h-5 w-5 text-brand shrink-0" />
                <span className="flex flex-col min-w-0 text-left">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground fw-semibold leading-none">{t.fields.from}</span>
                  <LocationAutocomplete
                    type="from"
                    related={to}
                    value={from}
                    onChange={setFrom}
                    ariaLabel={t.originAriaLabel}
                    className="bg-transparent outline-none text-body-sm text-foreground placeholder:text-muted-foreground/60 w-full leading-tight mt-0.5"
                    placeholder={t.originPlaceholder}
                  />
                </span>
              </div>
              <div className="hidden sm:block h-10 w-px bg-border my-auto" />
              <div className="flex-1 flex items-center gap-3 px-3 py-2 sm:py-1 cursor-text">
                <ArrowRight className="h-5 w-5 text-brand shrink-0" />
                <span className="flex flex-col min-w-0 text-left">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground fw-semibold leading-none">{t.fields.where}</span>
                  <LocationAutocomplete
                    type="to"
                    related={from}
                    value={to}
                    onChange={setTo}
                    ariaLabel={t.destinationAriaLabel}
                    className="bg-transparent outline-none text-body-sm text-foreground placeholder:text-muted-foreground/60 w-full leading-tight mt-0.5"
                    placeholder={t.destinationPlaceholder}
                  />
                </span>
              </div>
              <div className="hidden sm:block h-10 w-px bg-border my-auto" />
              <div className="flex-1 flex items-center gap-3 px-3 py-2 sm:py-1">
                <Users className="h-5 w-5 text-brand shrink-0" />
                <span className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-caption uppercase tracking-wide text-muted-foreground fw-semibold leading-none">{t.fields.guests}</span>
                  <span className="text-body-sm text-foreground leading-tight mt-0.5">{guests}</span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setGuests((n) => Math.max(1, n - 1))}
                    disabled={guests <= 1}
                    className="size-7 rounded-full border border-brand/40 bg-brand/10 text-brand flex items-center justify-center hover:bg-brand/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label={t.decreaseGuests}
                  >
                    <Minus className="size-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuests((n) => n + 1)}
                    className="size-7 rounded-full border border-brand/40 bg-brand/10 text-brand flex items-center justify-center hover:bg-brand/20 transition-colors"
                    aria-label={t.increaseGuests}
                  >
                    <Plus className="size-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 sm:mt-0 flex items-center justify-center gap-2 px-5 py-3 sm:py-0 rounded-xl sm:rounded-full bg-brand text-white fw-semibold text-body-sm hover:opacity-90 transition shrink-0"
              >
                <Search className="h-4 w-4" />
                <span className="sm:hidden">{t.search}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Feature cards overlapping hero — 2x2 on mobile, 4-col on desktop */}
      <div className="relative z-20 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-20 pb-10 sm:pb-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {t.features.map((f, i) => {
            const c = { ...f, ...FEATURE_STYLES[i] }
            return (
            <div
              key={c.title}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/70 bg-white/90 backdrop-blur-xl p-3.5 sm:px-5 sm:py-4 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.35)] hover:-translate-y-2 hover:border-white hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.4)] transition-all duration-500 animate-rise"
              style={{ animationDelay: `${0.5 + i * 0.08}s` }}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div
                className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${c.color} opacity-0 blur-2xl group-hover:opacity-25 transition-opacity duration-500`}
              />

              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2.5 sm:mb-3">
                  <div
                    className={`relative inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shrink-0`}
                  >
                    <c.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm" />
                  </div>
                  <span
                    className={`inline-flex self-start sm:self-auto items-center text-caption fw-semibold tracking-wide px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r ${c.color} text-white shadow-sm whitespace-nowrap`}
                  >
                    {c.stat}
                  </span>
                </div>
                <h4 className="font-display text-foreground mb-1">
                  {c.title}
                </h4>
                <p className="hidden sm:block text-caption text-muted-foreground">
                  {c.desc}
                </p>
              </div>

              <div
                className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${c.color} group-hover:w-full transition-all duration-500 ease-out`}
              />
            </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}