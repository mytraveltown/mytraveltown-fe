import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { layoutText } from "@/lib/text";

const t = layoutText.legal;

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-soft/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backToHome}
          </Link>
          <h1 className="font-display text-foreground">
            {title}
          </h1>
        </div>
      </section>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8 text-body-sm text-muted-foreground leading-relaxed">
        {children}
      </article>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function LegalContact({
  email = t.defaultEmail,
  closing,
}: {
  email?: string;
  closing?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-foreground mb-3">{t.contactTitle}</h2>
      <p>
        {t.contactIntro}{" "}
        <a href={`mailto:${email}`} className="text-primary fw-semibold hover:underline">
          {email}
        </a>
      </p>
      {closing && <p className="mt-4">{closing}</p>}
    </section>
  );
}
