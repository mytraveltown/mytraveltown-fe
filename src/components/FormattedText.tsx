import { useMemo } from "react";
import { parseDescription } from "@/lib/description";

/**
 * Renders free text as clean paragraphs, sub-headings and bullet lists
 * (lines starting with "-", "•", "1." and so on become list items; emojis and divider lines are dropped).
 */
export function FormattedText({ text }: { text: string | null | undefined }) {
  const blocks = useMemo(() => parseDescription(text), [text]);

  return (
    <>
      {blocks.map((block, index) =>
        block.type === "heading" ? (
          <h3 key={index} className="pt-2 text-body fw-semibold text-foreground">
            {block.text}
          </h3>
        ) : block.type === "list" ? (
          <ul key={index} className="space-y-1">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p key={index} className="whitespace-pre-line">
            {block.text}
          </p>
        )
      )}
    </>
  );
}
