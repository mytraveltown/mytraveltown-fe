import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Globe2,
  Package,
  Users,
  BadgeIndianRupee,
  TrendingUp,
  Rocket,
  ChevronDown,
  FileText,
  MapPin,
  Search,
  MessageCircle,
  PlayCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroTaj from "@/assets/hero-taj.jpg";
import { SEO } from "@/components/SEO";
import { PartnerDemoVideo } from "@/components/site/PartnerDemoVideo";
import { partnerDemoText, seoText } from "@/lib/text";
import { ROUTES } from "@/lib/routes";

const WHY_CHOOSE = [
  {
    icon: Globe2,
    title: "Increase Your Visibility",
    desc: "Get discovered by travelers searching for trusted travel experiences.",
    tint: "bg-blue-50 text-blue-600",
  },
  {
    icon: Package,
    title: "Showcase Unlimited Packages",
    desc: "List domestic and international tour packages on one dedicated platform.",
    tint: "bg-orange-50 text-orange-600",
  },
  {
    icon: Users,
    title: "Connect Directly with Travelers",
    desc: "Receive inquiries and communicate directly with potential customers.",
    tint: "bg-violet-50 text-violet-600",
  },
  {
    icon: BadgeIndianRupee,
    title: "Zero Booking Commissions",
    desc: "We don't charge commission on any successful bookings.",
    tint: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Generate Quality Leads",
    desc: "Reach travelers actively planning and comparing travel options.",
    tint: "bg-amber-50 text-amber-600",
  },
  {
    icon: Rocket,
    title: "Grow Your Business Digitally",
    desc: "Build your online presence and expand your customer reach.",
    tint: "bg-rose-50 text-rose-600",
  },
] as const;

const STEPS = [
  {
    n: 1,
    icon: FileText,
    title: "Create Your Profile",
    desc: "Register your travel business and complete verification.",
  },
  {
    n: 2,
    icon: Package,
    title: "List Your Packages",
    desc: "Showcase your travel packages and destinations.",
  },
  {
    n: 3,
    icon: Search,
    title: "Get Discovered",
    desc: "Travelers browse and compare your offerings.",
  },
  {
    n: 4,
    icon: MessageCircle,
    title: "Receive Inquiries",
    desc: "Connect directly with travelers and grow your bookings.",
  },
] as const;

const PARTNER_FAQS = [
  {
    id: 1,
    question: "Who can become a travel partner on MyTravelTown?",
    answer:
      "Any verified travel agent, tour operator, DMC (Destination Management Company), travel consultant, or travel business can apply to join MyTravelTown.",
  },
  {
    id: 2,
    question: "Why should I join MyTravelTown?",
    answer:
      "MyTravelTown helps travel businesses increase visibility, showcase travel packages, connect directly with travelers, generate quality inquiries, and grow their online presence through a dedicated travel marketplace.",
  },
  {
    id: 3,
    question: "How do I register as a travel partner?",
    answer:
      "Simply complete the registration form, submit your business details, and our team will review your application before activating your profile.",
  },
  {
    id: 4,
    question: "Is my business required to be verified?",
    answer:
      "Yes. We verify travel partners to maintain a trusted marketplace and ensure travelers connect with genuine travel professionals.",
  },
  {
    id: 5,
    question: "Can I list multiple travel packages?",
    answer:
      "Yes. You can showcase multiple domestic and international travel packages, destinations, and experiences through your profile.",
  },
  {
    id: 6,
    question: "Can I update my travel packages anytime?",
    answer:
      "Yes. You can manage, update, and modify your package details whenever needed.",
  },
] as const;

export default function BecomeAgent() {
  const { isLoggedIn, user } = useAuth();
  const [openFaqId, setOpenFaqId] = useState<number | null>(PARTNER_FAQS[0]?.id ?? null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const demoVideoRef = useRef<HTMLVideoElement>(null);

  /** Scrolls to the walkthrough and plays it from the start with sound (allowed after a click). */
  const watchDemo = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const video = demoVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.muted = false;
    video.play().catch((error) => console.warn("Partner demo: playback failed", error));
  };

  const registerHref =
    isLoggedIn && user?.role === "user" ? "/agent-registration" : "/login";

  return (
    <div className="bg-white text-neutral-900">
      <SEO
        title={seoText.partner.title}
        description={seoText.partner.description}
        canonical={ROUTES.PARTNER}
        appendSiteName={false}
      />
      {/* Hero */}
      {/* Fills the viewport below the sticky header (h-16 + 1px border) */}
      <section className="relative overflow-hidden flex items-center min-h-[calc(100svh-4rem-1px)]">
        <div className="absolute inset-0">
          <img src={heroTaj} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl text-white">
            <h1 className="font-display text-display fw-bold leading-tight">
              Grow Your Travel Business with MyTravelTown
            </h1>
            <p className="mt-5 text-white/85 text-body-lg max-w-xl leading-relaxed">
              Join India&apos;s First AI TravelTech Marketplace and showcase your travel packages
              to travelers actively looking for their next adventure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={registerHref}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white fw-semibold px-6 py-3.5 rounded-lg shadow-lg shadow-orange-500/30 transition"
              >
                <UserPlus size={18} /> Register as a Travel Partner
              </Link>
              <Link
                to={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white fw-semibold px-6 py-3.5 rounded-lg transition"
              >
                Talk to Our Team
              </Link>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  watchDemo();
                }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white fw-semibold px-6 py-3.5 rounded-lg transition"
              >
                <PlayCircle size={18} /> {partnerDemoText.watchDemo}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display fw-bold">
            Why Travel Experts Choose MyTravelTown?
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-orange-500 rounded-full" />
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${item.tint}`}
              >
                <item.icon size={22} />
              </div>
              <h3 className="fw-bold text-body-lg">{item.title}</h3>
              <p className="mt-2 text-body-sm text-neutral-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        ref={howItWorksRef}
        className="scroll-mt-20 bg-gradient-to-br from-orange-50 via-amber-50/40 to-blue-50/40"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <span className="text-caption fw-bold tracking-widest text-blue-600 uppercase">
            How Does It Work?
          </span>
          <h2 className="mt-2 font-display fw-bold">
            Get Started in 4 Simple Steps
          </h2>
          {/* Heading sits above the grid so the video centers against the steps, not the heading. */}
          <div className="mt-8 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="flex gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-white shadow-sm"
                >
                  <div className="shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white fw-bold flex items-center justify-center text-body-sm">
                    <step.icon size={16} />
                  </div>
                  <div>
                    <h3 className="fw-semibold text-body flex items-center gap-2">
                      {step.title}
                    </h3>
                    <p className="text-body-sm text-neutral-600 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 h-32 w-32 bg-orange-200/70 rounded-3xl rotate-6 -z-0" />
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-blue-200/70 rounded-3xl -rotate-6 -z-0" />
              <PartnerDemoVideo ref={demoVideoRef} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="text-center">
            <span
              className={`text-caption fw-bold tracking-widest uppercase text-primary`}
            >
              Learn More
            </span>
            <h2 className="font-display fw-bold text-neutral-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {PARTNER_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border bg-white border-neutral-200 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left px-5 py-4 fw-medium text-body-sm"
                  >
                    {faq.question}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 ml-3 transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-body-sm text-neutral-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA  bg-gradient-to-br from-blue-700 via-blue-600 to-orange-500 */}
      <section className="relative overflow-hidden bg-primary">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center text-white">
          <h2 className="font-display fw-bold">
            Ready to grow your travel business?
          </h2>
          <p className="mt-4 text-white/90 text-body-lg max-w-xl mx-auto">
            Register as a travel partner and start connecting with travelers on
            India&apos;s first AI travel marketplace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={registerHref}
              className="bg-orange-500 hover:bg-orange-600 text-white fw-semibold px-7 py-3.5 rounded-lg inline-flex items-center gap-2 shadow-xl shadow-orange-900/30 transition"
            >
              <UserPlus size={18} /> Register as a Travel Partner
            </Link>
            <Link
              to={ROUTES.CONTACT}
              className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/40 fw-semibold px-7 py-3.5 rounded-lg inline-flex items-center gap-2 transition"
            >
              <MapPin size={18} /> Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
