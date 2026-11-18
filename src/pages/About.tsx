import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe,
  ShieldCheck,
  GitCompare,
  Search,
  Sparkles,
  BadgeIndianRupee,
  Zap,
  Lock,
  Target,
  Eye,
} from "lucide-react";
import { FaqSection } from "@/components/site/FaqSection";
import { aboutText } from "@/lib/text";
import { SEO } from "@/components/SEO";
import { seoText } from "@/lib/text";
import { ROUTES } from "@/lib/routes";

const WHY_CHOOSE_ICONS = [
  Globe,
  ShieldCheck,
  GitCompare,
  Search,
  Sparkles,
  BadgeIndianRupee,
  Zap,
  Lock,
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoText.about.title}
        description={seoText.about.description}
        canonical={ROUTES.ABOUT}
        appendSiteName={false}
      />
      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/75" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-caption fw-bold tracking-widest uppercase mb-6">
              {aboutText.hero.badge}
            </span>
            <h1 className="text-display text-foreground tracking-tight">
              {aboutText.hero.title}
            </h1>
            <p className="mt-6 text-muted-foreground text-body-lg max-w-2xl">
              {aboutText.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* The Idea */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
              alt={aboutText.idea.imageAlt}
              className="rounded-2xl w-full aspect-[4/3] object-cover shadow-[var(--shadow-card)]"
            />
          </div>

          <div>
            <h2 className="text-foreground">{aboutText.idea.title}</h2>
            <div className="mt-5 space-y-4 text-muted-foreground">
              <p>
                {aboutText.idea.paragraph1Before}
                <span className="fw-semibold">{aboutText.idea.paragraph1Highlight}</span>
                {aboutText.idea.paragraph1After}
              </p>
              <p>{aboutText.idea.paragraph2}</p>
              <p>{aboutText.idea.paragraph3}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-soft/40 border-y border-border py-8 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-foreground">{aboutText.whyChoose.title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutText.whyChoose.items.map(({ title, description }, index) => {
              const Icon = WHY_CHOOSE_ICONS[index];
              return (
              <div
                key={title}
                className="bg-white rounded-2xl border border-border p-6 shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-foreground">{title}</h3>
                <p className="mt-2 text-body-sm text-muted-foreground">{description}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-card)]">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-foreground">{aboutText.missionVision.missionTitle}</h2>
            <p className="mt-4 text-muted-foreground">
              {aboutText.missionVision.missionDescription}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-card)]">
            <div className="h-12 w-12 rounded-xl bg-cta/10 flex items-center justify-center mb-5">
              <Eye className="h-6 w-6 text-cta" />
            </div>
            <h2 className="text-foreground">{aboutText.missionVision.visionTitle}</h2>
            <p className="mt-4 text-muted-foreground">
              {aboutText.missionVision.visionDescription}
            </p>
          </div>
        </div>
      </section>

      <FaqSection
        page="about"
        eyebrow={aboutText.faq.eyebrow}
        title={aboutText.faq.title}
      />

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary">
        <div className="relative rounded-2xl bg-primary overflow-hidden px-8 py-14 md:py-16 text-center">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">
            <h2 className="text-primary-foreground">{aboutText.cta.title}</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              {aboutText.cta.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to={ROUTES.PARTNER}
                className="bg-orange-500 hover:bg-orange-600 text-white fw-semibold px-7 py-3.5 rounded-lg inline-flex items-center gap-2 shadow-xl shadow-orange-900/30 transition"
              >
                {aboutText.cta.buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
