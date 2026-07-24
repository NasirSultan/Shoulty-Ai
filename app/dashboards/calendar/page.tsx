"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminHeader from "../AdminHeader";
import {
  resolveGeneratorProfileFields,
  streamGeneratePosts,
} from "@/api/postGeneratorApi";
import { createMonthlyPlan, getUserPlan, getPostDetail, updateCalendarPost, createCalendarPost, createManualPost } from "@/api/calendarApi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { API_BASE_URL } from "@/api/configApi";
import { publishPost, schedulePosts, Platform } from "@/api/autopostApi";

// ── Types ──────────────────────────────────────────────────────────────────
type Status = "scheduled" | "draft" | "published";
type PostType = "image" | "reel" | "carousel" | "story";
type PlatKey = "ig" | "fb" | "li" | "tw" | "tk" | "yt" | "th";
type ViewMode = "7d" | "month";
type RpTab = "accounts" | "ideas" | "analytics";

interface TimeSlot { t: string; e: string; best: boolean }
interface Post {
  id: number;
  /** Real backend postId (UUID) — set only for posts loaded from GET /api/calendar/plan.
   *  Posts created locally (not yet synced) have no backendId. */
  backendId?: string;
  date: Date;
  caption: string;
  hashtags: string[];
  plats: PlatKey[];
  type: PostType;
  timeStr: string;
  timesOptions: TimeSlot[];
  img: string;
  score: number;
  status: Status;
  reach: number;
  engRate: string;
  isAI: boolean;
}

type PostUpsert = Omit<Partial<Post>, "id"> & { id: number | null; imgFile?: File | null };

// ── Constants ──────────────────────────────────────────────────────────────
const PLAT_COLORS: Record<PlatKey, string> = {
  ig: "#E1306C", li: "#0A66C2", tw: "#1DA1F2",
  fb: "#1877F2", tk: "#111111", yt: "#FF0000", th: "#555555",
};
const PLAT_ICONS: Record<PlatKey, string> = {
  ig: "fa-instagram", li: "fa-linkedin", tw: "fa-x-twitter",
  fb: "fa-facebook", tk: "fa-tiktok", yt: "fa-youtube", th: "fa-threads",
};
const PLAT_NAMES: Record<PlatKey, string> = {
  ig: "Instagram", li: "LinkedIn", tw: "Twitter/X",
  fb: "Facebook", tk: "TikTok", yt: "YouTube", th: "Threads",
};
// `backendKey` maps to GET /api/autopost/connection-status's `platform` field.
// Platforms with no backendKey have no connect flow yet — always shown as not connected.
const CONN_PLATS = [
  { id:"tw",  name:"X",          icon:"fa-x-twitter", color:"#000000", backendKey: null            },
  { id:"li",  name:"LinkedIn",   icon:"fa-linkedin",  color:"#0A66C2", backendKey: "LINKEDIN"       },
  { id:"ig",  name:"Instagram",  icon:"fa-instagram", color:"#E1306C", backendKey: "INSTAGRAM"      },
  { id:"tk",  name:"TikTok",     icon:"fa-tiktok",    color:"#333333", backendKey: null             },
  { id:"fb",  name:"Facebook",   icon:"fa-facebook",  color:"#1877F2", backendKey: "FACEBOOK"       },
  { id:"th",  name:"Threads",    icon:"fa-threads",   color:"#000000", backendKey: null             },
  { id:"bs",  name:"Bluesky",    icon:"fa-bluesky",   color:"#0085FF", backendKey: null             },
  { id:"yt",  name:"YouTube",    icon:"fa-youtube",   color:"#FF0000", backendKey: null             },
  { id:"pi",  name:"Pinterest",  icon:"fa-pinterest", color:"#BD081C", backendKey: null             },
  { id:"gb",  name:"Google Biz", icon:"fa-google",    color:"#4285F4", backendKey: null             },
];
const TYPE_INFO: Record<PostType, { label: string; icon: string; bg: string }> = {
  image:    { label: "Image",    icon: "fa-image",             bg: "#3B82F6" },
  reel:     { label: "Reel",     icon: "fa-clapperboard",      bg: "#EC4899" },
  carousel: { label: "Carousel", icon: "fa-table-cells-large", bg: "#F97316" },
  story:    { label: "Story",    icon: "fa-mobile-screen",     bg: "#F59E0B" },
};
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=75",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=75",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=75",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=75",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=75",
  "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&q=75",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=75",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=75",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
  "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=75",
];

const TOPIC_IMAGE_MAP: Record<string, string[]> = {
  food: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=75",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=75",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=75",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75",
  ],
  fitness: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=75",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=75",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=75",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=75",
  ],
  business: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=75",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=75",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=75",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=75",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=75",
  ],
  realestate: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=75",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=75",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=75",
    "https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=600&q=75",
  ],
  tech: [
    "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=600&q=75",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=75",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=75",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=75",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=75",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=75",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=75",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=75",
  ],
  travel: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=75",
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=75",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=75",
  ],
};

const KEYWORD_TO_TOPIC: Record<string, string> = {
  food:"food",restaurant:"food",kitchen:"food",cook:"food",eat:"food",menu:"food",chef:"food",
  pizza:"food",salad:"food",meal:"food",dinner:"food",lunch:"food",recipe:"food",burger:"food",
  gym:"fitness",fitness:"fitness",workout:"fitness",exercise:"fitness",transform:"fitness",
  training:"fitness",muscle:"fitness",athlete:"fitness",run:"fitness",lifting:"fitness",
  growth:"business",strategy:"business",brand:"business",marketing:"business",reach:"business",
  content:"business",revenue:"business",business:"business",organic:"business",startup:"business",
  founder:"business",entrepreneur:"business",hack:"business",follower:"business",analytics:"business",
  ads:"business",thread:"business",users:"business",community:"business",
  house:"realestate",home:"realestate",property:"realestate",listed:"realestate",bedroom:"realestate",
  victorian:"realestate",estate:"realestate",listing:"realestate",mortgage:"realestate",
  ai:"tech",tool:"tech",tech:"tech",digital:"tech",software:"tech",app:"tech",data:"tech",
  automation:"tech",algorithm:"tech",model:"tech",
  collection:"fashion",fashion:"fashion",summer:"fashion",drop:"fashion",style:"fashion",outfit:"fashion",
  wear:"fashion",clothing:"fashion",pieces:"fashion",look:"fashion",
  travel:"travel",adventure:"travel",wanderlust:"travel",beach:"travel",explore:"travel",trip:"travel",
  destination:"travel",vacation:"travel",island:"travel",
};

function pickRelevantImage(caption: string, currentImg: string): string {
  const words = caption.toLowerCase().split(/\W+/);
  const topicCounts: Record<string, number> = {};
  for (const word of words) {
    const topic = KEYWORD_TO_TOPIC[word];
    if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const pool = topTopic && TOPIC_IMAGE_MAP[topTopic] ? TOPIC_IMAGE_MAP[topTopic] : STOCK_IMAGES;
  const choices = pool.filter(i => i !== currentImg);
  return choices.length > 0 ? choices[Math.floor(Math.random() * choices.length)] : pool[0];
}

function detectTopicFromCaption(caption: string): string | null {
  const words = caption.toLowerCase().split(/\W+/);
  const topicCounts: Record<string, number> = {};
  for (const word of words) {
    const topic = KEYWORD_TO_TOPIC[word];
    if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  return Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
}

function detectTopicFromImageUrl(imageUrl: string): string | null {
  if (!imageUrl) return null;
  const normalized = imageUrl.split("?")[0];
  for (const [topic, urls] of Object.entries(TOPIC_IMAGE_MAP)) {
    if (urls.some((url) => normalized.includes(url.split("?")[0]))) return topic;
  }
  return null;
}
const CAPTIONS_POOL = [
  "3 growth hacks that tripled our organic reach in 30 days — no paid ads, just strategy 🚀",
  "Behind the kitchen at 9 PM — this is what building a brand looks like 🔥",
  "New drop just landed ✨ Our summer collection is here — swipe to see all 12 pieces.",
  "The market update you actually need this week 📊 Full breakdown below.",
  "30-day transformation: from 0 to 5K followers using only organic content 💪",
  "Just listed: 4-bed Victorian in prime location — open house Sunday 🏡",
  "We just crossed 100K users — here's everything we got wrong in year 1 🧵",
  "AI isn't replacing your job — someone using AI is. 5 tools you need.",
  "Thread: 5 things we stopped doing and revenue went up 40%.",
  "Content strategy that generated $200K in 90 days 🧵",
];
const HASHTAG_POOLS = [
  ["#GrowthHacking","#ContentStrategy","#DigitalMarketing","#SocialMedia","#BuildInPublic"],
  ["#FoodPhotography","#RestaurantLife","#NewMenu","#FoodieLife","#ChefLife"],
  ["#FitnessMotivation","#GymLife","#WorkoutOfTheDay","#HealthyLifestyle","#FitFam"],
  ["#RealEstate","#JustListed","#DreamHome","#PropertyForSale","#HomeBuying"],
  ["#Startup","#Entrepreneurship","#VentureCapital","#Founder","#TechStartup"],
  ["#Fashion","#OOTD","#StyleInspo","#NewCollection","#SustainableFashion"],
  ["#Travel","#HiddenGems","#Wanderlust","#TravelPhotography","#Adventure"],
];
const TOPIC_HASHTAG_MAP: Record<string, string[]> = {
  business: ["#GrowthHacking", "#ContentStrategy", "#DigitalMarketing", "#SocialMedia", "#BuildInPublic"],
  food: ["#FoodPhotography", "#RestaurantLife", "#NewMenu", "#FoodieLife", "#ChefLife"],
  fitness: ["#FitnessMotivation", "#GymLife", "#WorkoutOfTheDay", "#HealthyLifestyle", "#FitFam"],
  realestate: ["#RealEstate", "#JustListed", "#DreamHome", "#PropertyForSale", "#HomeBuying"],
  tech: ["#TechStartup", "#AItools", "#Automation", "#DigitalStrategy", "#Innovation"],
  fashion: ["#Fashion", "#OOTD", "#StyleInspo", "#NewCollection", "#SustainableFashion"],
  travel: ["#Travel", "#HiddenGems", "#Wanderlust", "#TravelPhotography", "#Adventure"],
};
const TIMES_POOL: TimeSlot[][] = [
  [{ t:"7:45 AM",e:"9.2%",best:true},{t:"12:00 PM",e:"6.1%",best:false},{t:"6:30 PM",e:"10.4%",best:true},{t:"9:00 PM",e:"7.8%",best:false}],
  [{ t:"8:30 AM",e:"8.8%",best:true},{t:"1:00 PM",e:"7.4%",best:false},{t:"7:00 PM",e:"9.6%",best:true},{t:"10:00 PM",e:"6.3%",best:false}],
  [{ t:"9:00 AM",e:"7.6%",best:false},{t:"12:30 PM",e:"8.2%",best:true},{t:"5:45 PM",e:"9.8%",best:true},{t:"8:30 PM",e:"7.1%",best:false}],
];
const PLAT_COMBOS: PlatKey[][] = [
  ["ig"],["fb"],["li"],["tw"],["tk"],["ig","fb"],["ig","li"],["li","tw"],["ig","tk"],["fb","ig","li"],
];
const TYPE_POOL: PostType[] = ["image","image","reel","carousel","image","reel","image","story"];
const AI_CAPTIONS_REWRITE = [
  "3 viral growth hacks that tripled our organic reach — no paid ads, pure strategy. Save this. 🚀 The exact framework below.",
  "The algorithm rewards depth, not frequency. Here's how we grew from 2K to 100K in 8 months without a single paid post. 🧵",
  "Stop chasing trends. Build a brand. The brands winning on social in 2026 post with intention, not volume. Thread ↓ ✨",
];
const IDEAS_LIST = [
  { emoji:"🔥", title:"Behind-the-scenes Reel", sub:"High virality · Est. 11% eng", score:94, col:"#EF4444", bg:"#FEF2F2" },
  { emoji:"💡", title:"Myth-busting thread", sub:"Educational · LinkedIn + X", score:88, col:"#F59E0B", bg:"#FFFBEB" },
  { emoji:"📊", title:"Market update carousel", sub:"High saves · Wed 9AM peak", score:83, col:"#3B82F6", bg:"#EFF6FF" },
  { emoji:"✨", title:"Transformation story", sub:"Trust-builder · All platforms", score:79, col:"#10B981", bg:"#ECFDF5" },
  { emoji:"🎯", title:"Audience poll: next content?", sub:"Engagement spike · Stories", score:73, col:"#F97316", bg:"#EEEEFF" },
  { emoji:"🚀", title:"Product launch countdown", sub:"3-part series · Instagram", score:91, col:"#EC4899", bg:"#FDF2F8" },
];
const ACCOUNTS_DATA = [
  { plat:"ig" as PlatKey, name:"Instagram", handle:"@brandname", color:"#E1306C", followers:"47.2K", posts:"312", eng:"8.4%", connected:true },
  { plat:"fb" as PlatKey, name:"Facebook", handle:"BrandName Page", color:"#1877F2", followers:"28.5K", posts:"198", eng:"4.2%", connected:true },
  { plat:"tw" as PlatKey, name:"Twitter / X", handle:"@brandname", color:"#1DA1F2", followers:"19.1K", posts:"2.4K", eng:"5.6%", connected:true },
  { plat:"li" as PlatKey, name:"LinkedIn", handle:"Brand Name Co.", color:"#0A66C2", followers:"12.8K", posts:"145", eng:"7.8%", connected:true },
  { plat:"th" as PlatKey, name:"Threads", handle:"@brandname", color:"#333333", followers:"8.4K", posts:"97", eng:"6.1%", connected:true },
  { plat:"yt" as PlatKey, name:"YouTube", handle:"Brand Name Official", color:"#FF0000", followers:"5.2K", posts:"64", eng:"9.7%", connected:false },
  { plat:"tk" as PlatKey, name:"TikTok", handle:"@brandname", color:"#111111", followers:"31.9K", posts:"203", eng:"11.2%", connected:false },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const rnd = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const toIso = (d: Date) =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const FALLBACK_CALENDAR_IMAGE = STOCK_IMAGES[0];

const mapPlatKeyToPlatform = (pk: PlatKey): Platform | null => {
  switch (pk) {
    case "ig": return "instagram";
    case "fb": return "facebook";
    case "li": return "linkedin";
    case "yt": return "youtube";
    default: return null;
  }
};

const imageFingerprint = (src?: string | null) => {
  const value = (src || "").trim();
  if (!value) return "";

  // Treat URL variants with different query/hash as the same image.
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`.toLowerCase();
  } catch {
    return value.split("?")[0].split("#")[0].toLowerCase();
  }
};

// Reel media can be a real video file (.mp4 etc.) — rendering it inside an
// <img> tag never works, and the browser wastes several seconds downloading
// the whole video before onError finally fires. Detect it up front and use
// the fallback image immediately instead of waiting for that doomed load.
const VIDEO_FILE_RE = /\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i;
const isVideoUrl = (src?: string | null) => !!src && VIDEO_FILE_RE.test(src.trim());

const safeImageSrc = (src?: string | null) => {
  const value = (src || "").trim();
  if (!value || isVideoUrl(value)) return FALLBACK_CALENDAR_IMAGE;
  return value;
};

const onCalendarImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const target = event.currentTarget;
  if (target.dataset.fallbackApplied === "1") return;
  target.dataset.fallbackApplied = "1";
  target.src = FALLBACK_CALENDAR_IMAGE;
};

async function getSelectedSubIndustryImages(subIndustryId: string): Promise<string[]> {
  const response = await fetch(
    `/api/display-images?subIndustryId=${encodeURIComponent(subIndustryId)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch selected images (${response.status})`);
  }

  const data = (await response.json()) as
    | {
        images?: Array<{ file?: string; url?: string } | string>;
      }
    | undefined;

  const urls = (data?.images || [])
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return (item?.file || item?.url || "").trim();
    })
    .filter(Boolean);

  const dedupedByFingerprint: string[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    const key = imageFingerprint(url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    dedupedByFingerprint.push(url);
  }

  return dedupedByFingerprint;
}

function buildRelevantHashtags(caption: string, imageUrl?: string): string[] {
  const topic = detectTopicFromCaption(caption) || detectTopicFromImageUrl(imageUrl || "") || "business";
  const topicTags = TOPIC_HASHTAG_MAP[topic] || TOPIC_HASHTAG_MAP.business;
  const dynamicTags = Array.from(
    new Set(
      caption
        .split(/\W+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4)
        .filter((word) => !KEYWORD_TO_TOPIC[word.toLowerCase()])
        .slice(0, 2)
        .map((word) => `#${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    )
  );
  return [...dynamicTags, ...topicTags].slice(0, 5);
}

function normalizeGeneratedContent(
  rawText?: string,
  rawHashtags?: string[]
): { caption: string; hashtags: string[] } {
  const fallbackCaption = (rawText || "").trim();
  const fallbackHashtags = rawHashtags || [];

  if (!fallbackCaption) {
    return { caption: "", hashtags: fallbackHashtags };
  }

  const parseNode = (node: unknown): { caption: string; hashtags: string[] } | null => {
    if (!node || typeof node !== "object") return null;
    const record = node as Record<string, unknown>;
    const text = typeof record.text === "string" ? record.text.trim() : "";
    const hashtags = Array.isArray(record.hashtags)
      ? record.hashtags.filter((tag): tag is string => typeof tag === "string")
      : [];
    if (!text) return null;
    return { caption: text, hashtags: hashtags.length ? hashtags : fallbackHashtags };
  };

  // Case 1: Valid JSON object/array payload.
  try {
    const parsed = JSON.parse(fallbackCaption) as unknown;
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const normalized = parseNode(item);
        if (normalized) return normalized;
      }
    } else {
      const normalized = parseNode(parsed);
      if (normalized) return normalized;
    }
  } catch {
    // Continue with tolerant parsing below.
  }

  // Case 2: Multiple JSON objects concatenated in one string.
  const textMatch = fallbackCaption.match(/"text"\s*:\s*"([\s\S]*?)"\s*,\s*"hashtags"/);
  if (textMatch?.[1]) {
    const caption = textMatch[1]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .trim();
    if (caption) return { caption, hashtags: fallbackHashtags };
  }

  // Final fallback: plain text as-is.
  return { caption: fallbackCaption, hashtags: fallbackHashtags };
}

/** Maps backend connectedSocials values (e.g. "FACEBOOK") to local PlatKey codes. */
function mapConnectedSocialsToPlats(connectedSocials?: unknown[]): PlatKey[] {
  const SOCIAL_TO_PLAT: Record<string, PlatKey> = {
    FACEBOOK: "fb", INSTAGRAM: "ig", LINKEDIN: "li",
    TWITTER: "tw", X: "tw", TIKTOK: "tk", YOUTUBE: "yt", THREADS: "th",
  };
  const mapped = (connectedSocials || [])
    .map((s) => SOCIAL_TO_PLAT[String(s).toUpperCase()])
    .filter((p): p is PlatKey => Boolean(p));
  return mapped.length > 0 ? mapped : ["ig"];
}

/** The backend's status field isn't limited to our three known values (e.g.
 *  PROCESSING/FAILED also appear elsewhere in the API) — normalize anything
 *  unrecognized to "scheduled" instead of letting an unknown string through. */
function normalizeStatus(raw?: string): Status {
  const lower = raw?.toLowerCase();
  if (lower === "scheduled") return "scheduled";
  if (lower === "draft") return "draft";
  // Backend uses "POSTED" for published content, not "PUBLISHED" — accept both.
  if (lower === "published" || lower === "posted") return "published";
  return "scheduled";
}

/** Maps a single post from GET /api/calendar/plan into the calendar's local Post shape. */
function mapBackendPlanPost(
  backendPost: { postId?: string; postTime: string; status: string; content: { text: string; hashtags: string[] }; media: { type: string; file: string } },
  id: number,
  img: string,
  plats: PlatKey[]
): Post {
  const postDate = new Date(backendPost.postTime);
  const normalized = normalizeGeneratedContent(backendPost.content?.text, backendPost.content?.hashtags || []);
  return {
    id,
    backendId: backendPost.postId,
    date: postDate,
    caption: normalized.caption,
    hashtags: normalized.hashtags.length > 0 ? normalized.hashtags : buildRelevantHashtags(normalized.caption),
    plats,
    type: backendPost.media?.type === "REEL" ? "reel" : "image" as PostType,
    timeStr: postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timesOptions: TIMES_POOL[0],
    img,
    score: rndInt(75, 95),
    status: normalizeStatus(backendPost.status),
    // The backend doesn't return reach/engagement for scheduled-but-unpublished
    // posts — 0/"—" rather than a fabricated number.
    reach: 0,
    engRate: "—",
    isAI: true,
  };
}


function seedPosts(baseDate: Date): Post[] {
  const posts: Post[] = [];
  const today = startOfDay(baseDate);
  let id = 1;
  for (let offset = -6; offset <= 58; offset++) {
    const count = rndInt(0, offset < 0 ? 2 : offset <= 0 ? 3 : offset < 25 ? 4 : 3);
    for (let i = 0; i < count; i++) {
      const d = new Date(today); d.setDate(d.getDate() + offset);
      const times = rnd(TIMES_POOL);
      const best = times.find(t => t.best) || times[0];
      let status: Status = "scheduled";
      if (offset < 0) status = "published";
      else if (offset === 0 && i === 0) status = "published";
      else if (rndInt(0, 5) === 0) status = "draft";
      posts.push({ id: id++, date: new Date(d), caption: rnd(CAPTIONS_POOL), hashtags: rnd(HASHTAG_POOLS).slice(0, rndInt(3, 5)), plats: rnd(PLAT_COMBOS), type: rnd(TYPE_POOL), timeStr: best.t, timesOptions: times, img: rnd(STOCK_IMAGES), score: rndInt(55, 97), status, reach: rndInt(8, 130) * 1000, engRate: best.e, isAI: offset > 10 });
    }
  }
  for (let offset = 59; offset <= 210; offset++) {
    const count = rndInt(2, 5);
    for (let i = 0; i < count; i++) {
      const d = new Date(today); d.setDate(d.getDate() + offset);
      const times = rnd(TIMES_POOL);
      const best = times.find(t => t.best) || times[0];
      posts.push({ id: id++, date: new Date(d), caption: rnd(CAPTIONS_POOL), hashtags: rnd(HASHTAG_POOLS).slice(0, rndInt(3, 5)), plats: rnd(PLAT_COMBOS), type: rnd(TYPE_POOL), timeStr: best.t, timesOptions: times, img: rnd(STOCK_IMAGES), score: rndInt(68, 96), status: "scheduled", reach: rndInt(12, 110) * 1000, engRate: best.e, isAI: true });
    }
  }
  return posts;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function PostCard({ p, onOpen, onDup, onDel, onPublishNow }: { p: Post; onOpen: () => void; onDup: () => void; onDel: () => void; onPublishNow: () => void }) {
  const meta = TYPE_INFO[p.type];
  const scoreColor = p.score >= 80 ? "#10B981" : p.score >= 60 ? "#F59E0B" : "#EF4444";
  const statusColors: Record<Status, { bg: string; color: string }> = {
    scheduled: { bg: "#EFF6FF", color: "#3B82F6" },
    draft:     { bg: "#FFFBEB", color: "#F59E0B" },
    published: { bg: "#ECFDF5", color: "#10B981" },
  };
  const ss = statusColors[p.status] || statusColors.scheduled;
  return (
    <div className="post-card" onClick={onOpen} style={{ background: "#fff", border: "1px solid #E2E4F0", borderRadius: 10, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(11,12,26,.06)", position: "relative", marginBottom: 6 }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={safeImageSrc(p.img)} onError={onCalendarImageError} alt="" style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} loading="lazy" />
        <div style={{ position: "absolute", top: 5, left: 5, display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: meta.bg + "aa", color: "#fff", fontSize: 9.5, fontWeight: 800, fontFamily: "Sora,sans-serif" }}>
          <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 8 }} />&nbsp;{meta.label}
        </div>
        <div style={{ position: "absolute", bottom: 5, right: 5, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,.5)", color: scoreColor, fontSize: 9.5, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", display: "flex", alignItems: "center", gap: 2 }}>
          <i className="fa-solid fa-chart-simple" style={{ fontSize: 7 }} />{p.score}
        </div>
      </div>
      <div style={{ height: 3, background: PLAT_COLORS[p.plats[0]] }} />
      <div style={{ padding: "7px 9px 9px" }}>
        <div style={{ fontSize: 11.5, color: p.caption?.trim() ? "#3D3F60" : "#BFC1D9", fontStyle: p.caption?.trim() ? "normal" : "italic", lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 5 }}>{p.caption?.trim() || "No content"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
          {p.hashtags.length > 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "#F97316", fontFamily: "JetBrains Mono,monospace", padding: "1px 5px", borderRadius: 3, background: "#EEEEFF" }}>{p.hashtags[0]}</span>
          )}
          {p.hashtags.length > 1 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#BFC1D9" }}>…</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", fontFamily: "JetBrains Mono,monospace", display: "flex", alignItems: "center", gap: 3 }}>
            <i className="fa-regular fa-clock" style={{ fontSize: 9 }} />{p.timeStr}
          </span>
          <span style={{ padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: ss.bg, color: ss.color }}>
            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ p, onOpen, onDup, onDel, onPublishNow }: { p: Post; onOpen: () => void; onDup: () => void; onDel: () => void; onPublishNow: () => void }) {
  const meta = TYPE_INFO[p.type];
  const scoreColor = p.score >= 80 ? "#10B981" : p.score >= 60 ? "#F59E0B" : "#EF4444";
  const statusColors: Record<Status, { bg: string; color: string }> = {
    scheduled: { bg: "#EFF6FF", color: "#3B82F6" },
    draft:     { bg: "#FFFBEB", color: "#F59E0B" },
    published: { bg: "#ECFDF5", color: "#10B981" },
  };
  const ss = statusColors[p.status] || statusColors.scheduled;

  // Handle card click - only open modal, prevent any other actions
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen();
  };

  return (
    <div className="mmc" onClick={handleCardClick} style={{ background: "#fff", border: "1px solid #E2E4F0", borderRadius: 8, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(11,12,26,.06)", position: "relative", marginBottom: 5, flexShrink: 0 }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={safeImageSrc(p.img)} onError={onCalendarImageError} alt="" style={{ width: "100%", height: 70, objectFit: "cover", display: "block" }} loading="lazy" />
        <div style={{ position: "absolute", top: 4, left: 4, padding: "2px 6px", borderRadius: 3, background: meta.bg + "bb", color: "#fff", fontSize: 8.5, fontWeight: 800, fontFamily: "Sora,sans-serif" }}>
          <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 7 }} />&nbsp;{meta.label}
        </div>
        <div style={{ position: "absolute", bottom: 3, right: 4, padding: "1px 5px", borderRadius: 3, background: "rgba(0,0,0,.52)", color: scoreColor, fontSize: 8.5, fontWeight: 800, fontFamily: "JetBrains Mono,monospace" }}>
          {p.score}
        </div>
      </div>
      <div style={{ height: 2.5, background: PLAT_COLORS[p.plats[0]] }} />
      <div style={{ padding: "5px 7px 6px" }}>
        <div style={{ fontSize: 10.5, color: p.caption?.trim() ? "#3D3F60" : "#BFC1D9", fontStyle: p.caption?.trim() ? "normal" : "italic", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 4 }}>{p.caption?.trim() || "No content"}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#10B981", fontFamily: "JetBrains Mono,monospace", display: "flex", alignItems: "center", gap: 2 }}>
            <i className="fa-regular fa-clock" style={{ fontSize: 8 }} />{p.timeStr}
          </span>
          <span style={{ padding: "1px 5px", borderRadius: 8, fontSize: 9, fontWeight: 700, background: ss.bg, color: ss.color }}>
            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
interface ModalState {
  open: boolean;
  postId: number | null;
  initDate: Date | null;
}

function EditModal({ state, posts, today, onClose, onSave, onPublishNow, onCreateAndPublishNow, onDelete, onDuplicate, showToast, user, industrySelection }: {
  state: ModalState;
  posts: Post[];
  today: Date;
  onClose: () => void;
  onSave: (data: PostUpsert) => void;
  onPublishNow: (data: PostUpsert) => Promise<void>;
  onCreateAndPublishNow: (data: PostUpsert) => Promise<void>;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  showToast: (msg: string, type: string) => void;
  user: Record<string, unknown> | null | undefined;
  industrySelection: { industryId: string; subIndustryId: string } | null | undefined;
}) {
  console.log(state);
  const p = state.postId ? posts.find(x => x.id === state.postId) : null;
  const [caption, setCaption] = useState("");
  const [dateVal, setDateVal] = useState("");
  const [typeVal, setTypeVal] = useState<PostType>("image");
  const [selPlats, setSelPlats] = useState<PlatKey[]>(["ig"]);
  const [status, setStatus] = useState<Status>("scheduled");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selTime, setSelTime] = useState("");
  const [timesOpts, setTimesOpts] = useState<TimeSlot[]>(TIMES_POOL[0]);
  const [score, setScore] = useState(75);
  const [img, setImg] = useState(STOCK_IMAGES[0]);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [showImagePreviewPopup, setShowImagePreviewPopup] = useState(false);
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const imgInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImg(url);       // local preview only — never sent to the backend
    setImgFile(file);  // the actual file — this is what gets uploaded
    showToast("🖼️ Image updated!", "green");
    e.target.value = "";
  };

  useEffect(() => {
    if (!state.open) return;
    if (p) {
      setCaption(p.caption); setDateVal(toIso(p.date)); setTypeVal(p.type);
      setSelPlats(p.plats); setStatus(p.status); setTags(p.hashtags);
      setSelTime(p.timeStr); setTimesOpts(p.timesOptions); setScore(p.score); setImg(p.img);
      setImgFile(null); // editing an existing post — no new file selected yet
    } else {
      setCaption(""); setDateVal(toIso(state.initDate || today)); setTypeVal("image");
      setSelPlats(["ig"]); setStatus("scheduled"); setTags(rnd(HASHTAG_POOLS));
      const t = rnd(TIMES_POOL); setTimesOpts(t); setSelTime(t.find(x => x.best)?.t || t[0].t);
      setScore(rndInt(62, 94)); setImg(rnd(STOCK_IMAGES));
      setImgFile(null); // starting with a stock image, not an uploaded file
    }
    setShowImagePreviewPopup(false);
    setImageZoom(1); setImagePan({ x: 0, y: 0 }); setIsPanningImage(false);
  }, [state.open, state.postId]);

  const clampZoom = (value: number) => Math.min(4, Math.max(1, value));

  const zoomInImage = () => {
    setImageZoom((prev) => clampZoom(prev + 0.25));
  };

  const zoomOutImage = () => {
    setImageZoom((prev) => {
      const next = clampZoom(prev - 0.25);
      if (next === 1) {
        setImagePan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const resetImageView = () => {
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
    setIsPanningImage(false);
  };

  const onPreviewMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (imageZoom <= 1) return;
    event.preventDefault();
    setIsPanningImage(true);
    panStartRef.current = { x: event.clientX, y: event.clientY };
    panOriginRef.current = { ...imagePan };
  };

  const onPreviewMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanningImage || imageZoom <= 1) return;
    event.preventDefault();
    const dx = event.clientX - panStartRef.current.x;
    const dy = event.clientY - panStartRef.current.y;
    setImagePan({
      x: panOriginRef.current.x + dx,
      y: panOriginRef.current.y + dy,
    });
  };

  const stopImagePanning = () => {
    if (!isPanningImage) return;
    setIsPanningImage(false);
  };

  const togglePlat = (pl: PlatKey) => setSelPlats(prev => prev.includes(pl) ? prev.filter(x => x !== pl) : [...prev, pl]);

  const applyCaptionWithRelatedTags = (nextCaption: string) => {
    setCaption(nextCaption);
    if (nextCaption.trim()) {
      setTags(buildRelevantHashtags(nextCaption, img));
    }
  };

  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const v = tagInput.trim().replace(/^#+/, "").replace(/,$/, "");
      if (v && tags.length < 10) { setTags(prev => [...prev, "#" + v]); setTagInput(""); }
    }
  };

  const handlePublishNowAction = async () => {
    if (isPublishingNow) return;
    if (!caption.trim()) {
      captionRef.current?.reportValidity();
      return;
    }

    const payload: PostUpsert = {
      id: p?.id ?? null,
      backendId: p?.backendId,
      caption,
      date: dateVal ? new Date(dateVal) : today,
      type: typeVal,
      plats: selPlats.length ? selPlats : ["ig"],
      hashtags: tags,
      status: "published",
      timeStr: selTime,
      timesOptions: timesOpts,
      img,
      imgFile,
      score,
      reach: rndInt(10, 80) * 1000,
      engRate: "8.5%",
      isAI: false,
    };

    setIsPublishingNow(true);
    try {
      if (p?.backendId) {
        // Editing an existing, already-synced post — unchanged behavior.
        await onPublishNow(payload);
      } else {
        // Brand-new post from "Add Post" — create it first, then publish it.
        await onCreateAndPublishNow(payload);
      }
      onClose();
    } catch (error) {
      // toast shown in parent — keep the modal open so the user can retry.
    } finally {
      setIsPublishingNow(false);
    }
  };

  if (!state.open) return null;
  return (
    <div onClick={e => { if ((e.target as HTMLElement).id === "modal-backdrop") onClose(); }} id="modal-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(11,12,26,.44)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="cal-modal-card" style={{ background: "#fff", border: "1px solid #E2E4F0", borderRadius: 18, width: 880, maxWidth: "100%", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 32px 80px rgba(11,12,26,.2)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #E2E4F0", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-pen" style={{ color: "#F97316" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>{p ? "Edit Post" : "New Post"}</div>
            <div style={{ fontSize: 12, color: "#8486AB", marginTop: 1 }}>{p ? fmt(p.date) + " · " + p.timeStr : state.initDate ? "Scheduling for " + fmt(state.initDate) : "Fill in details below"}</div>
          </div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#8486AB", cursor: "pointer" }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 14 }} />
          </div>
        </div>
        {/* Body */}
        <div className="cal-modal-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel */}
          <div className="cal-modal-left" style={{ width: 240, flexShrink: 0, background: "#F0F1F9", borderRight: "1px solid #E2E4F0", display: "flex", flexDirection: "column" }}>
            <div
              style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 160, cursor: "pointer" }}
              onClick={() => setShowImagePreviewPopup(true)}
              title="Click to preview image"
            >
              <img src={safeImageSrc(img)} onError={(event) => { onCalendarImageError(event); setImg(FALLBACK_CALENDAR_IMAGE); }} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(11,12,26,.38)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: 0, transition: "opacity .18s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "0")}
              >
                <i className="fa-solid fa-expand" style={{ color: "#fff", fontSize: 20 }} />
                <span style={{ color: "#fff", fontSize: 11.5, fontWeight: 700, fontFamily: "Sora,sans-serif" }}>Preview Image</span>
              </div>
              <input ref={imgInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImgUpload} />
            </div>
            {/* Image action buttons */}
            <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderTop: "1px solid #E2E4F0" }}>
              <button onClick={e => { e.stopPropagation(); imgInputRef.current?.click(); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 8px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                <i className="fa-solid fa-upload" style={{ fontSize: 10 }} /> Upload
              </button>
            </div>
            {/* Platforms */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #E2E4F0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", marginBottom: 6, fontFamily: "Sora,sans-serif" }}>Platforms</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {(["ig","fb","li","tw","tk","yt","th"] as PlatKey[]).map(pl => {
                  const on = selPlats.includes(pl);
                  return (
                    <div key={pl} onClick={() => togglePlat(pl)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 6, border: `1.5px solid ${on ? PLAT_COLORS[pl] : "#E2E4F0"}`, background: on ? PLAT_COLORS[pl] : "#fff", color: on ? "#fff" : "#8486AB", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                      <i className={`fa-brands ${PLAT_ICONS[pl]}`} style={{ fontSize: 10 }} />{pl.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Form */}
          <div className="cal-modal-form" style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Caption */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6 }}>Caption</div>
              <textarea ref={captionRef} required value={caption} onChange={e => applyCaptionWithRelatedTags(e.target.value)} placeholder="Write your caption here…"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F0F1F9", color: "#0B0C1A", fontSize: 13.5, outline: "none", resize: "none", minHeight: 80, fontFamily: "inherit", lineHeight: 1.6 }} />
              <div style={{ textAlign: "right", fontSize: 11, color: "#BFC1D9", fontFamily: "JetBrains Mono,monospace", marginTop: 3 }}>{caption.length} / 2200</div>
            </div>
            {/* Hashtags */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6, display: "flex", alignItems: "center" }}>
                Hashtags
                <span onClick={() => { setTags(buildRelevantHashtags(caption, img)); showToast("✦ Related hashtags added!", "brand"); }} style={{ marginLeft: "auto", fontSize: 11, color: "#F97316", fontWeight: 700, cursor: "pointer", textTransform: "none", letterSpacing: 0 }}>✦ Refresh</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 10px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F0F1F9", minHeight: 44 }}>
                {tags.map((t, i) => (
                  <div key={t + i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "#EEEEFF", border: "1px solid #DDDDFB", color: "#F97316", fontSize: 11.5, fontWeight: 600, fontFamily: "JetBrains Mono,monospace" }}>
                    {t} <span onClick={() => setTags(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 14, opacity: 0.55, cursor: "pointer", lineHeight: 1 }}>×</span>
                  </div>
                ))}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={onTagKey} placeholder="Type tag + Enter…"
                  style={{ flex: 1, minWidth: 80, background: "none", border: "none", outline: "none", fontSize: 12.5, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }} />
              </div>
            </div>
            {/* Date + Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6 }}>Date</div>
                <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F0F1F9", color: "#0B0C1A", fontSize: 13.5, outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6 }}>Post Type</div>
                <select value={typeVal} onChange={e => setTypeVal(e.target.value as PostType)} style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F0F1F9", color: "#0B0C1A", fontSize: 13.5, outline: "none", fontFamily: "inherit" }}>
                  <option value="image">📸 Image</option>
                  <option value="reel">🎬 Reel</option>
                  <option value="carousel">🎠 Carousel</option>
                  <option value="story">📖 Story</option>
                </select>
              </div>
            </div>
            {/* Time slots */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                Best Posting Times
                <span style={{ padding: "2px 7px", borderRadius: 8, background: "#EEEEFF", color: "#F97316", fontSize: 10, fontWeight: 700, textTransform: "none", letterSpacing: 0 }}>AI Powered</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
                {timesOpts.map(s => {
                  const selected = s.t === selTime;
                  const engClass = parseFloat(s.e) > 9 ? "#10B981" : parseFloat(s.e) > 7 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={s.t} onClick={() => setSelTime(s.t)} style={{ padding: "7px 5px", borderRadius: 7, border: `1.5px solid ${selected ? (s.best ? "#10B981" : "#F97316") : s.best ? "rgba(16,185,129,.3)" : "#E2E4F0"}`, background: selected ? (s.best ? "#ECFDF5" : "#EEEEFF") : s.best ? "#ECFDF5" : "#F0F1F9", textAlign: "center", cursor: "pointer" }}>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>{s.t}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono,monospace", marginTop: 2, color: engClass }}>{s.e}</div>
                      {s.best && <span style={{ display: "block", fontSize: 9, fontWeight: 800, color: "#10B981", marginTop: 1, fontFamily: "Sora,sans-serif" }}>⚡ Best</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="cal-modal-footer" style={{ padding: "12px 20px", borderTop: "1px solid #E2E4F0", display: "flex", gap: 8, alignItems: "center", background: "#F0F1F9", flexShrink: 0 }}>
          <div className="cal-modal-footer-utils" style={{ display: "flex", gap: 6 }}>
            {p && [
              { label:"Delete", icon:"fa-trash", danger:true, action:() => { onDelete(p.id); onClose(); } },
              { label:"Duplicate", icon:"fa-copy", danger:false, action:() => { onDuplicate(p.id); onClose(); } },
              { label:"Download", icon:"fa-download", danger:false, action:() => showToast("⬇️ Downloading…","brand") },
            ].map(btn => (
              <div key={btn.label} onClick={btn.action} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 7, border: `1px solid ${btn.danger ? "rgba(239,68,68,.2)" : "#E2E4F0"}`, background: btn.danger ? "#FEF2F2" : "#fff", color: btn.danger ? "#EF4444" : "#3D3F60", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <i className={`fa-solid ${btn.icon}`} style={{ fontSize: 11 }} /> {btn.label}
              </div>
            ))}
          </div>
          <div className="cal-modal-footer-primary" style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button
              onClick={() => {
                void handlePublishNowAction();
              }}
              disabled={isPublishingNow}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 7, background: isPublishingNow ? "#9496B5" : "#10B981", color: "#fff", fontSize: 13, fontWeight: 800, cursor: isPublishingNow ? "not-allowed" : "pointer", border: "none", fontFamily: "Sora,sans-serif" }}
            >
              <i className="fa-solid fa-paper-plane" style={{ fontSize: 12 }} />
              {isPublishingNow ? "Publishing..." : "Publish Now"}
            </button>
            <button onClick={() => {
                if (!caption.trim()) { captionRef.current?.reportValidity(); return; }
                onSave({ id: p?.id ?? null, caption, date: dateVal ? new Date(dateVal) : today, type: typeVal, plats: selPlats.length ? selPlats : ["ig"], hashtags: tags, status, timeStr: selTime, timesOptions: timesOpts, img, imgFile, score, reach: rndInt(10, 80) * 1000, engRate: "8.5%", isAI: false });
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 7, background: "linear-gradient(115deg,#F97316,#EA580C)", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 14px rgba(249,115,22,.4)" }}>
              <i className="fa-solid fa-calendar-check" style={{ fontSize: 12 }} /> Save & Schedule
            </button>
          </div>
        </div>
      </div>
      {showImagePreviewPopup && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 710, background: "rgba(11,12,26,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowImagePreviewPopup(false);
              resetImageView();
            }
          }}
        >
          <div style={{ width: "100%", maxWidth: 980, maxHeight: "88vh", background: "#fff", borderRadius: 12, border: "1px solid #E2E4F0", boxShadow: "0 24px 60px rgba(11,12,26,.28)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #E2E4F0", gap: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>Image Preview</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={zoomOutImage}
                  disabled={imageZoom <= 1}
                  style={{ minWidth: 34, height: 30, borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", cursor: imageZoom <= 1 ? "not-allowed" : "pointer", opacity: imageZoom <= 1 ? 0.45 : 1 }}
                  aria-label="Zoom out"
                >
                  <i className="fa-solid fa-magnifying-glass-minus" />
                </button>
                <button
                  onClick={zoomInImage}
                  disabled={imageZoom >= 4}
                  style={{ minWidth: 34, height: 30, borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", cursor: imageZoom >= 4 ? "not-allowed" : "pointer", opacity: imageZoom >= 4 ? 0.45 : 1 }}
                  aria-label="Zoom in"
                >
                  <i className="fa-solid fa-magnifying-glass-plus" />
                </button>
                <button
                  onClick={resetImageView}
                  style={{ height: 30, borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "0 10px" }}
                >
                  Reset
                </button>
                <div style={{ minWidth: 56, textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "#F97316", fontFamily: "JetBrains Mono,monospace" }}>
                  {Math.round(imageZoom * 100)}%
                </div>
                <button
                  onClick={() => { setShowImagePreviewPopup(false); resetImageView(); }}
                  style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#8486AB", cursor: "pointer" }}
                  aria-label="Close image preview"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
            <div
              style={{ padding: 14, background: "#F0F1F9", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, overflow: "hidden", cursor: imageZoom > 1 ? (isPanningImage ? "grabbing" : "grab") : "default" }}
              onMouseDown={onPreviewMouseDown}
              onMouseMove={onPreviewMouseMove}
              onMouseUp={stopImagePanning}
              onMouseLeave={stopImagePanning}
            >
              <img
                src={safeImageSrc(img)}
                onError={(event) => { onCalendarImageError(event); setImg(FALLBACK_CALENDAR_IMAGE); }}
                alt="Post preview"
                draggable={false}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  maxHeight: "calc(88vh - 90px)",
                  objectFit: "contain",
                  borderRadius: 10,
                  border: "1px solid #E2E4F0",
                  background: "#fff",
                  userSelect: "none",
                  transform: `translate(${imagePan.x}px, ${imagePan.y}px) scale(${imageZoom})`,
                  transformOrigin: "center center",
                  transition: isPanningImage ? "none" : "transform .15s ease",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Right Panel ────────────────────────────────────────────────────────────
function RightPanel({ rpTab, setRpTab, posts, onOpen, onAddIdea, showToast, onOpenFacebookConnect }: {
  rpTab: RpTab; setRpTab: (t: RpTab) => void; posts: Post[];
  onOpen: (id: number) => void; onAddIdea: (idea: typeof IDEAS_LIST[0]) => void;
  showToast: (msg: string, type: string) => void;
  onOpenFacebookConnect: () => void;
}) {
  const upcoming = posts.filter(p => p.status === "scheduled").sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);
  return (
    <div style={{ width: 272, flexShrink: 0, background: "#fff", borderLeft: "1px solid #E2E4F0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #E2E4F0", flexShrink: 0 }}>
        {(["accounts","ideas","analytics"] as RpTab[]).map(t => (
          <div key={t} onClick={() => setRpTab(t)} style={{ flex: 1, padding: "12px 6px", textAlign: "center", fontSize: 12, fontWeight: 700, color: rpTab === t ? "#F97316" : "#8486AB", cursor: "pointer", fontFamily: "Sora,sans-serif", position: "relative", borderBottom: rpTab === t ? "2px solid #F97316" : "2px solid transparent" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {rpTab === "accounts" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB", fontFamily: "Sora,sans-serif" }}>Connected Accounts</div>
              <div onClick={onOpenFacebookConnect} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: "#EEEEFF", color: "#F97316", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid #DDDDFB" }}>
                <i className="fa-solid fa-plus" style={{ fontSize: 9 }} /> Add Account
              </div>
            </div>
            {ACCOUNTS_DATA.map(acc => (
              <div key={acc.plat} style={{ background: "#F0F1F9", border: `1.5px solid ${acc.connected ? acc.color + "33" : "#E2E4F0"}`, borderRadius: 10, padding: "11px 13px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: acc.color, borderRadius: "0 2px 2px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: acc.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, flexShrink: 0 }}>
                    <i className={`fa-brands ${PLAT_ICONS[acc.plat]}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: "#8486AB", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.handle}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: acc.connected ? "#ECFDF5" : "#FEF2F2", color: acc.connected ? "#10B981" : "#EF4444", flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                    {acc.connected ? "Live" : "Disconnected"}
                  </div>
                </div>
                {acc.connected ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                    {[{ v:acc.followers, l:"Followers"},{v:acc.posts,l:"Posts"},{v:acc.eng,l:"Eng Rate"}].map(s => (
                      <div key={s.l} style={{ background: "#fff", border: "1px solid #ECEDF8", borderRadius: 6, padding: "5px 7px", textAlign: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>{s.v}</div>
                        <div style={{ fontSize: 9.5, color: "#8486AB", marginTop: 1 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "8px 0", textAlign: "center", fontSize: 11.5, color: "#8486AB", background: "#fff", borderRadius: 7, marginBottom: 8 }}>Account disconnected</div>
                )}
                <div style={{ display: "flex", gap: 5 }}>
                  {acc.connected ? (
                    <>
                      <div onClick={() => showToast(`📊 Opening ${acc.name} analytics…`,"brand")} style={{ flex: 1, padding: 6, borderRadius: 6, background: acc.color, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: "Sora,sans-serif" }}>Analytics</div>
                      <div onClick={() => showToast(`⚙️ ${acc.name} settings…`,"brand")} style={{ flex: 1, padding: 6, borderRadius: 6, background: "#fff", border: "1px solid #E2E4F0", color: "#3D3F60", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>Settings</div>
                    </>
                  ) : (
                    <div onClick={() => showToast(`🔗 Reconnecting ${acc.name}…`,"green")} style={{ flex: 1, padding: 6, borderRadius: 6, background: acc.color, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: "Sora,sans-serif" }}>Reconnect Account</div>
                  )}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginTop: 16, marginBottom: 8 }}>Next Scheduled</div>
            {upcoming.map(p => (
              <div key={p.id} onClick={() => onOpen(p.id)} style={{ display: "flex", gap: 7, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #ECEDF8", cursor: "pointer" }}>
                <img src={safeImageSrc(p.img)} onError={onCalendarImageError} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: "#0B0C1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{p.caption}</div>
                  <div style={{ fontSize: 10, color: "#8486AB", display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PLAT_COLORS[p.plats[0]], flexShrink: 0 }} />{fmt(p.date)} · {p.timeStr}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {rpTab === "ideas" && (
          <>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 8 }}>AI Content Ideas</div>
            {IDEAS_LIST.map(idea => (
              <div key={idea.title} style={{ background: "#F0F1F9", border: "1px solid #ECEDF8", borderRadius: 8, padding: "9px 10px", marginBottom: 6, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 16 }}>{idea.emoji}</div>
                  <div style={{ padding: "2px 7px", borderRadius: 8, fontSize: 11, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", background: idea.bg, color: idea.col }}>{idea.score}</div>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0B0C1A", marginBottom: 2 }}>{idea.title}</div>
                <div style={{ fontSize: 11, color: "#8486AB" }}>{idea.sub}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                  <div onClick={() => onAddIdea(idea)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 6, background: "#EEEEFF", color: "#F97316", fontSize: 11, fontWeight: 700, fontFamily: "Sora,sans-serif", cursor: "pointer" }}>
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> Use Idea
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {rpTab === "analytics" && (
          <>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 8 }}>This Month</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              {[{v:"8.7%",l:"Avg Engagement",d:"↑ +1.2%"},{v:"2.1M",l:"Est. Reach",d:"↑ +18%"},{v:"147K",l:"Followers",d:"↑ +12%"},{v:"68",l:"Posts",d:"↑ +8"}].map(c => (
                <div key={c.l} style={{ background: "#F0F1F9", border: "1px solid #ECEDF8", borderRadius: 8, padding: "9px 10px" }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.3px" }}>{c.v}</div>
                  <div style={{ fontSize: 10.5, color: "#8486AB", marginTop: 2 }}>{c.l}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono,monospace", marginTop: 3, color: "#10B981" }}>{c.d}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 8 }}>Engagement by Platform</div>
            {[{l:"Instagram",v:11.3},{l:"LinkedIn",v:7.8},{l:"Twitter/X",v:5.4},{l:"Facebook",v:4.2},{l:"TikTok",v:9.7},{l:"YouTube",v:8.1},{l:"Threads",v:6.3}].map(r => (
              <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0", borderBottom: "1px solid #ECEDF8" }}>
                <div style={{ fontSize: 11.5, color: "#3D3F60", width: 68, flexShrink: 0 }}>{r.l}</div>
                <div style={{ flex: 1, height: 5, background: "#E2E4F0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#F97316,#EA580C)", width: `${r.v * 7.5}%` }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0B0C1A", width: 32, textAlign: "right", fontFamily: "JetBrains Mono,monospace" }}>{r.v}%</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: "", type: "green" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (msg: string, type = "green") => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setToast({ visible: true, msg, type });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  };
  return { toast, show };
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const router = useRouter();
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextId, setNextId] = useState(10000);
  const [connectedPlats, setConnectedPlats] = useState<Record<string, boolean>>({});
  const [connLoading, setConnLoading] = useState(true);
  const { user } = useUserProfile();
  const [profileSetupWarning, setProfileSetupWarning] = useState<string | null>(null);
  const [industrySelection, setIndustrySelection] = useState<{
    industryId: string;
    subIndustryId: string;
    industryName?: string;
    subIndustryName?: string;
  } | null>(null);

  // ── Fetch industry selection from dedicated API ───────────────────────────
  useEffect(() => {
    const fetchIndustrySelection = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/users/me/industry-selection`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const industry = data?.industry;
        const subIndustry = data?.subIndustry;
        if (industry?.id && subIndustry?.id) {
          setIndustrySelection({
            industryId: String(industry.id),
            subIndustryId: String(subIndustry.id),
            industryName: industry.name,
            subIndustryName: subIndustry.name,
          });
          setProfileSetupWarning(null);
        } else {
          setProfileSetupWarning("Industry and sub-industry are not set yet. Calendar is available, but AI planning and generation will be limited.");
        }
      } catch {
        // silently fail — user can still use calendar
      }
    };
    fetchIndustrySelection();
  }, []);

  // ── Case #1: Profile Setup Guard (non-blocking) ───────────────────────────
  useEffect(() => {
    if (industrySelection) {
      setProfileSetupWarning(null);
    }
  }, [industrySelection]);

  // ── Load the live plan from the authenticated backend on mount ───────────
  // Replaces the old localStorage cache read: GET /api/calendar/plan is now
  // the single source of truth for what's shown on this page — including which
  // platforms are "connected" (meta.connectedSocials), so the Connected
  // Accounts widget can never disagree with what the plan actually targets.
  useEffect(() => {
    const loadPlanFromBackend = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
      if (!token) { setConnLoading(false); return; }
      try {
        const planResponse = await getUserPlan(token);

        const connectedSocials = planResponse.meta?.connectedSocials || [];
        const byPlatform: Record<string, boolean> = {};
        connectedSocials.forEach((s) => { byPlatform[String(s).toUpperCase()] = true; });
        setConnectedPlats(byPlatform);

        if (!planResponse.success || !planResponse.posts || planResponse.posts.length === 0) return;

        const plats = mapConnectedSocialsToPlats(connectedSocials);
        const mapped = planResponse.posts
          .map((backendPost, index) =>
            mapBackendPlanPost(backendPost, 10000 + index, backendPost.media?.file || FALLBACK_CALENDAR_IMAGE, plats)
          )
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        setPosts(mapped);
        setNextId(Math.max(10000, ...mapped.map((post) => post.id + 1)));
      } catch (error) {
        console.warn("Failed to load calendar plan from backend:", error);
      } finally {
        setConnLoading(false);
      }
    };
    void loadPlanFromBackend();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const syncToday = () => {
      const nextToday = startOfDay(new Date());
      setToday(prev => sameDay(prev, nextToday) ? prev : nextToday);
    };

    const timer = setInterval(syncToday, 60000);
    syncToday();
    return () => clearInterval(timer);
  }, []);
  const [view, setView] = useState<ViewMode>("7d");
  const [offset, setOffset] = useState(0);
  const [platFilter, setPlatFilter] = useState<PlatKey | "all">("all");
  const [search, setSearch] = useState("");
  const [rpTab, setRpTab] = useState<RpTab>("accounts");
  const [modal, setModal] = useState<ModalState>({ open: false, postId: null, initDate: null });
  const [planPostTime, setPlanPostTime] = useState("10:00");
  const [planLoading, setPlanLoading] = useState(false);
  const planTimeRef = useRef<HTMLInputElement>(null);
  const connCarouselRef = useRef<HTMLDivElement>(null);
  const scrollConnCarousel = (dir: 1 | -1) => {
    connCarouselRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };
  const weekRowRef = useRef<HTMLDivElement>(null);
  const [weekActiveCol, setWeekActiveCol] = useState(0);
  const scrollWeekRow = (dir: 1 | -1) => {
    const el = weekRowRef.current;
    if (!el) return;
    const colWidth = el.firstElementChild?.getBoundingClientRect().width || el.clientWidth * 0.82;
    el.scrollBy({ left: dir * colWidth, behavior: "smooth" });
  };
  const onWeekRowScroll = () => {
    const el = weekRowRef.current;
    if (!el || !el.firstElementChild) return;
    const colWidth = (el.firstElementChild as HTMLElement).getBoundingClientRect().width;
    setWeekActiveCol(Math.round(el.scrollLeft / colWidth));
  };
  const { toast, show: showToast } = useToast();

  const filtered = posts.filter(p => {
    if (platFilter !== "all" && !p.plats.includes(platFilter)) return false;
    if (search) { const q = search.toLowerCase(); if (!p.caption.toLowerCase().includes(q) && !p.hashtags.join(" ").toLowerCase().includes(q)) return false; }
    return true;
  });

  const getAnchorFor = useCallback((offsetVal: number) => {
    const d = new Date(today);
    if (view === "7d") {
      // ── Case #3: Weekly Filter (rolling 7 days) ─────────────────────────────────────
      // Weekly view starts from today and spans the next 7 days.
      d.setDate(d.getDate() + offsetVal * 7);
    } else {
      d.setDate(1);
      d.setMonth(d.getMonth() + offsetVal);
    }
    return d;
  }, [today, view]);

  const getAnchor = useCallback(() => getAnchorFor(offset), [getAnchorFor, offset]);

  // Disable "next" once there's nothing scheduled beyond the currently visible period.
  const canGoForward = useMemo(() => {
    if (!posts.length) return false;
    const maxPostDate = posts.reduce((max, p) => (p.date > max ? p.date : max), posts[0].date);
    const nextAnchor = getAnchorFor(offset + 1);
    if (view === "7d") return nextAnchor <= maxPostDate;
    return (
      nextAnchor.getFullYear() < maxPostDate.getFullYear() ||
      (nextAnchor.getFullYear() === maxPostDate.getFullYear() && nextAnchor.getMonth() <= maxPostDate.getMonth())
    );
  }, [posts, getAnchorFor, offset, view]);

  const periodTitle = (() => {
    const d = getAnchor();
    if (view === "7d") {
      const end = new Date(d); end.setDate(d.getDate() + 6);
      const fmtFull = (x: Date) => `${MONTHS[x.getMonth()]} ${x.getDate()}`;
      return d.getMonth() === end.getMonth()
        ? `${fmtFull(d)} – ${end.getDate()}, ${d.getFullYear()}`
        : `${fmtFull(d)} – ${fmtFull(end)}, ${end.getFullYear()}`;
    }
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  })();

  const openModal = (id: number | null, date?: Date) => {
    setModal({ open: true, postId: id, initDate: date ?? null });

    // Best-effort refresh from the authenticated backend so edits start from
    // the latest saved state, not a possibly-stale in-memory copy.
    const target = id ? posts.find(p => p.id === id) : null;
    if (target?.backendId) {
      const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
      if (token) {
        getPostDetail(target.backendId, token)
          .then((res) => {
            if (!res.success || !res.post) return;
            const normalized = normalizeGeneratedContent(res.post.content?.text, res.post.content?.hashtags || []);
            const freshStatusLower = res.post.status?.toLowerCase();
            const freshStatus: Status | null =
              freshStatusLower === "scheduled" ? "scheduled" :
              freshStatusLower === "draft" ? "draft" :
              // Backend uses "POSTED" for published content, not "PUBLISHED".
              (freshStatusLower === "published" || freshStatusLower === "posted") ? "published" :
              null;
            setPosts(prev => prev.map(p => p.id === id ? {
              ...p,
              caption: normalized.caption || p.caption,
              hashtags: normalized.hashtags.length > 0 ? normalized.hashtags : p.hashtags,
              img: res.post!.media?.file || p.img,
              status: freshStatus ?? p.status,
            } : p));
          })
          .catch((error) => console.warn("Failed to refresh post detail from backend:", error));
      }
    }
  };
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  /** Combines a post's date + "h:mm AM/PM" timeStr into a real Date object. */
  const toScheduledDate = (post: Post) => {
    const [time, modifier] = post.timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const scheduledDate = new Date(post.date);
    scheduledDate.setHours(hours, minutes, 0, 0);
    return scheduledDate;
  };

  /** Syncs a brand-new local post to POST /api/calendar/post/manual. Any date is
   *  supported now — the backend no longer restricts creation to today, and no
   *  longer needs subIndustryId from the client (it resolves the user's real
   *  niche server-side). Returns the new backendId and the real hosted image
   *  URL (if an image was involved), or undefined values if it couldn't be
   *  synced (kept local-only in that case). */
  const syncNewPostToBackend = async (
    post: Post,
    imgFile?: File | null,
    opts?: { silent?: boolean }
  ): Promise<{ backendId?: string; imageUrl?: string }> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
    if (!token) return {};

    const d = toScheduledDate(post);

    try {
      const res = await createManualPost({
        postTime: d.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        contentText: `${post.caption}\n\n${post.hashtags.join(" ")}`,
        // Only send imageUrl when there's no raw file — otherwise the file
        // itself is uploaded instead, and sending a blob: preview here was
        // the original bug (blob: URLs are only valid in the tab that
        // created them, so they never load anywhere else).
        imageUrl: imgFile ? undefined : (post.img || undefined),
      }, token, imgFile ?? undefined);
      const created = res.post as { postId?: string; media?: { file?: string } } | undefined;
      return { backendId: created?.postId, imageUrl: created?.media?.file };
    } catch (err) {
      console.warn("Failed to sync new post to backend:", err);
      if (!opts?.silent) {
        showToast("Saved locally, but backend sync failed.", "amber");
      }
      return {};
    }
  };
  const savePost = async (data: PostUpsert) => {
    let savedPost: Post | undefined;
    if (data.id) {
      setPosts(prev => {
        const updated = prev.map(p => p.id === data.id ? { ...p, ...data } as Post : p);
        savedPost = updated.find((item) => item.id === data.id);
        return updated;
      });
      showToast("✅ Post updated!", "green");
      if (savedPost?.backendId) {
        const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
        if (token) {
          try {
            const statusMap: Partial<Record<Status, string>> = {
              scheduled: "SCHEDULED",
              published: "POSTED",
              // "draft" intentionally omitted — no backend equivalent exists yet,
              // so we leave the post's existing backend status untouched.
            };

            const res = await updateCalendarPost(savedPost.backendId, {
              postTime: toScheduledDate(savedPost).toISOString(),
              contentText: `${savedPost.caption}\n\n${savedPost.hashtags.join(" ")}`,
              // Only send imageUrl when there's no new raw file — sending a
              // stale blob: preview here was the original bug.
              imageUrl: data.imgFile ? undefined : savedPost.img,
              ...(statusMap[savedPost.status] ? { status: statusMap[savedPost.status] } : {}),
            }, token, data.imgFile ?? undefined);

            // Swap the local blob preview for the real hosted URL the backend
            // returns, so this session's view matches what everyone else sees
            // right away instead of only after the next reload.
            const updatedMedia = (res?.post as { media?: { file?: string } } | undefined)?.media;
            if (data.imgFile && updatedMedia?.file) {
              setPosts(prev => prev.map(p => p.id === data.id ? { ...p, img: updatedMedia.file! } : p));
            }
          } catch (err) {
            console.warn("Failed to sync post update to backend:", err);
            showToast("Updated locally, but backend sync failed.", "amber");
          }
        }
      }
    } else {
      const defaultTimes = TIMES_POOL[0];
      const newPost: Post = {
        id: nextId,
        date: data.date || today,
        caption: data.caption || "",
        hashtags: data.hashtags || [],
        plats: data.plats || ["ig"],
        type: data.type || "image",
        timeStr: data.timeStr || defaultTimes[0].t,
        timesOptions: data.timesOptions || defaultTimes,
        img: data.img || "",
        score: data.score || 80,
        status: data.status || "scheduled",
        reach: data.reach || 0,
        engRate: data.engRate || "8.5%",
        isAI: data.isAI || false,
      };
      savedPost = newPost;
      setPosts(prev => [...prev, newPost]);
      setNextId(n => n + 1);
      showToast("✅ Post scheduled!", "green");

      const { backendId, imageUrl } = await syncNewPostToBackend(newPost, data.imgFile);
      if (backendId) {
        setPosts(prev => prev.map(p => p.id === newPost.id
          ? { ...p, backendId, ...(data.imgFile && imageUrl ? { img: imageUrl } : {}) }
          : p
        ));
      }
    }

    // —— Auto Posting Integration ——
    if (savedPost && savedPost.status === "scheduled") {
      const platforms = (savedPost.plats || [])
        .map(pk => mapPlatKeyToPlatform(pk))
        .filter((p): p is Platform => p !== null && p !== "youtube");

      if (platforms.length > 0) {
        try {
          const content = `${savedPost.caption}\n\n${savedPost.hashtags.join(" ")}`;
          await schedulePosts({
            platforms,
            posts: [{
              content,
              scheduledAt: toScheduledDate(savedPost).toISOString(),
              mediaUrls: savedPost.img ? [savedPost.img] : undefined,
            }]
          });
        } catch (err) {
          console.error("Auto-scheduling failed:", err);
          showToast("Saved locally, but auto-scheduling failed.", "amber");
        }
      }
    }

    closeModal();
  };
  const publishPostNow = async (data: PostUpsert) => {
    console.log(data.backendId);
    if (!data.backendId) {
      throw new Error("This post hasn't been synced to the server yet, so it can't be published.");
    }

    try {
      const token = localStorage.getItem("shoutly_token");

      const res = await fetch(
        `https://ai-shoutly-backend.onrender.com/api/calendar/post/${data.backendId}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to publish post.");
      }

      showToast(result.message || "✅ Post is being published now", "green");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to publish post.";
      showToast(message, "red");
      throw error;
    }
  };

  /** Used when "Publish Now" is clicked from the create modal (no existing post
   *  yet). Creates the post via the same path savePost's create-branch uses
   *  (syncNewPostToBackend → createManualPost), then immediately publishes it
   *  via the existing publishPostNow. If sync fails, the post still exists
   *  locally as "scheduled" — nothing is lost, it just can't auto-publish yet.
   *  If publish fails after a successful sync, the post stays saved and
   *  "scheduled" in the calendar so it can be published manually later. */
  const createAndPublishNow = async (data: PostUpsert) => {
    const defaultTimes = TIMES_POOL[0];
    const newPost: Post = {
      id: nextId,
      date: data.date || today,
      caption: data.caption || "",
      hashtags: data.hashtags || [],
      plats: data.plats || ["ig"],
      type: data.type || "image",
      timeStr: data.timeStr || defaultTimes[0].t,
      timesOptions: data.timesOptions || defaultTimes,
      img: data.img || "",
      score: data.score || 80,
      status: "scheduled",
      reach: data.reach || 0,
      engRate: data.engRate || "8.5%",
      isAI: data.isAI || false,
    };

    setPosts(prev => [...prev, newPost]);
    setNextId(n => n + 1);

    const { backendId, imageUrl } = await syncNewPostToBackend(newPost, data.imgFile, { silent: true });
    if (!backendId) {
      showToast("Saved locally, but couldn't sync to the server — publish it manually once it's synced.", "amber");
      return;
    }

    setPosts(prev => prev.map(p => p.id === newPost.id
      ? { ...p, backendId, ...(data.imgFile && imageUrl ? { img: imageUrl } : {}) }
      : p
    ));

    await publishPostNow({ ...data, id: newPost.id, backendId });
    setPosts(prev => prev.map(p => p.id === newPost.id ? { ...p, status: "published" } : p));
  };

  const publishExistingPostNow = async (id: number) => {
    const post = posts.find((item) => item.id === id);
    if (!post) {
      showToast("Post not found.", "red");
      return;
    }
    if (!post.backendId) {
      showToast("This post hasn't been synced to the server yet, so it can't be published.", "red");
      return;
    }

    try {
      await publishPostNow({
        ...post,
        id: post.id,
        backendId: post.backendId,
      });
    } catch (err) {
      // toast already shown in publishPostNow
    }
  };

  const deletePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast("🗑️ Post deleted", "red");
  };
  const dupPost = (id: number) => {
    const p = posts.find(x => x.id === id);
    if (p) {
      const d = new Date(p.date);
      d.setDate(d.getDate() + 1);
      const duplicated: Post = { ...p, id: nextId, status: "draft", date: d, backendId: undefined };
      setPosts(prev => [...prev, duplicated]);
      setNextId(n => n + 1);
      showToast("📋 Duplicated", "brand");

      void syncNewPostToBackend(duplicated, undefined, { silent: true }).then(({ backendId }) => {
        if (backendId) setPosts(prev => prev.map(p2 => p2.id === duplicated.id ? { ...p2, backendId } : p2));
      });
    }
  };

  const addIdeaPost = (idea: typeof IDEAS_LIST[0]) => {
    showToast(`✦ Generating: "${idea.title}"…`, "brand");
    setTimeout(() => {
      const d = new Date(today.getTime() + rndInt(3, 14) * 86400000);
      const generatedPost: Post = {
        id: nextId,
        date: d,
        caption: rnd(CAPTIONS_POOL),
        hashtags: rnd(HASHTAG_POOLS),
        plats: rnd(PLAT_COMBOS),
        type: rnd(TYPE_POOL),
        timeStr: "7:45 AM",
        timesOptions: rnd(TIMES_POOL),
        img: rnd(STOCK_IMAGES),
        score: rndInt(72, 96),
        status: "scheduled",
        reach: rndInt(20, 90) * 1000,
        engRate: "9.1%",
        isAI: true,
      };
      setPosts(prev => [...prev, generatedPost]);
      setNextId(n => n + 1);
      showToast("✅ Post generated!", "green");

      void syncNewPostToBackend(generatedPost, undefined, { silent: true }).then(({ backendId }) => {
        if (backendId) setPosts(prev => prev.map(p => p.id === generatedPost.id ? { ...p, backendId } : p));
      });
    }, 1400);
  };

  const createPlanDirect = async () => {
    if (planLoading) return;

    const resolved = resolveGeneratorProfileFields(
      (user ?? null) as Record<string, unknown> | null
    );
    const effectiveSubIndustry = industrySelection?.subIndustryId || resolved.subIndustryId;

    if (!effectiveSubIndustry) {
      showToast("Please select your industry in Settings first.", "red");
      setTimeout(() => { window.location.href = "/dashboards/settings"; }, 1200);
      return;
    }

    // Creating a plan replaces whatever plan currently exists on the backend —
    // verify with the user before wiping their existing scheduled posts.
    if (posts.length > 0) {
      const confirmed = typeof window !== "undefined" && window.confirm(
        `This will replace your current plan with a brand-new one for ${industrySelection?.subIndustryName || "the selected industry"}. Continue?`
      );
      if (!confirmed) return;
    }

    const prompt = `Create a complete monthly content plan for ${effectiveSubIndustry}, including educational, engagement, promotional, and trend-based posts.`;
    const startId = nextId;

    setPlanLoading(true);
    try {
      const token = (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null) ?? "";

      console.log("📤 [createMonthlyPlan] request:", { postTime: planPostTime });

      const response = await createMonthlyPlan(
        { postTime: planPostTime },
        token
      );

      console.log("📥 [createMonthlyPlan] response:", response);

      if (!response.success) {
        const msg = response.message || "";
        if (msg === "Please select an industry first.") {
          showToast("Please select your industry in Settings first.", "red");
          setTimeout(() => { window.location.href = "/dashboards/settings"; }, 1200);
          return;
        }
        if (msg === "Payment required. Please subscribe to a plan to continue.") {
          showToast("A subscription is required. Redirecting to billing…", "amber");
          setTimeout(() => { window.location.href = "/dashboards/settings/billing"; }, 1200);
          return;
        }
        if (msg.toLowerCase().includes("session expired") || msg.toLowerCase().includes("unauthorized")) {
          showToast("Service authentication error — please contact support.", "red");
          return;
        }
        showToast(msg || "Failed to create plan", "red");
        return;
      }

      // The create response already contains the fully resolved post list
      // (content text/hashtags, media file URL) — no need for a follow-up
      // GET /api/calendar/plan call, and no risk of it disagreeing with what
      // was just created.
      if (!response.posts || response.posts.length === 0) {
        showToast("Monthly plan created, but no posts were returned", "amber");
        return;
      }

      // Unlike GET /api/calendar/plan, the create response has no
      // meta.connectedSocials field — reuse what was already loaded from the
      // page-mount GET call instead of assuming/defaulting.
      const connectedSocials = Object.keys(connectedPlats).filter((k) => connectedPlats[k]);
      const planPlats = mapConnectedSocialsToPlats(connectedSocials);
      const mappedPosts = response.posts
        .map((backendPost, index) =>
          mapBackendPlanPost(backendPost, startId + index, backendPost.media?.file || FALLBACK_CALENDAR_IMAGE, planPlats)
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // GET /api/calendar/plan is the single source of truth — a newly created
      // plan REPLACES whatever plan existed before on the backend, so the local
      // state must fully replace too, not merge on top of stale posts from the
      // previous industry/plan.
      setPosts(mappedPosts);
      setNextId(Math.max(10000, startId + mappedPosts.length + 1));
      // Land on the week the plan actually starts (today), not month view —
      // month view always renders from the 1st, showing empty days before
      // the plan's first post even though it's scheduled starting today.
      setView("7d");
      setOffset(0);
      showToast(`✅ Plan created and ${mappedPosts.length} posts added to calendar`, "green");
    } catch (error) {
      console.log("❌ [createMonthlyPlan] error:", error);
      // ── Handle 401 Unauthorized (session expired) ────────────────────────────
      const statusCode = (error as any)?.statusCode;
      if (statusCode === 401 || (error instanceof Error && error.message.includes("Session expired"))) {
        showToast("Session expired. Please login again.", "red");
        // Clear stored token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("shoutly_token");
          localStorage.removeItem("shoutly_user");
        }
        // Redirect to signin
        setTimeout(() => {
          router.push("/sign-in");
        }, 1000);
        return;
      }

      const message = error instanceof Error ? error.message : "Failed to create monthly plan";
      showToast(message, "red");
    } finally {
      setPlanLoading(false);
    }
  };

  // ── Calendar renderers ───────────────────────────────────────────────────
  const render7d = () => {
    const anchor = getAnchor();
    const cols = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(anchor); d.setDate(anchor.getDate() + i);
      const isToday = sameDay(d, today);
      const isWE = d.getDay() === 0 || d.getDay() === 6;
      const dayPosts = filtered.filter(p => sameDay(p.date, d)).sort((a, b) => a.timeStr.localeCompare(b.timeStr));
      cols.push(
        <div key={i} className="cal-week-col" style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "10px 8px 8px", borderRight: "1px solid #ECEDF8", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "#fff", position: "sticky", top: 0, zIndex: 10, borderBottom: "2px solid #E2E4F0" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB" }}>{DAY_NAMES[d.getDay()]}</div>
            <div style={{ fontSize: isToday ? 16 : 15, fontWeight: 800, color: isToday ? "#fff" : "#3D3F60", fontFamily: "Sora,sans-serif", lineHeight: 1.1, width: 34, height: 34, borderRadius: "50%", background: isToday ? "#F97316" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isToday ? "0 4px 20px rgba(249,115,22,.32)" : "none" }}>
              {d.getDate()}
            </div>
            <div style={{ fontSize: 10.5, color: "#BFC1D9", fontWeight: 500 }}>{dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}</div>
          </div>
          {/* Posts */}
          <div style={{ borderRight: "1px solid #ECEDF8", padding: 8, minHeight: 600, background: isWE ? "rgba(235,236,248,.35)" : isToday ? "rgba(249,115,22,.025)" : undefined, display: "flex", flexDirection: "column" }}>
            {dayPosts.map(p => <PostCard key={p.id} p={p} onOpen={() => openModal(p.id)} onDup={() => dupPost(p.id)} onDel={() => deletePost(p.id)} onPublishNow={() => { void publishExistingPostNow(p.id); }} />)}
            <button onClick={() => openModal(null, d)} style={{ marginTop: "auto", padding: 8, borderRadius: 7, border: "1.5px dashed #E2E4F0", color: "#BFC1D9", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "transparent", width: "100%" }}>
              <i className="fa-solid fa-plus" style={{ fontSize: 11 }} /> Add Post
            </button>
          </div>
        </div>
      );
    }
    return <div ref={weekRowRef} onScroll={onWeekRowScroll} className="cal-week-row" style={{ display: "flex" }}>{cols}</div>;
  };

  const renderMonthGrid = () => {
    const anchor = getAnchor();
    const y = anchor.getFullYear(), mo = anchor.getMonth();
    const firstDow = new Date(y, mo, 1).getDay();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const prevDays = new Date(y, mo, 0).getDate();
    const cells: React.ReactNode[] = [];

    const addCell = (d: Date, isOther: boolean) => {
      const isToday = sameDay(d, today);
      const isWE = d.getDay() === 0 || d.getDay() === 6;
      const dayPosts = !isOther ? filtered.filter(p => sameDay(p.date, d)).sort((a, b) => a.timeStr.localeCompare(b.timeStr)) : [];
      cells.push(
        <div key={d.toISOString()} className="cal-month-cell" style={{ borderRight: "1px solid #ECEDF8", borderBottom: "1px solid #ECEDF8", padding: 6, minHeight: 160, background: isOther ? "#F4F5FB" : isWE ? "rgba(235,236,248,.3)" : isToday ? "rgba(249,115,22,.03)" : "#fff", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ fontWeight: 700, color: isOther ? "#BFC1D9" : isToday ? "#fff" : "#3D3F60", width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: isToday ? "#F97316" : undefined, boxShadow: isToday ? "0 4px 20px rgba(249,115,22,.32)" : undefined, flexShrink: 0, fontSize: isToday ? 11.5 : 12.5 }}>
              {d.getDate()}
            </div>
            {!isOther && <div onClick={() => openModal(null, d)} style={{ width: 20, height: 20, borderRadius: 5, background: "#EEEEFF", color: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer" }}>
              <i className="fa-solid fa-plus" />
            </div>}
          </div>
          {!isOther && (
            <>
              {dayPosts.slice(0, 1).map(p => <MiniCard key={p.id} p={p} onOpen={() => openModal(p.id)} onDup={() => dupPost(p.id)} onDel={() => deletePost(p.id)} onPublishNow={() => { void publishExistingPostNow(p.id); }} />)}
              {dayPosts.length > 1 && (
                <div onClick={() => openModal(dayPosts[1].id)} style={{ fontSize: 10, fontWeight: 700, color: "#F97316", padding: "3px 7px", borderRadius: 5, background: "#EEEEFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                  <i className="fa-solid fa-layer-group" style={{ fontSize: 8 }} /> +{dayPosts.length - 1} more
                </div>
              )}
            </>
          )}
        </div>
      );
    };

    for (let i = firstDow - 1; i >= 0; i--) addCell(new Date(y, mo - 1, prevDays - i), true);
    for (let day = 1; day <= daysInMonth; day++) addCell(new Date(y, mo, day), false);
    const filled = firstDow + daysInMonth;
    for (let i = 1; filled + i <= 42; i++) addCell(new Date(y, mo + 1, i), true);
    return cells;
  };

  const statTotal = filtered.length;
  const statSched = filtered.filter(p => p.status === "scheduled").length;
  const statPub   = filtered.filter(p => p.status === "published").length;
  const statDraft = filtered.filter(p => p.status === "draft").length;
  const totalReach = filtered.reduce((s, p) => s + p.reach, 0);
  const reachStr = totalReach >= 1e6 ? (totalReach / 1e6).toFixed(1) + "M" : (totalReach / 1000).toFixed(0) + "K";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px; background: #F4F5FB; color: #0B0C1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes spin { 100%{transform:rotate(360deg)} }
        .tb-search:focus-within { width: 260px !important; border-color: #F97316 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(249,115,22,.1) !important; }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
        .skeleton { background: linear-gradient(90deg,#EEF0F8 25%,#E2E4F0 50%,#EEF0F8 75%); background-size: 200% 100%; animation: shimmer 1.2s ease-in-out infinite; border-radius: 10px; }

        @media (min-width: 768px) {
          .cal-admin-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
            background: #fff !important;
            border-bottom: 1px solid #E4E5EF !important;
          }
          .cal-toolbar {
            margin-top: 56px !important;
          }
        }

        .cal-connected-grid {
          scrollbar-width: none !important;
        }
        .cal-connected-grid::-webkit-scrollbar {
          display: none !important;
        }
        .cal-connected-item {
          width: 220px !important;
        }
        .cal-week-arrow, .cal-week-dots {
          display: none;
        }
        @media (max-width: 767px) {
          .cal-connected-arrows {
            display: none !important;
          }
          .cal-week-arrow {
            display: flex !important;
            position: absolute !important;
            top: 135px !important;
            transform: translateY(-50%) !important;
            width: 34px !important;
            height: 34px !important;
            border-radius: 50% !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(255,255,255,.96) !important;
            border: 1px solid #E2E4F0 !important;
            box-shadow: 0 6px 18px rgba(11,12,26,.18) !important;
            color: #3D3F60 !important;
            cursor: pointer !important;
            z-index: 20 !important;
            font-size: 12px !important;
          }
          .cal-week-arrow-left { left: 6px !important; }
          .cal-week-arrow-right { right: 6px !important; }
          .cal-week-dots {
            display: flex !important;
            position: absolute !important;
            bottom: 10px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            gap: 5px !important;
            z-index: 20 !important;
            padding: 5px 9px !important;
            border-radius: 20px !important;
            background: rgba(255,255,255,.9) !important;
            border: 1px solid #E2E4F0 !important;
          }
          .cal-week-dot {
            width: 5px !important;
            height: 5px !important;
            border-radius: 50% !important;
            background: #F97316 !important;
            transition: opacity .15s !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .cal-week-col {
            min-width: 150px !important;
          }
          .cal-week-row {
            overflow-x: auto !important;
          }
        }

        @media (max-width: 767px) {
          .cal-admin-header {
            display: none !important;
          }
          .cal-toolbar {
            flex-wrap: wrap !important;
            padding: 8px 10px !important;
            gap: 8px !important;
          }
          .cal-view-tabs {
            order: 1;
            flex: 1 1 auto !important;
          }
          .cal-view-tabs > div {
            flex: 1 !important;
            padding: 6px 6px !important;
            justify-content: center !important;
          }
          .cal-nav {
            order: 3;
            flex: 1 1 100% !important;
            justify-content: center !important;
          }
          .cal-period-title {
            min-width: 0 !important;
            font-size: 12px !important;
          }
          .cal-spacer {
            display: none !important;
          }
          .cal-time-picker {
            order: 4;
            flex: 1 1 auto !important;
            justify-content: center !important;
          }
          .cal-create-btn {
            order: 5;
            flex: 1 1 auto !important;
            justify-content: center !important;
            padding: 8px 12px !important;
            font-size: 12px !important;
          }

          .cal-connected {
            padding: 10px 10px 12px !important;
          }
          .cal-connected-grid {
            gap: 6px !important;
          }
          .cal-connected-item {
            width: 78% !important;
            scroll-snap-align: start !important;
          }

          .cal-stats-bar {
            flex-wrap: wrap !important;
            padding: 8px 10px !important;
            gap: 6px !important;
          }
          .cal-stat-pill {
            font-size: 11px !important;
            padding: 4px 9px !important;
          }
          .cal-month-badge {
            margin-left: 0 !important;
            flex: 1 1 100% !important;
            justify-content: center !important;
          }

          .cal-week-row {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-snap-type: x mandatory !important;
          }
          .cal-week-col {
            flex: 0 0 100% !important;
            min-width: 100% !important;
            scroll-snap-align: start !important;
            scroll-snap-stop: always !important;
          }

          .cal-month-scroll {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .cal-month-head,
          .cal-month-grid {
            min-width: 640px !important;
          }
          .cal-month-cell {
            min-height: 100px !important;
            padding: 4px !important;
          }

          .cal-modal-card {
            max-height: 94vh !important;
            border-radius: 14px !important;
          }
          .cal-modal-body {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .cal-modal-left {
            width: 100% !important;
          }
          .cal-modal-left > div:first-child {
            min-height: 140px !important;
          }
          .cal-modal-form {
            padding: 12px 14px !important;
          }
          .cal-modal-footer {
            flex-wrap: wrap !important;
            padding: 10px 14px !important;
          }
          .cal-modal-footer-utils {
            flex: 1 1 100% !important;
            order: 2;
          }
          .cal-modal-footer-primary {
            flex: 1 1 100% !important;
            margin-left: 0 !important;
            order: 1;
          }
          .cal-modal-footer-primary button {
            flex: 1 !important;
            padding: 9px 8px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, position: "relative" }}>

          {planLoading && (
            <div style={{ position: "absolute", inset: 0, zIndex: 200, background: "rgba(255,255,255,.72)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 34px", borderRadius: 16, background: "#fff", border: "1px solid #E2E4F0", boxShadow: "0 20px 50px rgba(11,12,26,.14)" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #FED7AA", borderTopColor: "#F97316", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>Creating your monthly plan…</div>
                <div style={{ fontSize: 11.5, color: "#8486AB" }}>Generating posts and scheduling them across your calendar</div>
              </div>
            </div>
          )}

          {/* Topbar */}
          <AdminHeader
            className="cal-admin-header"
            pageTitle="Content Calendar"
            showBell={false}
            showHelp={false}
            actionButton={
              <button onClick={() => openModal(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 7, background: "linear-gradient(115deg,#F97316,#EA580C)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 14px rgba(249,115,22,.4)" }}>
                <i className="fa-solid fa-plus" style={{ fontSize: 11 }} /> New Post
              </button>
            }
          />

          {/* Cal Toolbar */}
          <div className="cal-toolbar" style={{ flexShrink: 0, background: "#fff", borderBottom: "1px solid #E2E4F0", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            {/* View tabs — segmented control */}
            <div className="cal-view-tabs" style={{ display: "flex", alignItems: "center", gap: 2, padding: 3, borderRadius: 9, background: "#F0F1F9", flexShrink: 0 }}>
              {([["7d","fa-calendar-week","Weekly"],["month","fa-calendar","Monthly"]] as const).map(([v, icon, label]) => {
                const active = view === v;
                return (
                  <div key={v} onClick={() => { setView(v); setOffset(0); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 700, color: active ? "#F97316" : "#8486AB", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Sora,sans-serif", background: active ? "#fff" : "transparent", boxShadow: active ? "0 1px 4px rgba(11,12,26,.08)" : "none", transition: "all .15s" }}>
                    <i className={`fa-solid ${icon} fa-xs`} /> {label}
                    <span style={{ padding: "1px 6px", borderRadius: 8, fontSize: 10, fontWeight: 800, background: active ? "#FFF7ED" : "#E4E5EF", color: active ? "#F97316" : "#8486AB" }}>
                      {v === "7d" ? statSched : posts.filter(p => p.status !== "published").length}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Prev / Next / Today */}
            <div className="cal-nav" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div onClick={() => setOffset(o => o - 1)} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#3D3F60", cursor: "pointer", border: "1px solid #E2E4F0", background: "#fff", fontSize: 11, flexShrink: 0 }}>
                <i className="fa-solid fa-chevron-left" />
              </div>
              <div className="cal-period-title" style={{ fontSize: 13, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", minWidth: 150, textAlign: "center", letterSpacing: "-.2px" }}>{periodTitle}</div>
              <div
                onClick={() => { if (canGoForward) setOffset(o => o + 1); }}
                style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: canGoForward ? "#3D3F60" : "#C7C9DA", cursor: canGoForward ? "pointer" : "not-allowed", border: "1px solid #E2E4F0", background: canGoForward ? "#fff" : "#F4F5FB", fontSize: 11, flexShrink: 0 }}
              >
                <i className="fa-solid fa-chevron-right" />
              </div>
              <div onClick={() => setOffset(0)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #E2E4F0", background: offset === 0 ? "#FFF7ED" : "#fff", color: offset === 0 ? "#F97316" : "#3D3F60", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", flexShrink: 0 }}>Today</div>
            </div>

            <div className="cal-spacer" style={{ flex: 1 }} />

            {/* Post time + actions */}
            <div
              className="cal-time-picker"
              onClick={() => { try { planTimeRef.current?.showPicker?.(); } catch { planTimeRef.current?.focus(); } }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid #E2E4F0", background: "#fff", flexShrink: 0, cursor: "pointer" }}
            >
              <i className="fa-solid fa-clock" style={{ fontSize: 11, color: "#8486AB", pointerEvents: "none" }} />
              <input
                ref={planTimeRef}
                type="time"
                value={planPostTime}
                onChange={e => setPlanPostTime(e.target.value)}
                style={{ border: "none", background: "transparent", fontSize: 12.5, fontWeight: 600, color: "#0B0C1A", cursor: "pointer", outline: "none", fontFamily: "Sora,sans-serif" }}
              />
            </div>
            <button className="cal-create-btn" onClick={createPlanDirect} disabled={planLoading} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, background: "#10B981", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: planLoading ? "not-allowed" : "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(16,185,129,.32)", whiteSpace: "nowrap", flexShrink: 0, opacity: planLoading ? 0.7 : 1 }}>
              <i className="fa-solid fa-calendar-plus" style={{ fontSize: 12 }} /> {planLoading ? "Creating..." : "Create Plan"}
            </button>
          </div>

          {/* Connected Accounts */}
          <div className="cal-connected" style={{ flexShrink: 0, padding: "14px 20px 16px", background: "#F9FAFB", borderBottom: "1px solid #E4E5EF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <i className="fa-solid fa-link" style={{ color: "#9496B5", fontSize: 12 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Connected Accounts</span>
              {!connLoading && (
                <span style={{ fontSize: 11.5, color: "#9496B5", fontWeight: 500 }}>
                  {CONN_PLATS.filter(p => p.backendKey && connectedPlats[p.backendKey]).length} of {CONN_PLATS.length} connected
                </span>
              )}
              <div className="cal-connected-arrows" style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                <div onClick={() => scrollConnCarousel(-1)} style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#3D3F60", cursor: "pointer", border: "1px solid #E2E4F0", background: "#fff", fontSize: 10 }}>
                  <i className="fa-solid fa-chevron-left" />
                </div>
                <div onClick={() => scrollConnCarousel(1)} style={{ width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#3D3F60", cursor: "pointer", border: "1px solid #E2E4F0", background: "#fff", fontSize: 10 }}>
                  <i className="fa-solid fa-chevron-right" />
                </div>
              </div>
            </div>
            {connLoading ? (
              <div className="cal-connected-grid" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="skeleton cal-connected-item" style={{ height: 46 }} />
                ))}
              </div>
            ) : (
              <div ref={connCarouselRef} className="cal-connected-grid" style={{ display: "flex", gap: 8, overflowX: "auto", scrollSnapType: "x proximity", scrollBehavior: "smooth" }}>
                {CONN_PLATS.map(p => {
                  const connected = Boolean(p.backendKey && connectedPlats[p.backendKey]);
                  return (
                    <div key={p.id}
                      className="cal-connected-item"
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${connected ? "#10B981" : "#E4E5EF"}`, background: connected ? "rgba(16,185,129,.05)" : "#fff", cursor: "pointer", transition: "all .15s", flexShrink: 0, scrollSnapAlign: "start" }}
                      onMouseEnter={e => { if (!connected) (e.currentTarget as HTMLDivElement).style.borderColor = "#F97316"; }}
                      onMouseLeave={e => { if (!connected) (e.currentTarget as HTMLDivElement).style.borderColor = "#E4E5EF"; }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 }}>
                        <i className={`fa-brands ${p.icon}`} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: connected ? "#0D0E1A" : "#4B4D6B", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "Sora,sans-serif" }}>{p.name}</span>
                      {connected
                        ? <i className="fa-solid fa-check" style={{ color: "#10B981", fontSize: 11, flexShrink: 0 }} />
                        : <span style={{ fontSize: 10.5, color: "#9496B5", fontWeight: 700, flexShrink: 0, fontFamily: "Sora,sans-serif" }}>Connect</span>
                      }
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="cal-stats-bar" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", background: "#F0F1F9", borderBottom: "1px solid #E2E4F0" }}>
            {[
              { dot:"#F97316", val:statTotal, label:"Posts" },
              { dot:"#3B82F6", val:statSched, label:"Scheduled" },
              { dot:"#10B981", val:statPub,   label:"Published" },
              { dot:"#F59E0B", val:statDraft,  label:"Drafts" },
              { dot:"#EC4899", val:reachStr,   label:"Reach" },
            ].map(s => (
              <div key={s.label} className="cal-stat-pill" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, border: "1px solid #E2E4F0", background: "#fff", fontSize: 12, fontWeight: 600, color: "#3D3F60", whiteSpace: "nowrap" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                <strong style={{ fontWeight: 800, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{s.val}</strong>&nbsp;{s.label}
              </div>
            ))}
            <div className="cal-month-badge" style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 20, border: "1px solid #E2E4F0", background: "#fff", fontSize: 12, fontWeight: 700, color: "#F97316", whiteSpace: "nowrap", marginLeft: "auto" }}>
              <i className="fa-solid fa-calendar" style={{ fontSize: 10 }} />
              {MONTHS[getAnchor().getMonth()]} {getAnchor().getFullYear()}
            </div>
          </div>

          {/* Calendar Area */}
          <div className="cal-area" style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
            <div className="cal-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              {view === "7d" && render7d()}
              {view === "month" && (
                <div className="cal-month-scroll">
                  <div className="cal-month-head" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "2px solid #E2E4F0" }}>
                    {DAY_NAMES.map((n, i) => <div key={n} style={{ padding: 8, textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: i===0||i===6?"#BFC1D9":"#8486AB", borderRight: "1px solid #ECEDF8" }}>{n}</div>)}
                  </div>
                  <div className="cal-month-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>{renderMonthGrid()}</div>
                </div>
              )}
            </div>

            {view === "7d" && (
              <>
                <div className="cal-week-arrow cal-week-arrow-left" onClick={() => scrollWeekRow(-1)}>
                  <i className="fa-solid fa-chevron-left" />
                </div>
                <div className="cal-week-arrow cal-week-arrow-right" onClick={() => scrollWeekRow(1)}>
                  <i className="fa-solid fa-chevron-right" />
                </div>
                <div className="cal-week-dots">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="cal-week-dot" style={{ opacity: i === weekActiveCol ? 1 : 0.35 }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      {/* Edit Modal */}
      <EditModal state={modal} posts={posts} today={today} onClose={closeModal} onSave={savePost} onPublishNow={publishPostNow} onCreateAndPublishNow={createAndPublishNow} onDelete={deletePost} onDuplicate={dupPost} showToast={showToast} user={user} industrySelection={industrySelection} />

      {/* Toast */}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 999,
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px", borderRadius: 10,
        background: "#0B0C1A", color: "#fff", fontSize: 13, fontWeight: 600,
        boxShadow: "0 20px 50px rgba(11,12,26,.14)",
        fontFamily: "Sora,sans-serif",
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? "translateY(0)" : "translateY(8px)",
        transition: "all .3s ease", pointerEvents: "none",
      }}>
        <span style={{ display: "inline-flex", width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,129,.2)", color: "#10B981", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0 }}>
          {toast.type === "red" ? "✕" : "✓"}
        </span>&nbsp;{toast.msg}
      </div>
    </>
  );
}