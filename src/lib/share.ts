import type { MouseEvent } from "react";

export type ShareTarget = "whatsapp" | "telegram" | "instagram" | "copy";

export interface SharePayload {
  url: string;
  title: string;
}

/** Cards are wrapped in a <Link>; action buttons must not trigger its navigation. */
export const stopCardNavigation = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** Absolute public URL of a package; pass the slug (preferred) or the id. */
export const buildPackageUrl = (packageSlugOrId: number | string) =>
  `${window.location.origin}/package/${packageSlugOrId}`;

export const buildShareText = (title: string) => `Check out this trip on MyTravelTown: ${title}`;

export const buildShareLink = (target: Exclude<ShareTarget, "copy" | "instagram">, { url, title }: SharePayload) => {
  const text = encodeURIComponent(buildShareText(title));
  const encodedUrl = encodeURIComponent(url);
  if (target === "whatsapp") return `https://wa.me/?text=${text}%20${encodedUrl}`;
  return `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
};

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts / older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
