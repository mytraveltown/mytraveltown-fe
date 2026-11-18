// Keep these in sync with mytraveltown_backend-main/src/utils/wordLimit.js.

/** Maximum words in a saved "About Me"; the AI condenses longer text to this. */
export const ABOUT_ME_MAX_WORDS = 200;

/** Maximum words in a saved "Location Description"; the AI condenses longer text to this. */
export const LOCATION_DESCRIPTION_MAX_WORDS = 200;

/** Maximum words that can be typed or pasted before the AI condenses it to the saved limit. */
export const TEXT_INPUT_MAX_WORDS = 1300;

const WORD_PATTERN = /\S+/g;

export function countWords(text: string): number {
  return text.match(WORD_PATTERN)?.length ?? 0;
}

/** Cuts text off right before the word that would exceed `maxWords`, keeping the original spacing. */
export function limitWords(text: string, maxWords: number): string {
  let wordIndex = 0;
  for (const match of text.matchAll(WORD_PATTERN)) {
    if (wordIndex === maxWords) return text.slice(0, match.index);
    wordIndex += 1;
  }
  return text;
}
