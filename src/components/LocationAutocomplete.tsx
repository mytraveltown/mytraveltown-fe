import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { LocationSuggestionInterface } from "@/lib/interface";
import { searchText } from "@/lib/text";

type LocationAutocompleteProps = {
  /** Committed value: always one of the locations that exists in the database (or empty). */
  value: string;
  onChange: (value: string) => void;
  /** Which package field to suggest from. */
  type: "from" | "to";
  /** Selected value of the opposite field; narrows suggestions to packages that match both. */
  related?: string;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
};

const DEBOUNCE_MS = 200;
const SUGGESTION_LIMIT = 8;

export function LocationAutocomplete({
  value,
  onChange,
  type,
  related = "",
  placeholder,
  className = "",
  ariaLabel,
}: LocationAutocompleteProps) {
  const [text, setText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSuggestionInterface[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Keep the visible text in sync when the committed value changes from outside
  useEffect(() => {
    setText(value);
  }, [value]);

  // If the opposite field changes and the current value no longer fits that
  // combination, clear it so the user can't end up with a no-result search.
  useEffect(() => {
    if (!value || !related) return;
    let cancelled = false;
    GET<LocationSuggestionInterface[]>(API.PACKAGE.LOCATIONS, {
      type,
      q: value,
      limit: 50,
      related,
    })
      .then((data) => {
        const valid = Array.isArray(data) && data.some((s) => s.name.toLowerCase() === value.toLowerCase());
        if (!cancelled && !valid) onChange("");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [related]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await GET<LocationSuggestionInterface[]>(API.PACKAGE.LOCATIONS, {
          type,
          q: text.trim(),
          limit: SUGGESTION_LIMIT,
          ...(related && { related }),
        });
        if (!cancelled) {
          setSuggestions(Array.isArray(data) ? data : []);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, type, related, open]);

  const select = (name: string) => {
    setText(name);
    onChange(name);
    setOpen(false);
  };

  // Only accept free text that resolves to a real location, otherwise fall back
  // to the last valid value. This is what prevents typo-only searches.
  const commitOnBlur = () => {
    setOpen(false);
    const trimmed = text.trim();
    if (!trimmed) {
      setText("");
      if (value) onChange("");
      return;
    }
    const exact = suggestions.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (exact) {
      select(exact.name);
    } else {
      setText(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open && suggestions.length > 0) {
      const target = suggestions[activeIndex] ?? (activeIndex === -1 ? suggestions[0] : undefined);
      if (target) {
        e.preventDefault();
        select(target.name);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showEmpty = open && !loading && suggestions.length === 0 && text.trim() !== "";

  return (
    <div className="relative w-full">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={commitOnBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={open}
        role="combobox"
        autoComplete="off"
      />
      {open && (suggestions.length > 0 || showEmpty) && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full min-w-[220px] overflow-auto rounded-xl border border-border bg-white py-1 text-left text-foreground shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.name}
              role="option"
              aria-selected={i === activeIndex}
              // mousedown (not click) so the input's blur doesn't close the list first
              onMouseDown={(e) => {
                e.preventDefault();
                select(s.name);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-body-sm ${
                i === activeIndex ? "bg-muted" : ""
              }`}
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{s.name}</span>
              <span className="text-caption text-muted-foreground">
                {searchText.autocomplete.packageCount(s.package_count)}
              </span>
            </li>
          ))}
          {showEmpty && (
            <li className="px-3 py-2 text-body-sm text-muted-foreground">
              {searchText.autocomplete.noMatches}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
