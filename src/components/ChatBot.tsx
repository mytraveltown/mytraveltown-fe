import { useState, useRef, useEffect } from "react";
import { Send, X, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GET } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { PackageDayInterface, PackageInterface } from "@/lib/interface";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { profileUrl } from "@/lib/utils";
import { PackageActions } from "@/components/PackageActions";
import { toPlainText } from "@/lib/description";
import { packagePath } from "@/lib/routes";
import { ChatBotLauncherIcon } from "@/components/ChatBotLauncherIcon";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  packages?: PackageInterface[];
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop";

function ChatPackageCard({ pkg, expanded = false }: { pkg: PackageInterface; expanded?: boolean }) {
  const hasPrice = pkg.price != null && pkg.price > 0;
  return (
    <Link
      to={packagePath(pkg)}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`relative w-full bg-gray-100 overflow-hidden ${expanded ? "h-48" : "h-28"}`}>
        <img
          src={pkg.thumbnail ? profileUrl(pkg.thumbnail) : PLACEHOLDER_IMAGE}
          alt={toPlainText(pkg.package_name)}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-2 left-2 text-caption fw-bold uppercase tracking-wider bg-white/95 px-2 py-0.5 rounded-full">
          {pkg.package_type}
        </span>
        <PackageActions packageId={pkg.id} slug={pkg.slug} title={toPlainText(pkg.package_name)} size="sm" />
      </div>
      <div className="p-3">
        <h4 className="text-body-sm fw-semibold line-clamp-2">{toPlainText(pkg.package_name)}</h4>
        <p className="mt-1 flex items-center gap-1 text-caption text-gray-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {capitalize(pkg.from_location)} → {capitalize(pkg.to_location)}
          </span>
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-body-sm">
            {hasPrice ? (
              <>
                <span className="fw-bold">
                  ₹{Number(pkg.price).toLocaleString("en-IN")}
                </span>
                <span className="text-caption text-gray-500">/Person</span>
              </>
            ) : (
              <span className="fw-bold text-brand">View details</span>
            )}
          </p>
          <span className="text-caption text-gray-500">
            {pkg.days}D · {pkg.nights}N
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Fields sent to the model — sourced only from the package database. */
type DbPackageSummary = {
  id: number;
  package_name: string;
  from_location: string;
  to_location: string;
  days: number;
  nights: number;
  price: number | null;
  package_type: string;
  location_description: string | null;
  itinerary?: Array<{
    day_number: number;
    description: string;
    activities: string[];
    hotel_stars: number;
    meals: string;
  }>;
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "";
/** Comma-separated models tried in order when the primary model is overloaded. */
const GEMINI_FALLBACK_MODELS: string = import.meta.env.VITE_GEMINI_FALLBACK_MODELS || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiModels = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS.split(",")]
  .map((name) => name.trim())
  .filter((name, index, all) => name && all.indexOf(name) === index)
  .map((model) => genAI.getGenerativeModel({ model }));

function formatConversation(history: Message[], limit = 12): string {
  return history
    .slice(-limit)
    .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");
}

function toDbSummaries(
  packages: PackageInterface[],
  includeItinerary = false
): DbPackageSummary[] {
  return packages.map((pkg) => ({
    id: pkg.id,
    package_name: pkg.package_name,
    from_location: pkg.from_location,
    to_location: pkg.to_location,
    days: pkg.days,
    nights: pkg.nights,
    price: pkg.price ?? null,
    package_type: pkg.package_type,
    location_description: pkg.location_description
      ? pkg.location_description.slice(0, 220).replace(/\s+/g, " ").trim()
      : null,
    ...(includeItinerary && pkg.itinerary?.length
      ? {
          itinerary: pkg.itinerary.map((day: PackageDayInterface) => ({
            day_number: day.day_number,
            description: day.description,
            activities: day.activities || [],
            hotel_stars: day.hotel_stars,
            meals: day.meals,
          })),
        }
      : {}),
  }));
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPackagesMarkdown(
  packages: PackageInterface[],
  intro?: string
): string {
  const header =
    intro ||
    `I found ${packages.length} travel package${packages.length === 1 ? "" : "s"} in our database:`;

  const lines = packages.map((pkg) => {
    const price =
      pkg.price == null
        ? "Price on request"
        : `Price: ${pkg.price.toLocaleString("en-IN")}`;

    let block = `### ${toPlainText(pkg.package_name)}\n\n- ${price}\n- Duration: ${pkg.days} Days / ${pkg.nights} Nights\n- Route: ${capitalize(pkg.from_location)} → ${capitalize(pkg.to_location)}`;

    if (pkg.itinerary?.length) {
      const days = [...pkg.itinerary]
        .sort((a, b) => a.day_number - b.day_number)
        .map((day) => {
          const activities =
            day.activities?.length > 0
              ? day.activities.map((a) => `  - ${a}`).join("\n")
              : "  - Details not available";
          return `**Day ${day.day_number}: ${day.description}**\n${activities}\n  - Meals: ${day.meals || "N/A"}\n  - Hotel: ${day.hotel_stars || "N/A"}★`;
        })
        .join("\n\n");
      block += `\n\n#### Itinerary\n\n${days}`;
    }

    return block;
  });

  return `${header}\n\n${lines.join("\n\n")}`;
}

/** Cards show the summary; markdown is only needed when the user asked for itinerary details. */
function packageFallbackText(
  packages: PackageInterface[],
  needsDetails: boolean
): string {
  if (needsDetails) return formatPackagesMarkdown(packages);
  return `I found ${packages.length} package${packages.length === 1 ? "" : "s"} for you:`;
}

const PACKAGE_FIELD_LINE =
  /^[\s>*_\-•\d.)]*\W*(price|duration|route|highlights?|itinerary)\s*\**\s*:/iu;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Matches a package name tolerant of emoji, markdown and punctuation differences. */
function packageNameRegExp(name: string): RegExp | null {
  const words = name.match(/[\p{L}\p{N}]+/gu);
  if (!words?.length) return null;
  const body = words.map(escapeRegExp).join("[^\\p{L}\\p{N}]+");
  return new RegExp(
    `[\\p{Extended_Pictographic}\\uFE0F\\u200D*_•\\-\\s]*${body}[*_]*`,
    "giu"
  );
}

/** Raw database objects the model sometimes echoes, e.g. {"id":78,"package_name":... */
const RAW_DATA_START = /\[?\s*\{\s*"(?:id|package_name|from_location|to_location)"/;

/** Drops everything from the first echoed JSON object onward; keeps the readable intro. */
function stripRawData(text: string): string {
  const match = RAW_DATA_START.exec(text);
  return (match ? text.slice(0, match.index) : text).trim();
}

/**
 * Cards already show each package's name, price, duration and route, so drop any
 * of those details from the model reply and keep only the intro text.
 */
function stripPackageDetails(
  text: string,
  packages: PackageInterface[]
): string {
  text = stripRawData(text);
  const nameMatchers = packages
    .map((p) => packageNameRegExp(p.package_name))
    .filter((r): r is RegExp => r !== null);

  const kept = text
    .split("\n")
    .filter((line) => !PACKAGE_FIELD_LINE.test(line))
    .map((line) =>
      nameMatchers.reduce((acc, re) => acc.replace(re, " "), line).trim()
    )
    // drop lines left with only bullets / punctuation / emoji
    .filter((line) => /[\p{L}\p{N}]/u.test(line));

  return kept.join("\n").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

const NON_TRAVEL_REPLY =
  "I only answer travel-related questions: packages, destinations, famous places, local food, restaurants, weather for trips, itineraries, and holiday planning. Please ask something about travel.";

/** Obvious travel keywords so weather / place / package questions are never blocked. */
function looksLikeTravelQuery(query: string): boolean {
  return /\b(travel|trip|tour|holiday|vacation|package|packages|itinerary|itrenary|destination|destinations|hotel|hotels|flight|flights|visa|honeymoon|pilgrim(?:age)?|trek|trekking|beach|hills?|mountain|resort|booking|book(?:ing)?|sightseeing|places?\s+to\s+visit|best\s+place|best\s+places|famous|attractions?|landmarks?|monuments?|things\s+to\s+do|must[- ]?visit|food|foods|cuisine|dish(?:es)?|street\s+food|restaurants?|cafes?|dhabas?|eat|eating|eateries|delicacies|local\s+specialit(?:y|ies)|markets?|shopping|nightlife|weather|climate|monsoon|snowfall|best\s+time\s+to\s+visit|state[- ]?wise|city[- ]?wise|location[- ]?wise|weather[- ]?wise|goa|manali|shimla|kerala|rajasthan|uttarakhand|ladakh|kashmir|andaman|maldives|dubai|thailand|singapore|europe|bali|himachal|sikkim|darjeeling|kedarnath|varanasi|jaipur|udaipur|ooty|munnar|leh|spiti|rishikesh|haridwar|delhi|mumbai|agra|kolkata|chennai|bangalore|bengaluru|hyderabad|amritsar|lucknow|pune|mysore|hampi|pondicherry|puducherry|nainital|mussoorie|coorg|gangtok|meghalaya|london|paris|bangkok|tokyo|new\s+york)\b/i.test(
    query
  );
}

function wantsPackageDetails(query: string): boolean {
  return /\b(itinerary|itrenary|itenary|day[- ]?wise|schedule|details?|full detail|what(?:'s| is) included|inclusions?|hotel|meals?)\b/i.test(
    query
  );
}

/** Explicit request for packages / deals / bookings (tolerates common misspellings of "package"). */
function asksForPackages(query: string): boolean {
  return /\b((?:package|pakage|pacakage|pacakge|packge|pakcage|pkg)s?|deals?|offers?|book(?:ing)?|itinerary|itrenary|itenary)\b/i.test(
    query
  );
}

/** Follow-up about packages already shown, e.g. "price of this package", "day-wise details". */
function asksAboutShownPackages(query: string): boolean {
  return (
    wantsPackageDetails(query) ||
    /\b(?:this|that|these|those|the|same|above)\s+(?:package|trip|tour|one)s?\b|\b(?:price|cost)\b/i.test(
      query
    )
  );
}

function isFollowUpAboutCurrentPackage(query: string): boolean {
  return /\b(this|that|same|above|it|its|the package|this place|that place|this trip|that trip)\b/i.test(
    query
  ) || wantsPackageDetails(query);
}

const RETRYABLE_STATUS = /\b(429|500|503|504)\b|overloaded|high demand|unavailable/i;
const MAX_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 600;

/** Retries transient Gemini failures (rate limit / high demand) with exponential backoff. */
async function withRetry<T>(call: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await call();
    } catch (error) {
      lastError = error;
      const isRetryable = RETRYABLE_STATUS.test(String(error));
      if (!isRetryable || attempt === MAX_ATTEMPTS) break;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      );
    }
  }
  throw lastError;
}

/** Generates text with the primary model, falling back to the next model when one fails. */
async function generateText(prompt: string): Promise<string> {
  let lastError: unknown = new Error("No Gemini model configured (VITE_GEMINI_MODEL)");
  for (const model of geminiModels) {
    try {
      const result = await withRetry(() => model.generateContent(prompt));
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.warn(`Gemini model ${model.model} failed, trying next fallback`, error);
    }
  }
  throw lastError;
}

const QUERY_STOP_WORDS = new Set([
  "suggest", "show", "give", "some", "best", "package", "packages", "pacakage",
  "pacakge", "tour", "tours", "trip", "trips", "travel", "places", "place",
  "for", "the", "and", "with", "from", "please", "want", "need", "about", "what",
  "can", "you", "suggest", "famous", "food", "foods", "items", "restaurant",
  "restaurants", "try", "visit", "there", "where", "which", "this", "that",
]);

/** Keyword match against package fields, used when Gemini is unavailable. */
function matchPackagesLocally(
  query: string,
  packages: PackageInterface[]
): number[] {
  const terms = (query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(
    (term) => term.length > 3 && !QUERY_STOP_WORDS.has(term)
  );
  if (terms.length === 0) return [];
  const termPatterns = terms.map((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, "i"));

  return packages
    .filter((pkg) => {
      const haystack = [
        toPlainText(pkg.package_name),
        pkg.from_location,
        pkg.to_location,
        pkg.location_description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return termPatterns.some((pattern) => pattern.test(haystack));
    })
    .map((pkg) => pkg.id);
}

const FALLBACK_REPLY =
  "I couldn't find a matching answer for that right now. Try asking about a specific destination (e.g. \"Manali packages\" or \"best time to visit Kashmir\"), or browse all our holiday packages on the site.";

/**
 * Ask Gemini which package IDs from the live database match the user query.
 * Uses conversation history so follow-ups like "itinerary of this place" resolve.
 */
async function selectMatchingPackageIds(
  query: string,
  packages: PackageInterface[],
  history: Message[],
  lastMatchedIds: number[]
): Promise<number[]> {
  if (packages.length === 0) return [];

  const db = toDbSummaries(packages);
  const conversation = formatConversation(history);
  const prompt = `
You match travel queries to packages from a database.

Return ONLY valid JSON (no markdown, no explanation):
{"ids":[1,2],"follow_up":false}

Rules:
- "ids" = package ids from the database that match the user question.
- Use geographic knowledge to match states/regions to destinations in the database.
  Example: query "uttarakhand" matches a package with to_location "Kedarnath" because Kedarnath is in Uttarakhand.
- Match against package_name, from_location, to_location, and location_description.
- Include misspellings and alternate names (e.g. uttrakhand → uttarakhand).
- For "best places" / state-wise / location-wise / weather-wise questions, return packages for that region when available.
- If the user asks for "best N places/packages" with NO location, return up to N package ids from the database.
- If the question is general travel advice (weather, best time to visit, food, restaurants, famous places) with no clear destination match, return {"ids":[],"follow_up":false}.
- For food / restaurant / famous places questions, only return packages whose destination is that same location.
- If the user asks for a location and NOTHING in the database is in that place/region, return {"ids":[],"follow_up":false}.
- Never invent package ids that are not in the database below.
- FOLLOW-UPS: If the latest message refers to a previously discussed package
  (e.g. "itinerary", "itrenary", "details", "price", "this place", "this package", "full detail"),
  set "follow_up": true and return the previously matched package ids.
- Previously matched package ids from this conversation: ${JSON.stringify(lastMatchedIds)}
- If the user says "other places" / "more options" / "something else", return other package ids
  (exclude previously matched ids when possible).

Conversation history:
${conversation}

Latest user question:
${query}

Package database:
${JSON.stringify(db)}
`;

  let raw: string;
  try {
    raw = (await generateText(prompt)).trim();
  } catch (error) {
    console.error("Package matching via Gemini failed, using local match", error);
    const localIds = matchPackagesLocally(query, packages);
    if (localIds.length > 0) return localIds;
    if (lastMatchedIds.length > 0 && isFollowUpAboutCurrentPackage(query)) {
      const allowed = new Set(packages.map((p) => p.id));
      return lastMatchedIds.filter((id) => allowed.has(id));
    }
    return [];
  }
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    const parsed = JSON.parse(jsonText) as {
      ids?: unknown;
      follow_up?: unknown;
    };
    const ids = Array.isArray(parsed.ids)
      ? parsed.ids.filter((id): id is number => typeof id === "number")
      : [];
    const allowed = new Set(packages.map((p) => p.id));
    let matched = ids.filter((id) => allowed.has(id));

    // Hard fallback for follow-ups that the model fails to resolve
    if (
      matched.length === 0 &&
      lastMatchedIds.length > 0 &&
      (parsed.follow_up === true || isFollowUpAboutCurrentPackage(query))
    ) {
      matched = lastMatchedIds.filter((id) => allowed.has(id));
    }

    return matched;
  } catch {
    if (lastMatchedIds.length > 0 && isFollowUpAboutCurrentPackage(query)) {
      const allowed = new Set(packages.map((p) => p.id));
      return lastMatchedIds.filter((id) => allowed.has(id));
    }
    return [];
  }
}

async function fetchPackageDetails(
  ids: number[]
): Promise<PackageInterface[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        return await GET<PackageInterface>(API.PACKAGE.GET_BY_ID(id));
      } catch {
        return null;
      }
    })
  );
  return results.filter((pkg): pkg is PackageInterface => pkg != null);
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "👋 Hello! I'm MyTravelTown's AI travel assistant. Ask me about holiday packages, best places (state-wise / location-wise / weather-wise), destinations, itineraries, and trip planning. I only answer travel-related questions.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setAvailablePackages] = useState<PackageInterface[]>([]);

  const lastMatchedIdsRef = useRef<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchPackagesFromDb = async (): Promise<PackageInterface[]> => {
    try {
      const data = await GET<PackageInterface[]>(API.PACKAGE.GET_ALL, {});
      setAvailablePackages(data);
      return data;
    } catch {
      setAvailablePackages([]);
      return [];
    }
  };

  useEffect(() => {
    fetchPackagesFromDb();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const historyForIntent = messages;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userText,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    setInputValue("");
    setIsLoading(true);

    try {
      const isTravel = await checkTravelIntent(userText, historyForIntent);

      if (!isTravel) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            text: NON_TRAVEL_REPLY,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // Packages are recommended only when the user asks for them (or follows up on shown ones);
      // food, famous places and general travel questions get a plain answer.
      const shouldShowPackages =
        asksForPackages(userText) ||
        (lastMatchedIdsRef.current.length > 0 && asksAboutShownPackages(userText));

      const packages = shouldShowPackages ? await fetchPackagesFromDb() : [];

      const matchedIds = shouldShowPackages
        ? await selectMatchingPackageIds(
            userText,
            packages,
            historyForIntent,
            lastMatchedIdsRef.current
          )
        : [];

      const hasPackageMatches = matchedIds.length > 0;
      if (hasPackageMatches) {
        lastMatchedIdsRef.current = matchedIds;
      }

      const needsDetails = wantsPackageDetails(userText);
      let packagesForAnswer: PackageInterface[] = [];

      if (hasPackageMatches) {
        const matchedPackages = needsDetails
          ? await fetchPackageDetails(matchedIds)
          : packages.filter((p) => matchedIds.includes(p.id));

        // If detail fetch failed, fall back to list records
        packagesForAnswer =
          matchedPackages.length > 0
            ? matchedPackages
            : packages.filter((p) => matchedIds.includes(p.id));
      }

      const prompt = `
You are MyTravelTown AI — a travel-only assistant.

STRICT SCOPE:
- Answer ONLY travel-related questions.
- Allowed topics: holiday packages, destinations, best places to visit, famous places / landmarks / attractions, famous local food and dishes, popular restaurants / cafes / street-food spots, markets and shopping, weather for travel planning, best time to visit, state-wise / city-wise / location-wise recommendations, itineraries, hotels, meals, flights, budget trips, domestic/international travel advice.
- If somehow the question is not travel-related, reply exactly: "${NON_TRAVEL_REPLY}"

HOW TO ANSWER:
- Always answer in Markdown.
- Be helpful and practical for Indian and international travel.
- For weather / best time to visit / state-wise or location-wise "best places" questions: give clear travel advice even if no package is listed below.
- If the user says they are IN a location (e.g. "I am in Delhi"), recommend places, food and restaurants WITHIN that location, not trips or getaways from it.
- For famous food, restaurants or famous places of any location: answer from your own knowledge with a short list (5-8 items), each with one line on what it is and where to find it (area / market / street). For restaurants, name well-known, long-established places and add a short note that timings and availability should be checked before visiting. Do not make up restaurant names.
- When matched packages exist below, they are shown to the user as clickable cards (name, price, duration, route) right under your message.
  So NEVER list packages in text: no package names, no "Price:", "Duration:", "Route:" or "Highlights:" lines, no bullet list of packages. Write only a short, friendly 1-2 sentence intro (mention the count if more than one) and, if useful, one brief follow-up question.
- NEVER output JSON, curly-brace objects, field names like "id" or "package_name", or any raw database data. Plain readable sentences only.
- Never invent package names, prices, durations, or itinerary days that are not in the matched packages data.
${
  needsDetails && hasPackageMatches
    ? "- The user wants itinerary/details. In addition to the intro, present the day-wise itinerary from the database clearly (Day 1, Day 2, ... with activities, meals, hotel stars). If itinerary is missing, say itinerary details are not available in the database yet."
    : ""
}
${
  hasPackageMatches
    ? `- If the user asked for N options and fewer exist, show all matches and mention the count.
Matched packages from database:
${JSON.stringify(toDbSummaries(packagesForAnswer, needsDetails))}`
    : shouldShowPackages
      ? `- The user asked for packages but none in our database match this query. Say so briefly, then still answer the travel question helpfully.`
      : `- The user did NOT ask for packages. Answer only the question asked. Do NOT mention MyTravelTown packages, package counts, deals or bookings, and do not end with a question about packages.`
}

Conversation history:
${formatConversation(historyForIntent)}

User question:
${userText}
`;

      let botResponse: string;
      try {
        botResponse =
          stripRawData(await generateText(prompt)) ||
          packageFallbackText(packagesForAnswer, needsDetails);
        if (
          hasPackageMatches &&
          /couldn't find any matching package/i.test(botResponse)
        ) {
          botResponse = packageFallbackText(packagesForAnswer, needsDetails);
        } else if (hasPackageMatches && !needsDetails) {
          botResponse =
            stripPackageDetails(botResponse, packagesForAnswer) ||
            packageFallbackText(packagesForAnswer, needsDetails);
        }
      } catch (error) {
        console.error("Gemini answer generation failed", error);
        botResponse = hasPackageMatches
          ? packageFallbackText(packagesForAnswer, needsDetails)
          : FALLBACK_REPLY;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: botResponse,
          sender: "bot",
          timestamp: new Date(),
          packages: hasPackageMatches ? packagesForAnswer : undefined,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: FALLBACK_REPLY,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTravelIntent = async (
    query: string,
    history: Message[]
  ): Promise<boolean> => {
    // Fast path for obvious travel keywords (packages, places, weather, states, locations)
    if (looksLikeTravelQuery(query)) return true;

    const conversation = formatConversation(history, 10);

    const prompt = `
You are an AI intent classifier for MyTravelTown.

Decide if the CURRENT conversation is travel-related.

Return ONLY one word:
TRAVEL
or
NON_TRAVEL

TRAVEL includes ANY of these:
- Holiday / tour packages, bookings, price, itinerary, hotels, meals, flights
- Destinations, cities, states, countries, places to visit
- Famous places, landmarks, attractions, things to do in a location
- Famous local food, dishes, street food, restaurants, cafes, markets and shopping in a location
- Best places recommendations (state-wise, location-wise, city-wise, weather-wise)
- Weather for travel, best time to visit, climate for a trip
- Budget trips, honeymoon, family vacation, adventure travel, pilgrimage
- Travel tips, visa for travel, packing for a trip
- Follow-ups to a travel chat (e.g. "price", "hotel", "book now", "full detail", "itinerary", "this place", "what is included")

NON_TRAVEL includes:
- Programming, maths, science homework, movies, songs, colours, jokes (unrelated), sports scores, politics, coding, general knowledge unrelated to travel

Rules:
- Consider BOTH conversation history and the latest user message.
- When unsure but the message mentions a place/destination/trip/weather/package, return TRAVEL.
- If the conversation switches away from travel to unrelated topics, return NON_TRAVEL.

Conversation History:
${conversation}

Latest User Message:
${query}

Answer:
`;

    try {
      const answer = (await generateText(prompt)).trim().toUpperCase();
      // Prefer explicit NON_TRAVEL so "NON_TRAVEL" is not treated as travel via substring "TRAVEL"
      if (answer.includes("NON_TRAVEL") || answer.includes("NONTRAVEL")) {
        return false;
      }
      return answer.includes("TRAVEL");
    } catch {
      // Fail closed: only answer when we can verify travel intent (or keyword match above)
      return looksLikeTravelQuery(query);
    }
  };

  return (
    <>
      {/* The launcher hides while the chat is open; the panel header has its own close button. */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-4 sm:right-6 z-40 rounded-full hover:scale-110 transition-all flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32"
        >
          <ChatBotLauncherIcon className="w-full h-full" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed z-40 bg-white rounded-2xl shadow-2xl border flex flex-col animate-in fade-in slide-in-from-bottom-2 transition-all duration-300 ${
            isExpanded
              ? "bottom-6 right-4 sm:right-6 w-[80vw] h-[80vh] max-h-[calc(100vh-3rem)] max-w-[calc(100vw-2rem)]"
              : "bottom-6 left-4 right-4 sm:left-auto sm:right-6 w-auto sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none max-h-[min(500px,70vh)]"
          }`}
        >
          <div className="bg-brand text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="fw-semibold">MyTravelTown</h3>
              <p className="text-caption opacity-90">AI Travel Assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded((v) => !v)}
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                className="hidden sm:flex p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="flex p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${m.sender === "user" ? "bg-brand text-white" : "bg-gray-100 prose text-body-sm"}`}
                >
                  {m.sender === "bot" ? (
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  ) : (
                    <p>{m.text}</p>
                  )}
                </div>
                {m.packages && m.packages.length > 0 && (
                  <div
                    className={
                      isExpanded
                        ? "mt-2 w-full grid grid-cols-2 lg:grid-cols-3 gap-3"
                        : "mt-2 w-full max-w-[80%] flex flex-col gap-2"
                    }
                  >
                    {m.packages.map((pkg) => (
                      <ChatPackageCard key={pkg.id} pkg={pkg} expanded={isExpanded} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="p-2">
                <Loader2 className="animate-spin w-5 h-5" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t">
            <div className="flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Ask travel: packages, places, weather..."
              />
              <button
                disabled={isLoading}
                className="bg-brand text-white p-2 rounded-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
