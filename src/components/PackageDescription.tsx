import { parseDescription } from "@/lib/description";
import { ReadMore } from "@/components/ReadMore";
import { FormattedText } from "@/components/FormattedText";

/**
 * Renders a package's free-text description as clean paragraphs and bullet lists,
 * collapsed to a few lines with a "Read more" toggle.
 */
export function PackageDescription({ text }: { text: string | null | undefined }) {
  // Hide the section when nothing readable remains (e.g. emoji-only text).
  if (!parseDescription(text).length) return null;

  return (
    <div className="mt-3">
      <ReadMore className="space-y-3 text-body-sm text-muted-foreground">
        <FormattedText text={text} />
      </ReadMore>
    </div>
  );
}
