import { useEffect, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { FaqInterface, FaqPage } from "@/lib/interface";
import { homeText } from "@/lib/text";

type FaqSectionProps = {
  page: FaqPage;
  eyebrow?: string;
  title?: string;
  className?: string;
  variant?: "default" | "neutral";
};

export function FaqSection({
  page,
  eyebrow = homeText.faq.defaultEyebrow,
  title = homeText.faq.defaultTitle,
  className = "",
  variant = "default",
}: FaqSectionProps) {
  const [faqs, setFaqs] = useState<FaqInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await GET<FaqInterface[]>(API.FAQ.GET_BY_PAGE, { page });
        if (!cancelled) {
          setFaqs(data);
          setOpenId(data[0]?.id ?? null);
        }
      } catch {
        if (!cancelled) setFaqs([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (isLoading) {
    return (
      <section className={`${variant === "neutral" ? "bg-neutral-50" : "bg-soft/40 border-y border-border"} ${className}`}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (faqs.length === 0) return null;

  const isNeutral = variant === "neutral";

  return (
    <section className={`${isNeutral ? "bg-neutral-50" : "bg-soft/40 border-y border-border"} ${className}`}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <span
            className={`text-caption fw-bold tracking-widest uppercase ${
              isNeutral ? "text-blue-600" : "text-primary"
            }`}
          >
            {eyebrow}
          </span>
          <h2
            className={`mt-2 ${
              isNeutral ? "text-neutral-900" : "text-foreground"
            }`}
          >
            {title}
          </h2>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-xl border shadow-sm ${
                  isNeutral
                    ? "bg-white border-neutral-200"
                    : "bg-card border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 fw-medium text-body-sm"
                >
                  {faq.question}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 ml-3 transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div
                    className={`px-5 pb-4 text-body-sm ${
                      isNeutral ? "text-neutral-600" : "text-muted-foreground"
                    }`}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
