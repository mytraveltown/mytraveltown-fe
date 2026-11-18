import { Facebook, Twitter, Instagram, Youtube, Globe, MapPin, Mail, Phone, Linkedin } from "lucide-react";
import { layoutText, commonText } from "@/lib/text";
import { Link } from "react-router-dom";
import { IndianFlag } from "@/components/site/IndianFlag";
import { ROUTES } from "@/lib/routes";

const t = layoutText.footer;

export function Footer() {
  return (
    <footer id="footer" className="bg-soft print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-display fw-bold text-body-lg text-brand">{commonText.brandName}</span>
            </div>
            <p className="text-caption text-muted-foreground mt-3 max-w-xs">{t.tagline}</p>
            <div className="flex gap-3 mt-4 text-muted-foreground">
              <a href="https://www.facebook.com/share/1bwDKitkuA/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4 hover:text-primary cursor-pointer" />
              </a>
              <a href="https://www.instagram.com/mytraveltown" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4 hover:text-primary cursor-pointer" />
              </a>
              <a href="https://www.linkedin.com/company/mytraveltown/" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 hover:text-primary cursor-pointer" />
              </a>
            </div>
          </div>

          <Col
            title={t.exploreTitle}
            links={[
              { label: t.exploreLinks.home, to: "/" },
              { label: t.exploreLinks.packages, to: "/search" },
              { label: t.exploreLinks.about, to: ROUTES.ABOUT },
              { label: t.exploreLinks.contact, to: ROUTES.CONTACT },
              { label: t.exploreLinks.partner, to: ROUTES.PARTNER },
            ]}
          />
          <Col
            title={t.policiesTitle}
            links={[
              { label: t.policyLinks.terms, to: "/terms-and-conditions" },
              { label: t.policyLinks.privacy, to: "/privacy-policy" },
              { label: t.policyLinks.pricing, to: "/pricing-policy" },
              { label: t.policyLinks.refund, to: ROUTES.REFUND_POLICY },
            ]}
          />
          <div>
            <h4 className="text-brand mb-3">{t.contactTitle}</h4>
            <a
              href="tel:+919999319545"
              rel="noopener noreferrer"
              className="mt-3 flex items-start gap-2 text-body-sm text-muted-foreground hover:text-primary transition group"
            >
              <Phone className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span className="leading-relaxed">{t.phone}</span>
            </a>
            <a
              href="mailto:support@mytraveltown.com"
              rel="noopener noreferrer"
              className="mt-3 flex items-start gap-2 text-body-sm text-muted-foreground hover:text-primary transition group"
            >
              <Mail className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span className="leading-relaxed">{t.email}</span>
            </a>
            <a 
              rel="noopener noreferrer"
              className="mt-3 flex items-start gap-2 text-body-sm text-muted-foreground hover:text-primary transition group"
            >
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <span className="leading-relaxed">{t.officeAddress}</span>
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-caption text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>{t.copyright(new Date().getFullYear(), commonText.brandName)}</span>
          <span className="inline-flex items-center gap-1.5">
            {t.credit}
            <IndianFlag title={t.creditFlagAlt} />
          </span>
        </div>
      </div>
    </footer>
  );
}

function Col({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[] | string[];
}) {
  return (
    <div>
      <h4 className="text-brand mb-3">{title}</h4>
      <ul className="space-y-2 text-body-sm text-muted-foreground">
        {links.map((l) => {
          const label = typeof l === "string" ? l : l.label;
          const to = typeof l === "string" ? "#" : l.to;
          const isExternal = to.startsWith("http") || to.startsWith("mailto") || to.startsWith("tel");

          return (
            <li key={label}>
              {isExternal ? (
                <a href={to} className="hover:text-primary transition cursor-pointer">
                  {label}
                </a>
              ) : to.startsWith("/") ? (
                <Link to={to} className="hover:text-primary transition cursor-pointer">
                  {label}
                </Link>
              ) : (
                <a href={to} className="hover:text-primary transition cursor-pointer">
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
