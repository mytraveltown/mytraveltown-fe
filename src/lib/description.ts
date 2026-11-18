export type DescriptionBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const EMOJI_PATTERN = /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u200D\u20E3]/gu;
const SEPARATOR_LINE = /^[-*_=~•·.\s]{3,}$/;
const BULLET_PREFIX = /^(?:[-*•·✓✔✅▪◦‣]|\d+[.)])\s+/u;

export const stripEmojis = (text: string) => text.replace(EMOJI_PATTERN, "");

/** Removes emojis and collapses whitespace, for single-line uses such as SEO tags. */
export const toPlainText = (text: string) =>
  stripEmojis(text)
    .replace(/(^|\s)[-*_=~]{3,}(?=\s|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const MAX_HEADING_LENGTH = 50;

/** A short ALL-CAPS single line that introduces a list reads as a sub-heading. */
const isHeadingText = (text: string) =>
  !text.includes("\n") &&
  text.length <= MAX_HEADING_LENGTH &&
  /\p{L}/u.test(text) &&
  text === text.toUpperCase();

/**
 * Turns a free-text package description into clean display blocks:
 * emojis and divider lines are dropped, bullet lines become list items,
 * and runs of blank lines collapse into a single paragraph break.
 */
export function parseDescription(raw: string | null | undefined): DescriptionBlock[] {
  if (!raw) return [];

  const blocks: DescriptionBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const hadContent = rawLine.trim().length > 0;
    const line = stripEmojis(rawLine).replace(/[ \t]+/g, " ").trim();

    // Blank lines, divider lines ("---") and emoji-only lines end the current block.
    if (!line || SEPARATOR_LINE.test(line)) {
      if (!hadContent || line) {
        flushParagraph();
        flushList();
      }
      continue;
    }

    const bullet = BULLET_PREFIX.exec(line);
    if (bullet) {
      flushParagraph();
      const item = line.slice(bullet[0].length).trim();
      if (item) list.push(item);
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushParagraph();
  flushList();

  return blocks.map((block, index) =>
    block.type === "paragraph" &&
    blocks[index + 1]?.type === "list" &&
    isHeadingText(block.text)
      ? { type: "heading", text: block.text }
      : block
  );
}

export type DayDescription = {
  /** Leading ALL-CAPS label such as "ARRIVAL IN JAIPUR", when present. */
  title: string | null;
  items: string[];
};

/** Decorative glyphs agents use to separate activities inside one line. */
const INLINE_DIVIDER = /[✦✧❖◆◇★☆➤➜►▶❯✔✓]/u;

/**
 * Cleans an itinerary day description such as
 * "ARRIVAL IN JAIPUR ✦ Meet & greet ✦ Hotel check-in ✦ Overnight stay"
 * into a short title plus a list of items. Text without dividers becomes a single item.
 */
export function parseDayDescription(raw: string | null | undefined): DayDescription {
  // Agents often use emojis as the separator between activities, so treat them as dividers too.
  const segments = (raw ?? "")
    .replace(EMOJI_PATTERN, "✦")
    .split(INLINE_DIVIDER)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (segments.length > 1 && isHeadingText(segments[0])) {
    return { title: segments[0], items: segments.slice(1) };
  }
  return { title: null, items: segments };
}
