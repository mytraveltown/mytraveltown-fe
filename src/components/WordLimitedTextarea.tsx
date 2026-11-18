import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { countWords, limitWords } from "@/lib/wordLimit";

type WordLimitedTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  /** Target word count shown in the counter; going over it is flagged but still allowed up to `inputMaxWords`. */
  maxWords: number;
  /** Hard cap on what can be typed or pasted. Defaults to `maxWords`. */
  inputMaxWords?: number;
  /** Shown next to the counter while the text is over `maxWords`, e.g. how it will be shortened. */
  overLimitHint?: string;
  /** Optional control shown on the left of the word counter, e.g. an AI rewrite button. */
  action?: ReactNode;
};

/**
 * Textarea with a live word counter. Typing stops at `inputMaxWords`; long pastes are trimmed to it.
 * Text already over the cap (e.g. saved before the limit existed) can still be shortened.
 */
export function WordLimitedTextarea({
  value,
  onChange,
  maxWords,
  inputMaxWords = maxWords,
  overLimitHint,
  action,
  ...textareaProps
}: WordLimitedTextareaProps) {
  const wordCount = countWords(value);
  const isOverLimit = wordCount > maxWords;
  const hardCap = Math.max(inputMaxWords, maxWords);

  const handleChange = (next: string) => {
    const nextCount = countWords(next);
    if (nextCount <= hardCap || nextCount <= wordCount) {
      onChange(next);
      return;
    }
    // Already at (or over) the cap: ignore the extra word. Otherwise (e.g. a long paste): trim to fit.
    if (wordCount >= hardCap) return;
    onChange(limitWords(next, hardCap));
  };

  return (
    <div>
      <textarea
        {...textareaProps}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        aria-invalid={isOverLimit || undefined}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">{action}</div>
        <p
          className={cn(
            "shrink-0 text-caption text-right",
            !isOverLimit ? "text-neutral-500" : overLimitHint ? "text-amber-600" : "text-red-600"
          )}
          aria-live="polite"
        >
          {wordCount}/{maxWords} words
          {isOverLimit && ` (${overLimitHint ?? `please remove ${wordCount - maxWords}`})`}
        </p>
      </div>
    </div>
  );
}
