import { useState } from "react";
import { Loader2, Sparkles, Undo2 } from "lucide-react";
import { refineText, type RefineTextField } from "@/lib/ai";
import { cn } from "@/lib/utils";

type AiRefineButtonProps = {
  text: string;
  field: RefineTextField;
  onRefined: (text: string) => void;
  disabled?: boolean;
};

const getErrorMessage = (err: unknown) =>
  err && typeof err === "object" && "message" in err
    ? String((err as { message: string }).message)
    : "Could not improve the text. Please try again.";

/** Rewrites the given text with AI and offers a one-step undo back to the original. */
export function AiRefineButton({ text, field, onRefined, disabled }: AiRefineButtonProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");
  const [original, setOriginal] = useState<string | null>(null);
  const [refined, setRefined] = useState<string | null>(null);

  // Undo only applies while the field still holds the AI result.
  const canUndo = original !== null && refined === text;

  const handleRefine = async () => {
    setError("");
    setIsRefining(true);
    try {
      const result = await refineText(text, field);
      setOriginal(text);
      setRefined(result);
      onRefined(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsRefining(false);
    }
  };

  const handleUndo = () => {
    if (original === null) return;
    onRefined(original);
    setOriginal(null);
    setRefined(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleRefine}
        disabled={disabled || isRefining || !text.trim()}
        aria-busy={isRefining}
        className={cn(
          "group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5",
          "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-caption fw-semibold text-white",
          "shadow-md shadow-indigo-500/30 ring-1 ring-white/20 transition-all duration-200 cursor-pointer",
          "hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/40 hover:brightness-110",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:brightness-100",
          isRefining && "animate-pulse"
        )}
      >
        {/* Light sheen that sweeps across on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100 group-disabled:hidden"
        />
        {isRefining ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        )}
        <span className="relative">{isRefining ? "Improving..." : "Improve with AI"}</span>
      </button>
      {canUndo && !isRefining && (
        <button
          type="button"
          onClick={handleUndo}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-caption fw-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800 cursor-pointer"
        >
          <Undo2 size={14} /> Undo
        </button>
      )}
      {error && <span className="text-caption text-red-600">{error}</span>}
    </div>
  );
}
