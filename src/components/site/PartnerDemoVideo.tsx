import { useEffect, useRef, useState, type Ref } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { partnerDemoText as text } from "@/lib/text";

type DemoLanguage = "en" | "hi";

/** Both cuts share one timeline, so switching language can resume at the same moment. */
const DEMO_SOURCES: Record<DemoLanguage, { video: string; poster: string; captions: string; captionLabel: string }> = {
  en: {
    video: "/videos/partner-registration.mp4",
    poster: "/videos/partner-registration-poster.jpg",
    captions: "/videos/partner-registration.en.vtt",
    captionLabel: "English",
  },
  hi: {
    video: "/videos/partner-registration.hi.mp4",
    poster: "/videos/partner-registration-poster.hi.jpg",
    captions: "/videos/partner-registration.hi.vtt",
    captionLabel: "हिन्दी",
  },
};
const DEMO_LANGUAGES = Object.keys(DEMO_SOURCES) as DemoLanguage[];
const DEFAULT_LANGUAGE: DemoLanguage = "hi";
/** Share of the video that must be on screen before it starts playing. */
const VISIBLE_THRESHOLD = 0.5;

interface PartnerDemoVideoProps {
  /** Lets the page restart the demo with sound, e.g. from a "Watch Demo" button. */
  ref?: Ref<HTMLVideoElement>;
}

interface PlaybackPosition {
  time: number;
  playing: boolean;
}

const isDemoLanguage = (value: string): value is DemoLanguage => value in DEMO_SOURCES;

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Partner walkthrough video with an English/Hindi switch. Autoplays muted (as browsers require)
 * only while on screen, pauses when scrolled away, and never autoplays for visitors who prefer
 * reduced motion. Switching language keeps the playback position, mute state and play state.
 */
export function PartnerDemoVideo({ ref }: PartnerDemoVideoProps) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const resumeRef = useRef<PlaybackPosition | null>(null);
  const [language, setLanguage] = useState<DemoLanguage>(DEFAULT_LANGUAGE);
  const source = DEMO_SOURCES[language];

  const setRefs = (node: HTMLVideoElement | null) => {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    const video = localRef.current;
    if (!video || prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can still be refused (e.g. battery saver); the poster and controls remain usable.
          video.play().catch((error) => console.warn("Partner demo: autoplay blocked", error));
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: VISIBLE_THRESHOLD },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const changeLanguage = (value: string) => {
    // Radix reports "" when the active item is pressed again; keep the current language.
    if (!isDemoLanguage(value) || value === language) return;
    const video = localRef.current;
    if (video) resumeRef.current = { time: video.currentTime, playing: !video.paused };
    setLanguage(value);
  };

  const restorePosition = () => {
    const video = localRef.current;
    const position = resumeRef.current;
    resumeRef.current = null;
    if (!video || !position) return;
    video.currentTime = Math.min(position.time, video.duration || position.time);
    if (position.playing) {
      video.play().catch((error) => console.warn("Partner demo: playback failed after language switch", error));
    }
  };

  return (
    <div className="relative z-10">
      <div className="mb-3 flex items-center justify-end">
        <ToggleGroup
          type="single"
          value={language}
          onValueChange={changeLanguage}
          aria-label={text.languageLabel}
          className="gap-0 rounded-full border border-neutral-200 bg-white p-1 shadow-sm"
        >
          {DEMO_LANGUAGES.map((lang) => (
            <ToggleGroupItem
              key={lang}
              value={lang}
              lang={lang}
              size="sm"
              className="rounded-full px-4 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 data-[state=on]:bg-blue-600 data-[state=on]:text-white"
            >
              {text.languages[lang]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <video
        ref={setRefs}
        src={source.video}
        className="relative aspect-video w-full rounded-3xl bg-neutral-900 object-cover shadow-2xl"
        poster={source.poster}
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={text.videoLabel}
        onLoadedMetadata={restorePosition}
      >
        {/* Keyed so the browser drops the old cue list instead of merging tracks across languages. */}
        <track key={language} kind="captions" src={source.captions} srcLang={language} label={source.captionLabel} default />
        {text.fallback}
      </video>
    </div>
  );
}
