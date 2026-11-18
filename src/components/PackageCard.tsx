import { Sparkles, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageCarousel } from "@/components/ImageCarousel";
import { PackageActions } from "@/components/PackageActions";
import { profileUrl, capitalize } from "@/lib/utils";
import type { PackageInterface } from "@/lib/interface";
import { packageCardText } from "@/lib/text";
import { toPlainText } from "@/lib/description";
import { packagePath } from "@/lib/routes";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop";

function getCardImages(pkg: PackageInterface) {
  if (pkg.images?.length) return pkg.images.map(profileUrl);
  return [pkg.thumbnail ? profileUrl(pkg.thumbnail) : PLACEHOLDER_IMAGE];
}

export function PackageCard({ pkg, list }: { pkg: PackageInterface; list?: boolean }) {
  const cardImages = getCardImages(pkg);
  const title = toPlainText(pkg.package_name);

  return (
    <Link
      to={packagePath(pkg)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
    >
      <article
        className={`bg-card border border-border rounded-2xl overflow-hidden hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition cursor-pointer ${
          list ? "flex flex-col sm:flex-row" : "h-full flex flex-col"
        }`}
      >
        <div className={`relative ${list ? "sm:w-72 shrink-0" : ""}`}>
          <ImageCarousel
            images={cardImages}
            alt={title}
            className={list ? "h-48" : "h-44"}
          />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-caption fw-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground capitalize">
            <Sparkles className="h-3 w-3" /> {pkg.package_type}
          </span>
          <PackageActions packageId={pkg.id} slug={pkg.slug} title={title} className="top-3 right-3" />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-body fw-bold line-clamp-2 ${
                list ? "" : "min-h-[2.75rem]"
              }`}
            >
              {title}
            </h3>
          </div>
          <p className="text-caption text-muted-foreground mt-1.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {capitalize(pkg.from_location)} → {capitalize(pkg.to_location)}
            </span>
          </p>
          <p className="text-caption text-muted-foreground mt-1">
            {packageCardText.card.duration(pkg.days, pkg.nights)}
            {pkg.flight_option === "included" ? packageCardText.card.flightIncluded : ""}
          </p>
          {/* {pkg.agent_company && (
            <p className="text-caption text-muted-foreground mt-1">By {pkg.agent_company}</p>
          )} */}
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div>
              {pkg.price != null && pkg.price > 0 ? (
                <>
                  <p className="text-caption text-muted-foreground">{packageCardText.card.from}</p>
                  <p className="font-display fw-bold text-body-lg text-brand">
                    ₹{pkg.price.toLocaleString("en-IN")}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-caption text-muted-foreground">{packageCardText.card.partnerPackage}</p>
                  <p className="font-display fw-bold text-body-sm text-brand">{packageCardText.card.viewDetails}</p>
                </>
              )}
            </div>
            <span className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-body-sm fw-semibold">
              {packageCardText.card.bookNow}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
