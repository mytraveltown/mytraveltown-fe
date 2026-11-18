import { useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * index.html ships default tags (marked data-seo-fallback) for crawlers that skip JS.
 * On React 19, Helmet renders plain hoisted tags and never removes pre-existing ones,
 * so they must be dropped here or tools read the default description on every page.
 */
const removeFallbackTags = () => {
  document.head.querySelectorAll("[data-seo-fallback]").forEach((tag) => tag.remove());
};

export const SITE_NAME = "MyTravelTown";
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://mytraveltown.com";
const DEFAULT_DESCRIPTION =
  "Discover and book domestic and international travel packages from verified partners on MyTravelTown.";
/** 1200x630 brand share card, served from /public so the social preview URL stays stable across builds. */
export const DEFAULT_OG_IMAGE = "/og-image.jpg";
const DEFAULT_OG_IMAGE_SIZE = { width: "1200", height: "630", type: "image/jpeg" } as const;

type JsonLd = Record<string, unknown>;

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  /** Path (e.g. "/package/72") or absolute URL. Defaults to the current path. */
  canonical?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
  jsonLd?: JsonLd | JsonLd[];
  /** Appends " | MyTravelTown" when the title lacks the brand. Disable for titles that are already final. */
  appendSiteName?: boolean;
}

const toAbsolute = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_OG_IMAGE,
  canonical,
  noIndex = false,
  type = "website",
  jsonLd,
  appendSiteName = true,
}: SEOProps) {
  useLayoutEffect(removeFallbackTags, []);

  const fullTitle =
    !appendSiteName || title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ? toAbsolute(canonical) : undefined;
  const imageUrl = toAbsolute(image);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      {/* Size is only known for the default card; package photos vary. */}
      {imageUrl.endsWith(DEFAULT_OG_IMAGE) && (
        <>
          <meta property="og:image:type" content={DEFAULT_OG_IMAGE_SIZE.type} />
          <meta property="og:image:width" content={DEFAULT_OG_IMAGE_SIZE.width} />
          <meta property="og:image:height" content={DEFAULT_OG_IMAGE_SIZE.height} />
        </>
      )}
      <meta property="og:image:alt" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
