import type { PackageInterface } from "@/lib/interface";

type PackageRouteRef = Pick<PackageInterface, "id"> & { slug?: string | null };

/** Public package URL segment: the SEO slug, falling back to the id for packages not yet backfilled. */
export const packageSlugOrId = ({ id, slug }: PackageRouteRef): string | number => slug || id;

/** Public package detail path, e.g. "/package/goa-beach-getaway". */
export const packagePath = (pkg: PackageRouteRef) => `/package/${packageSlugOrId(pkg)}`;

/** Public static page paths. Keep slugs in sync with the visible link names. */
export const ROUTES = {
  ABOUT: "/about-us",
  CONTACT: "/contact-us",
  PARTNER: "/become-a-partner",
  REFUND_POLICY: "/refund-and-cancellation-policy",
} as const;

/** Old public paths that now permanently redirect to their renamed equivalents. */
export const LEGACY_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: "/about", to: ROUTES.ABOUT },
  { from: "/contact", to: ROUTES.CONTACT },
  { from: "/become-agent", to: ROUTES.PARTNER },
  { from: "/partner-with-us", to: ROUTES.PARTNER },
  { from: "/refund-policy", to: ROUTES.REFUND_POLICY },
];
