"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "../Sidebar";
import AdminHeader from "../AdminHeader";
import { useSidebarState } from "@/hooks/useSidebarState";
import {
  DASHBOARD_CALENDAR_EVENT,
  readDashboardCalendarPosts,
  removeDashboardCalendarPost,
  saveDashboardCalendarPost,
  writeDashboardCalendarPosts,
} from "../calendarSync";
import {
  deleteCalendarPostFromBackend,
  fetchCalendarPostsFromBackend,
  upsertCalendarPostToBackend,
} from "@/api/calendarPostsApi";
import {
  resolveGeneratorProfileFields,
  streamGenerateAndSavePosts,
  streamGeneratePosts,
} from "@/api/postGeneratorApi";
import { createMonthlyPlan, getUserPlan, type GetPlanResponse } from "@/api/calendarApi";
import { useUserProfile } from "@/hooks/useUserProfile";

// ── Types ──────────────────────────────────────────────────────────────────
type Status = "scheduled" | "draft" | "published";
type PostType = "image" | "reel" | "carousel" | "story";
type PlatKey = "ig" | "fb" | "li" | "tw" | "tk" | "yt" | "th";
type ViewMode = "7d" | "month" | "pipeline";
type RpTab = "accounts" | "ideas" | "analytics";

interface TimeSlot { t: string; e: string; best: boolean }
interface Post {
  id: number;
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

type PostUpsert = Omit<Partial<Post>, "id"> & { id: number | null };

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
const TYPE_INFO: Record<PostType, { label: string; icon: string; bg: string }> = {
  image:    { label: "Image",    icon: "fa-image",             bg: "#3B82F6" },
  reel:     { label: "Reel",     icon: "fa-clapperboard",      bg: "#EC4899" },
  carousel: { label: "Carousel", icon: "fa-table-cells-large", bg: "#5B5BD6" },
  story:    { label: "Story",    icon: "fa-mobile-screen",     bg: "#F59E0B" },
};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

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

// Maps common industry identifier keywords → topic key for the image pool
const INDUSTRY_TO_TOPIC: Record<string, string> = {
  food: "food", restaurant: "food", beverage: "food", catering: "food", culinary: "food",
  fitness: "fitness", gym: "fitness", health: "fitness", wellness: "fitness", sport: "fitness", training: "fitness",
  technology: "tech", tech: "tech", software: "tech", saas: "tech", ai: "tech", digital: "tech", developer: "tech",
  fashion: "fashion", apparel: "fashion", clothing: "fashion", style: "fashion", boutique: "fashion",
  realestate: "realestate", real_estate: "realestate", property: "realestate", realtor: "realestate", housing: "realestate",
  travel: "travel", tourism: "travel", adventure: "travel", hospitality: "travel", hotel: "travel",
};

// 7 distinct content angles — ensures each generated post has a unique theme
const GENERATION_ANGLES = [
  "Share a surprising quick-win tip",
  "Behind-the-scenes story or moment",
  "Before & after transformation",
  "Myth-busting: what people get wrong",
  "Top 3 tools or resources you recommend",
  "Client or customer success story",
  "Upcoming trend to watch in the industry",
];

// 7 unique angle-based captions per industry topic
const LOCAL_CAPTIONS_BY_TOPIC: Record<string, string[]> = {
  food: [
    "Quick-win tip: batch-prep your sauces on Sunday and save 2 hours every week 🦪",
    "Behind the scenes at 6 AM — here’s what opening the kitchen actually looks like 👨‍🍳",
    "From bland to brand: how we overhauled our menu and doubled covers in 30 days ✨",
    "Myth busted: you do NOT need a Michelin-trained chef to run a profitable food business 🔥",
    "3 kitchen tools we can’t live without (and one we threw in the bin) 🔪",
    "A guest drove 2 hours just for our signature dish — here’s their message 🙏",
    "The biggest food trend coming this summer — are you ready? 🚀",
  ],
  fitness: [
    "One quick win: swap your rest day scroll for a 10-min walk — your recovery will thank you 💪",
    "6 AM behind the scenes — what a PT’s morning routine really looks like 🌅",
    "12-week transformation: -18 lbs, +confidence, zero fad diets 💪",
    "Myth: you need to go to the gym every day to see results. Hard disagree. Here’s why 🔥",
    "Top 3 apps our trainers actually use (and 1 we deleted) ✅",
    "Client message that made our whole team tear up — this is why we do it ❤️",
    "The biggest fitness trend for 2026 that most gyms are ignoring 🚀",
  ],
  tech: [
    "Quick win: automate your daily standup summary with 1 free tool — here’s how 🤖",
    "Behind the scenes: what a product sprint actually looks like for a 5-person team 💻",
    "Before vs after: switching to async comms cut our meeting load by 40% ✨",
    "Myth: AI will replace your dev team. Here’s the nuanced truth nobody wants to say 🔥",
    "3 tools our engineering team ships faster with every week ✅",
    "Our early user told us the product saved their business. This is their story 🙏",
    "The next big shift in SaaS UX — and how to get ahead of it 🚀",
  ],
  fashion: [
    "One styling tip that instantly elevates any outfit — save this 📌",
    "Behind the scenes of our new collection shoot — the chaos you never see 📸",
    "Before vs after styling: the same person, 2 outfits, completely different energy ✨",
    "Myth: sustainable fashion is always expensive. We’re proving that wrong 📋",
    "3 wardrobe staples every capsule wardrobe needs (stylist-approved) ✅",
    "A customer wore our piece to her job interview — and got the role 🌟",
    "The fashion movement reshaping how we dress in 2026 🚀",
  ],
  realestate: [
    "Quick win for buyers: get pre-approved before viewing — you’ll negotiate from a stronger position 🏠",
    "Behind the scenes: what happens between offer accepted and keys in hand 🔑",
    "Before vs after: this renovation added £42K to the listing value in 6 weeks ✨",
    "Myth: you need a 20% deposit to buy property. Here’s what most people don’t know 🔥",
    "3 online tools every first-time buyer should bookmark ✅",
    "First-time buyer just got the keys — here’s the message they sent us 🙏",
    "The neighbourhood everyone’s moving to in 2026 — and why 🚀",
  ],
  travel: [
    "Quick win: book Tuesday flights — data shows average 18% cheaper than Fridays ✈️",
    "Behind the scenes: how we plan a press trip for 12 journalists in 48 hours 📝",
    "Before vs after: this itinerary overhaul made a 2-week trip feel like a month ✨",
    "Myth: solo travel is lonely. Here’s what it’s actually like 🌍",
    "3 packing hacks that fit a week into carry-on only 🧳",
    "A traveller wrote to us from our recommended spot — read what happened 🙏",
    "The destination that’s about to blow up in 2026 — visit before everyone else does 🚀",
  ],
  business: [
    "Quick win: repurpose one long post into 5 short-form clips this week 📊",
    "Behind the scenes: how we run a content calendar for 7 platforms solo 📝",
    "Before vs after: posting consistently for 30 days tripled our inbound leads ✨",
    "Myth: you need a huge following to generate revenue. Disproved 🔥",
    "3 free tools that run our social media on autopilot ✅",
    "A follower DMed us after 6 months — this is what happened to their brand 🙏",
    "The content format dominating feeds in 2026 — and how to use it now 🚀",
  ],
};

function resolveTopicFromIndustry(industryId: string, subIndustryId?: string): string {
  const norm = (v: string) => v.toLowerCase().replace(/[-_\s]/g, "");
  for (const input of [subIndustryId ?? "", industryId]) {
    const n = norm(input);
    for (const [key, topic] of Object.entries(INDUSTRY_TO_TOPIC)) {
      const nk = norm(key);
      if (n.includes(nk) || nk.includes(n)) return topic;
    }
  }
  return "business";
}

function pickNonRepeatingImagePool(count: number, topic: string): string[] {
  const rawTopicPool = TOPIC_IMAGE_MAP[topic] || TOPIC_IMAGE_MAP.business || STOCK_IMAGES;
  const topicPool = Array.from(new Set(rawTopicPool));
  if (!topicPool.length) return [STOCK_IMAGES[0]];

  const shuffledTopic = [...topicPool].sort(() => Math.random() - 0.5);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffledTopic[i % shuffledTopic.length]);
  }
  return result;
}

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
  { emoji:"🎯", title:"Audience poll: next content?", sub:"Engagement spike · Stories", score:73, col:"#5B5BD6", bg:"#EEEEFF" },
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

const safeImageSrc = (src?: string | null) => {
  const value = (src || "").trim();
  return value || FALLBACK_CALENDAR_IMAGE;
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
function PostCard({ p, onOpen, onDup, onDel }: { p: Post; onOpen: () => void; onDup: () => void; onDel: () => void }) {
  const meta = TYPE_INFO[p.type];
  const scoreColor = p.score >= 80 ? "#10B981" : p.score >= 60 ? "#F59E0B" : "#EF4444";
  const statusColors: Record<Status, { bg: string; color: string }> = {
    scheduled: { bg: "#EFF6FF", color: "#3B82F6" },
    draft:     { bg: "#FFFBEB", color: "#F59E0B" },
    published: { bg: "#ECFDF5", color: "#10B981" },
  };
  const ss = statusColors[p.status];
  return (
    <div onClick={onOpen} style={{ background: "#fff", border: "1px solid #E2E4F0", borderRadius: 10, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(11,12,26,.06)", position: "relative", marginBottom: 6 }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={safeImageSrc(p.img)} onError={onCalendarImageError} alt="" style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} loading="lazy" />
        <div style={{ position: "absolute", top: 5, left: 5, display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: meta.bg + "aa", color: "#fff", fontSize: 9.5, fontWeight: 800, fontFamily: "Sora,sans-serif" }}>
          <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 8 }} />&nbsp;{meta.label}
        </div>
        <div style={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 4, background: PLAT_COLORS[p.plats[0]] + "aa", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9 }}>
          <i className={`fa-brands ${PLAT_ICONS[p.plats[0]]}`} />
        </div>
        <div style={{ position: "absolute", bottom: 5, right: 5, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,.5)", color: scoreColor, fontSize: 9.5, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", display: "flex", alignItems: "center", gap: 2 }}>
          <i className="fa-solid fa-chart-simple" style={{ fontSize: 7 }} />{p.score}
        </div>
        {/* hover actions */}
        <div className="pc-hover-actions" style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 3, zIndex: 5 }}>
          {[{ title:"Edit", icon:"fa-pen", action: onOpen }, { title:"Dup", icon:"fa-copy", action: onDup }, { title:"Del", icon:"fa-trash", action: onDel }].map(btn => (
            <div key={btn.title} onClick={e => { e.stopPropagation(); btn.action(); }} style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3D3F60", fontSize: 9, cursor: "pointer", border: "1px solid rgba(255,255,255,.6)" }}>
              <i className={`fa-solid ${btn.icon}`} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 3, background: PLAT_COLORS[p.plats[0]] }} />
      <div style={{ padding: "7px 9px 9px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", fontFamily: "JetBrains Mono,monospace", marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}>
          <i className="fa-regular fa-clock" style={{ fontSize: 9 }} />&nbsp;{p.timeStr}
        </div>
        <div style={{ fontSize: 11.5, color: "#3D3F60", lineHeight: 1.45, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 5 }}>{p.caption}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 6 }}>
          {p.hashtags.slice(0, 3).map(h => <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "#5B5BD6", fontFamily: "JetBrains Mono,monospace", padding: "1px 5px", borderRadius: 3, background: "#EEEEFF" }}>{h}</span>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 3 }}>
            {p.plats.slice(0, 3).map(pl => (
              <div key={pl} style={{ width: 14, height: 14, borderRadius: 3, background: PLAT_COLORS[pl], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 6 }}>
                <i className={`fa-brands ${PLAT_ICONS[pl]}`} />
              </div>
            ))}
          </div>
          <span style={{ padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: ss.bg, color: ss.color }}>
            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ p, onOpen, onDup, onDel }: { p: Post; onOpen: () => void; onDup: () => void; onDel: () => void }) {
  const meta = TYPE_INFO[p.type];
  const scoreColor = p.score >= 80 ? "#10B981" : p.score >= 60 ? "#F59E0B" : "#EF4444";
  const statusColors: Record<Status, { bg: string; color: string }> = {
    scheduled: { bg: "#EFF6FF", color: "#3B82F6" },
    draft:     { bg: "#FFFBEB", color: "#F59E0B" },
    published: { bg: "#ECFDF5", color: "#10B981" },
  };
  const ss = statusColors[p.status];
  return (
    <div onClick={onOpen} style={{ background: "#fff", border: "1px solid #E2E4F0", borderRadius: 8, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(11,12,26,.06)", position: "relative", marginBottom: 5, flexShrink: 0 }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={safeImageSrc(p.img)} onError={onCalendarImageError} alt="" style={{ width: "100%", height: 70, objectFit: "cover", display: "block" }} loading="lazy" />
        <div style={{ position: "absolute", top: 4, left: 4, padding: "2px 6px", borderRadius: 3, background: meta.bg + "bb", color: "#fff", fontSize: 8.5, fontWeight: 800, fontFamily: "Sora,sans-serif" }}>
          <i className={`fa-solid ${meta.icon}`} style={{ fontSize: 7 }} />&nbsp;{meta.label}
        </div>
        <div style={{ position: "absolute", top: 4, right: 4, width: 17, height: 17, borderRadius: 3, background: PLAT_COLORS[p.plats[0]] + "bb", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8 }}>
          <i className={`fa-brands ${PLAT_ICONS[p.plats[0]]}`} />
        </div>
        <div style={{ position: "absolute", bottom: 3, right: 4, padding: "1px 5px", borderRadius: 3, background: "rgba(0,0,0,.52)", color: scoreColor, fontSize: 8.5, fontWeight: 800, fontFamily: "JetBrains Mono,monospace" }}>
          {p.score}
        </div>
        {/* hover overlay */}
        <div className="mmc-actions" style={{ position: "absolute", inset: 0, background: "rgba(11,12,26,.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 8 }}>
          {[{ icon:"fa-pen", action: onOpen }, { icon:"fa-copy", action: onDup }, { icon:"fa-trash", action: onDel }].map((btn, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); btn.action(); }} style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,.95)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B0C1A", fontSize: 10, cursor: "pointer" }}>
              <i className={`fa-solid ${btn.icon}`} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 2.5, background: PLAT_COLORS[p.plats[0]] }} />
      <div style={{ padding: "5px 7px 6px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#10B981", fontFamily: "JetBrains Mono,monospace", marginBottom: 3 }}>
          <i className="fa-regular fa-clock" style={{ fontSize: 8 }} />&nbsp;{p.timeStr}
        </div>
        <div style={{ fontSize: 10.5, color: "#3D3F60", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 4 }}>{p.caption}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {p.plats.slice(0, 3).map(pl => (
              <div key={pl} style={{ width: 12, height: 12, borderRadius: 2, background: PLAT_COLORS[pl], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 5.5 }}>
                <i className={`fa-brands ${PLAT_ICONS[pl]}`} />
              </div>
            ))}
          </div>
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

function EditModal({ state, posts, today, onClose, onSave, onDelete, onDuplicate, showToast, user }: {
  state: ModalState;
  posts: Post[];
  today: Date;
  onClose: () => void;
  onSave: (data: PostUpsert) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  showToast: (msg: string, type: string) => void;
  user: Record<string, unknown> | null | undefined;
}) {
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
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIdx, setAiIdx] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageSuccessMessage, setImageSuccessMessage] = useState("");
  const [showCaptionPromptPopup, setShowCaptionPromptPopup] = useState(false);
  const [showImagePreviewPopup, setShowImagePreviewPopup] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImg(url);
    showToast("🖼️ Image updated!", "green");
    e.target.value = "";
  };

  const browseStockImg = async () => {
    const prompt = caption.trim();
    if (!prompt) {
      setShowCaptionPromptPopup(true);
      setImageSuccessMessage("");
      return;
    }

    setIsGeneratingImage(true);
    setImageSuccessMessage("");

    try {
      const response = await fetch("/api/gemeini-image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        let parsed: any = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch {
          parsed = null;
        }

        throw new Error(
          parsed?.message ||
            text ||
            `Image generation failed (${response.status}).`
        );
      }

      const data = (await response.json()) as
        | {
            imageUrl?: string;
            url?: string;
            image?: { imageUrl?: string; url?: string };
            data?: { imageUrl?: string; url?: string };
          }
        | undefined;

      const nextImage =
        data?.imageUrl ||
        data?.url ||
        data?.image?.imageUrl ||
        data?.image?.url ||
        data?.data?.imageUrl ||
        data?.data?.url;

      if (!nextImage) {
        throw new Error("No image URL returned from image generation API.");
      }

      setImg(nextImage);
      setImageSuccessMessage("Image generated successfully.");
      showToast("✦ Image generated successfully", "green");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not generate image.",
        "red"
      );
    } finally {
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    if (!state.open) return;
    if (p) {
      setCaption(p.caption); setDateVal(toIso(p.date)); setTypeVal(p.type);
      setSelPlats(p.plats); setStatus(p.status); setTags(p.hashtags);
      setSelTime(p.timeStr); setTimesOpts(p.timesOptions); setScore(p.score); setImg(p.img);
    } else {
      setCaption(""); setDateVal(toIso(state.initDate || today)); setTypeVal("image");
      setSelPlats(["ig"]); setStatus("scheduled"); setTags(rnd(HASHTAG_POOLS));
      const t = rnd(TIMES_POOL); setTimesOpts(t); setSelTime(t.find(x => x.best)?.t || t[0].t);
      setScore(rndInt(62, 94)); setImg(rnd(STOCK_IMAGES));
    }
    setAiResult(""); setAiLoading(false); setImageSuccessMessage(""); setShowCaptionPromptPopup(false); setShowImagePreviewPopup(false);
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

  const doAiRewrite = async () => {
    setAiLoading(true); setAiResult("");

    // Smart local rewrite based on the current caption — always relevant
    const localRewrite = (): string => {
      if (!caption.trim()) return AI_CAPTIONS_REWRITE[aiIdx % AI_CAPTIONS_REWRITE.length];
      const hooks = [
        "Here's what nobody tells you 👇",
        "Stop scrolling. This matters 👀",
        "Real talk:",
        "This changed everything for us ⬇️",
        "Worth sharing:",
      ];
      const ctas = [
        "💬 What's your take? Drop it below.",
        "❤️ Save this for later.",
        "🔗 Tag someone who needs this.",
        "📌 Share with your team.",
        "🚀 Follow for more like this.",
      ];
      const hook = hooks[aiIdx % hooks.length];
      const cta = ctas[(aiIdx + 1) % ctas.length];
      return `${hook}\n\n${caption.trim()}\n\n${cta}`;
    };

    const { industryId, subIndustryId } = resolveGeneratorProfileFields(user as Record<string, unknown>);
    if (!industryId || !subIndustryId) {
      // No profile industry — use smart local rewrite
      setTimeout(() => {
        const fallback = localRewrite();
        setAiResult(fallback);
        setAiIdx(i => i + 1);
        setAiLoading(false);
        showToast("✦ AI caption generated", "brand");
      }, 700);
      return;
    }

    // Prefer detected topic from selected image, fallback to caption keyword topic.
    const imageTopic = detectTopicFromImageUrl(img) || detectTopicFromCaption(caption);
    const prompt = [
      "You are an expert social media copywriter.",
      caption
        ? `Rewrite this caption while preserving the core message: "${caption}"`
        : "Generate an engaging social media caption.",
      imageTopic
        ? `The selected image topic is: ${imageTopic}.`
        : "Use the selected image as visual context.",
      "The output must match the image context and must not introduce unrelated topics.",
      "Tone: bold, modern, brand-safe. Include a strong hook and a clear CTA.",
      "Keep it under 280 characters.",
    ].filter(Boolean).join(" ");

    const attemptStreamRewrite = async (): Promise<string | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);
      let accumulated = "";
      try {
        await streamGeneratePosts(
          { industryId, subIndustryId, prompt },
          {
            onChunk: (chunk) => {
              const text = chunk.post?.text;
              if (text) {
                accumulated = text;
                setAiResult(text);
              }
            },
            signal: controller.signal,
          }
        );
      } finally {
        clearTimeout(timeoutId);
      }
      return accumulated.trim() || null;
    };

    let generatedCaption: string | null = null;
    try {
      generatedCaption = await attemptStreamRewrite();
    } catch (firstError) {
      console.warn("AI rewrite first attempt failed:", firstError);
    }

    if (!generatedCaption) {
      try {
        // Retry once to handle cold-start/network blips.
        generatedCaption = await attemptStreamRewrite();
      } catch (retryError) {
        console.warn("AI rewrite retry failed:", retryError);
      }
    }

    try {
      if (generatedCaption) {
        showToast("✦ AI caption generated", "brand");
      } else {
        const fallback = localRewrite();
        setAiResult(fallback);
        showToast("⚠ AI unavailable. Applied local AI rewrite.", "amber");
      }
    } finally {
      setAiIdx(i => i + 1);
      setAiLoading(false);
    }
  };

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

  const scoreColor = score >= 80 ? "#10B981" : score >= 60 ? "#3B82F6" : "#F59E0B";
  const circ = 113;
  const dashOffset = circ - (score / 100) * circ;

  if (!state.open) return null;
  return (
    <div onClick={e => { if ((e.target as HTMLElement).id === "modal-backdrop") onClose(); }} id="modal-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(11,12,26,.44)", backdropFilter: "blur(8px)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", border: "1px solid #E2E4F0", borderRadius: 18, width: 880, maxWidth: "100%", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 32px 80px rgba(11,12,26,.2)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #E2E4F0", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-pen" style={{ color: "#5B5BD6" }} />
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
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel */}
          <div style={{ width: 240, flexShrink: 0, background: "#F0F1F9", borderRight: "1px solid #E2E4F0", display: "flex", flexDirection: "column" }}>
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
              <button onClick={e => { e.stopPropagation(); void browseStockImg(); }} disabled={isGeneratingImage}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 8px", borderRadius: 7, border: "1px solid #DDDDFB", background: "#EEEEFF", color: "#5B5BD6", fontSize: 11.5, fontWeight: 700, cursor: isGeneratingImage ? "not-allowed" : "pointer", opacity: isGeneratingImage ? .6 : 1 }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 10 }} /> {isGeneratingImage ? "Generating..." : "Generate Another"}
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
            {/* Status */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid #E2E4F0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", marginBottom: 6, fontFamily: "Sora,sans-serif" }}>Status</div>
              <div style={{ display: "flex", gap: 5 }}>
                {(["scheduled","draft","published"] as Status[]).map(s => {
                  const cols: Record<Status, { bg: string; color: string; border: string }> = {
                    scheduled: { bg: "#EFF6FF", color: "#3B82F6", border: "#3B82F6" },
                    draft:     { bg: "#FFFBEB", color: "#F59E0B", border: "#F59E0B" },
                    published: { bg: "#ECFDF5", color: "#10B981", border: "#10B981" },
                  };
                  const on = status === s;
                  return (
                    <div key={s} onClick={() => setStatus(s)} style={{ flex: 1, padding: "6px 4px", borderRadius: 7, border: `1.5px solid ${on ? cols[s].border : "#E2E4F0"}`, background: on ? cols[s].bg : "#F0F1F9", fontSize: 11.5, fontWeight: 700, cursor: "pointer", color: on ? cols[s].color : "#8486AB", textAlign: "center" }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Form */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Score ring */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 7, background: "#F0F1F9", border: "1px solid #ECEDF8" }}>
              <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E4F0" strokeWidth="4" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke={scoreColor} strokeWidth="4" strokeLinecap="round" strokeDasharray="113" strokeDashoffset={dashOffset} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, fontFamily: "JetBrains Mono,monospace" }}>{score}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A" }}>Engagement Prediction</div>
                <div style={{ fontSize: 11, color: "#8486AB", marginTop: 2 }}>AI score for this post</div>
              </div>
              <div style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 800, fontFamily: "Sora,sans-serif", background: score >= 80 ? "#ECFDF5" : score >= 60 ? "#EFF6FF" : "#FFFBEB", color: score >= 80 ? "#10B981" : score >= 60 ? "#3B82F6" : "#F59E0B" }}>
                {score >= 80 ? "🔥 Excellent" : score >= 60 ? "👍 Good" : "⚡ Needs Boost"}
              </div>
            </div>
            {/* AI Rewrite */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 7, background: "linear-gradient(135deg,#EEEEFF,rgba(238,238,255,.45))", border: "1px solid #DDDDFB" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: "#5B5BD6", fontSize: 14, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12.5, color: "#3D3F60" }}><strong style={{ color: "#5B5BD6" }}>AI Rewrite</strong> — Optimise caption for your brand</div>
              <button onClick={doAiRewrite} disabled={aiLoading} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 7, background: aiLoading ? "#BFC1D9" : "#5B5BD6", color: "#fff", fontSize: 12, fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer", border: "none", fontFamily: "Sora,sans-serif", flexShrink: 0 }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 10 }} /> {aiLoading ? "Generating..." : "Rewrite"}
              </button>
            </div>
            {(aiLoading || aiResult) && (
              <div style={{ background: "#EEEEFF", border: "1px solid #DDDDFB", borderRadius: 7, padding: "10px 12px", fontSize: 13.5, color: "#0B0C1A", lineHeight: 1.7 }}>
                {aiLoading ? "Generating caption with AI..." : aiResult}
                {!aiLoading && !!aiResult && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[{ label: "✓ Use This", action: () => { applyCaptionWithRelatedTags(aiResult); setAiResult(""); showToast("✦ Caption applied!", "brand"); } },
                      { label: "↺ Again", action: doAiRewrite },
                      { label: "✕", action: () => setAiResult("") }
                    ].map(btn => (
                      <div key={btn.label} onClick={btn.action} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 4, border: "1px solid #DDDDFB", background: "#fff", color: "#5B5BD6", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{btn.label}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Caption */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6 }}>Caption</div>
              <textarea value={caption} onChange={e => applyCaptionWithRelatedTags(e.target.value)} placeholder="Write your caption here…"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F0F1F9", color: "#0B0C1A", fontSize: 13.5, outline: "none", resize: "none", minHeight: 80, fontFamily: "inherit", lineHeight: 1.6 }} />
              <div style={{ textAlign: "right", fontSize: 11, color: "#BFC1D9", fontFamily: "JetBrains Mono,monospace", marginTop: 3 }}>{caption.length} / 2200</div>
            </div>
            {imageSuccessMessage && (
              <div style={{ fontSize: 12.5, color: "#10B981", fontWeight: 700 }}>
                {imageSuccessMessage}
              </div>
            )}
            {/* Hashtags */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", fontFamily: "Sora,sans-serif", marginBottom: 6, display: "flex", alignItems: "center" }}>
                Hashtags
                <span onClick={() => { setTags(buildRelevantHashtags(caption, img)); showToast("✦ Related hashtags added!", "brand"); }} style={{ marginLeft: "auto", fontSize: 11, color: "#5B5BD6", fontWeight: 700, cursor: "pointer", textTransform: "none", letterSpacing: 0 }}>✦ Refresh</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 10px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F0F1F9", minHeight: 44 }}>
                {tags.map((t, i) => (
                  <div key={t + i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, background: "#EEEEFF", border: "1px solid #DDDDFB", color: "#5B5BD6", fontSize: 11.5, fontWeight: 600, fontFamily: "JetBrains Mono,monospace" }}>
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
                <span style={{ padding: "2px 7px", borderRadius: 8, background: "#EEEEFF", color: "#5B5BD6", fontSize: 10, fontWeight: 700, textTransform: "none", letterSpacing: 0 }}>AI Powered</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
                {timesOpts.map(s => {
                  const selected = s.t === selTime;
                  const engClass = parseFloat(s.e) > 9 ? "#10B981" : parseFloat(s.e) > 7 ? "#F59E0B" : "#EF4444";
                  return (
                    <div key={s.t} onClick={() => setSelTime(s.t)} style={{ padding: "7px 5px", borderRadius: 7, border: `1.5px solid ${selected ? (s.best ? "#10B981" : "#5B5BD6") : s.best ? "rgba(16,185,129,.3)" : "#E2E4F0"}`, background: selected ? (s.best ? "#ECFDF5" : "#EEEEFF") : s.best ? "#ECFDF5" : "#F0F1F9", textAlign: "center", cursor: "pointer" }}>
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
        <div style={{ padding: "12px 20px", borderTop: "1px solid #E2E4F0", display: "flex", gap: 8, alignItems: "center", background: "#F0F1F9", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6 }}>
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
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => onSave({ id: p?.id ?? null, caption, date: dateVal ? new Date(dateVal) : today, type: typeVal, plats: selPlats.length ? selPlats : ["ig"], hashtags: tags, status, timeStr: selTime, timesOptions: timesOpts, img, score, reach: rndInt(10, 80) * 1000, engRate: "8.5%", isAI: false })}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 7, background: "#5B5BD6", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(91,91,214,.32)" }}>
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
                <div style={{ minWidth: 56, textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "#5B5BD6", fontFamily: "JetBrains Mono,monospace" }}>
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
      {showCaptionPromptPopup && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 700, background: "rgba(11,12,26,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowCaptionPromptPopup(false);
            }
          }}
        >
          <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 12, border: "1px solid #E2E4F0", padding: "16px 18px", boxShadow: "0 20px 50px rgba(11,12,26,.2)" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>Caption Required</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#3D3F60", lineHeight: 1.6 }}>Add a caption first so we can generate an image from it.</div>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCaptionPromptPopup(false)}
                style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: "#5B5BD6", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Generate Modal ──────────────────────────────────────────────────────
function GenModal({
  open,
  pct,
  generatedCount,
  statusText,
}: {
  open: boolean;
  pct: number;
  generatedCount: number;
  statusText: string;
}) {
  const steps = [
    "Connecting to post stream",
    "Receiving DB and LLM posts",
    "Updating dashboard calendar",
    "Saving scheduled content",
  ];
  const stepIdx = Math.min(
    steps.length - 1,
    Math.max(0, Math.floor((pct / 100) * steps.length))
  );

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,12,26,.55)", backdropFilter: "blur(8px)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "32px 38px", width: 380, textAlign: "center", boxShadow: "0 32px 80px rgba(11,12,26,.2)" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#5B5BD6,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(91,91,214,.32)" }}>✦</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.3px", marginBottom: 4 }}>AI Generating Posts</div>
        <div style={{ fontSize: 13, color: "#8486AB", lineHeight: 1.6, marginBottom: 20 }}>Streaming posts from backend and inserting them as they arrive.</div>
        <div style={{ background: "#F0F1F9", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#5B5BD6,#7C3AED)", width: pct + "%", borderRadius: 6, transition: "width .4s ease" }} />
        </div>
        <div style={{ fontSize: 12, color: "#8486AB", fontFamily: "JetBrains Mono,monospace", marginBottom: 8 }}>{pct}% · {generatedCount}/7 posts</div>
        <div style={{ fontSize: 12, color: "#5B5BD6", marginBottom: 14 }}>{statusText}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: i < stepIdx ? "#10B981" : i === stepIdx ? "#5B5BD6" : "#8486AB", fontWeight: i === stepIdx ? 700 : 400 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${i < stepIdx ? "#10B981" : i === stepIdx ? "#5B5BD6" : "#8486AB"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, flexShrink: 0, background: i < stepIdx ? "#10B981" : "transparent", color: i < stepIdx ? "#fff" : "inherit" }}>
                {i < stepIdx && <i className="fa-solid fa-check" style={{ fontSize: 8 }} />}
              </div>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Right Panel ────────────────────────────────────────────────────────────
function RightPanel({ rpTab, setRpTab, posts, onOpen, onAddIdea, showToast }: {
  rpTab: RpTab; setRpTab: (t: RpTab) => void; posts: Post[];
  onOpen: (id: number) => void; onAddIdea: (idea: typeof IDEAS_LIST[0]) => void;
  showToast: (msg: string, type: string) => void;
}) {
  const upcoming = posts.filter(p => p.status === "scheduled").sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 6);
  return (
    <div style={{ width: 272, flexShrink: 0, background: "#fff", borderLeft: "1px solid #E2E4F0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #E2E4F0", flexShrink: 0 }}>
        {(["accounts","ideas","analytics"] as RpTab[]).map(t => (
          <div key={t} onClick={() => setRpTab(t)} style={{ flex: 1, padding: "12px 6px", textAlign: "center", fontSize: 12, fontWeight: 700, color: rpTab === t ? "#5B5BD6" : "#8486AB", cursor: "pointer", fontFamily: "Sora,sans-serif", position: "relative", borderBottom: rpTab === t ? "2px solid #5B5BD6" : "2px solid transparent" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {rpTab === "accounts" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB", fontFamily: "Sora,sans-serif" }}>Connected Accounts</div>
              <div onClick={() => showToast("✦ Opening connect flow…","brand")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: "#EEEEFF", color: "#5B5BD6", fontSize: 11, fontWeight: 700, cursor: "pointer", border: "1px solid #DDDDFB" }}>
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
                  <div onClick={() => onAddIdea(idea)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 6, background: "#EEEEFF", color: "#5B5BD6", fontSize: 11, fontWeight: 700, fontFamily: "Sora,sans-serif", cursor: "pointer" }}>
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
                  <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#5B5BD6,#7C3AED)", width: `${r.v * 7.5}%` }} />
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
  const { sidebarSlim, setSidebarSlim } = useSidebarState();
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextId, setNextId] = useState(10000);

  const mergeImportedPosts = useCallback((incoming: Post[]) => {
    if (!incoming.length) return;
    setPosts((prev) => {
      const seen = new Set(prev.map((post) => post.id));
      const additions = incoming.filter((post) => !seen.has(post.id));
      return additions.length ? [...prev, ...additions] : prev;
    });
    setNextId((prev) => Math.max(prev, ...incoming.map((post) => post.id + 1)));
  }, []);

  useEffect(() => {
    const imported = readDashboardCalendarPosts() as Post[];
    setPosts(imported);
    if (imported.length) {
      setNextId(Math.max(10000, ...imported.map((post) => post.id + 1)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hydrateFromBackend = async () => {
      try {
        const remote = (await fetchCalendarPostsFromBackend()) as Post[];
        if (!remote.length) return;

        setPosts((prev) => {
          const byId = new Map<number, Post>();
          prev.forEach((post) => byId.set(post.id, post));
          remote.forEach((post) => byId.set(post.id, { ...post, date: new Date(post.date) } as Post));

          const merged = Array.from(byId.values()).sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          );
          writeDashboardCalendarPosts(merged);
          return merged;
        });

        setNextId((prev) => Math.max(prev, ...remote.map((post) => post.id + 1)));
      } catch (error) {
        console.warn("Failed to fetch backend calendar posts:", error);
      }
    };

    void hydrateFromBackend();
  }, []);
  useEffect(() => {
    const syncImported = () => mergeImportedPosts(readDashboardCalendarPosts() as Post[]);

    window.addEventListener(DASHBOARD_CALENDAR_EVENT, syncImported);
    window.addEventListener("storage", syncImported);
    return () => {
      window.removeEventListener(DASHBOARD_CALENDAR_EVENT, syncImported);
      window.removeEventListener("storage", syncImported);
    };
  }, [mergeImportedPosts]);
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
  const [genOpen, setGenOpen] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genCount, setGenCount] = useState(0);
  const [genStatus, setGenStatus] = useState("Preparing stream...");
  const [genInFlight, setGenInFlight] = useState(false);
  const planPostTime = "10:00";
  const [planLoading, setPlanLoading] = useState(false);
  const [getUserPlanOpen, setGetUserPlanOpen] = useState(false);
  const [userPlanData, setUserPlanData] = useState<GetPlanResponse | null>(null);
  const [userPlanLoading, setUserPlanLoading] = useState(false);
  const [userPlanError, setUserPlanError] = useState("");
  const { toast, show: showToast } = useToast();
  const { user } = useUserProfile();

  const filtered = posts.filter(p => {
    if (platFilter !== "all" && !p.plats.includes(platFilter)) return false;
    if (search) { const q = search.toLowerCase(); if (!p.caption.toLowerCase().includes(q) && !p.hashtags.join(" ").toLowerCase().includes(q)) return false; }
    return true;
  });

  const getAnchor = useCallback(() => {
    const d = new Date(today);
    if (view === "7d") d.setDate(d.getDate() + offset);
    else { d.setDate(1); d.setMonth(d.getMonth() + offset); }
    return d;
  }, [today, view, offset]);

  const periodTitle = (() => {
    const d = getAnchor();
    if (view === "7d") {
      const end = new Date(d); end.setDate(d.getDate() + 6);
      return d.getMonth() === end.getMonth() ? `${fmt(d)} – ${end.getDate()}, ${d.getFullYear()}` : `${fmt(d)} – ${fmt(end)} ${end.getFullYear()}`;
    }
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  })();

  const openModal = (id: number | null, date?: Date) => setModal({ open: true, postId: id, initDate: date ?? null });
  const closeModal = () => setModal(m => ({ ...m, open: false }));

  const savePost = (data: PostUpsert) => {
    if (data.id) {
      setPosts(prev => {
        const updated = prev.map(p => p.id === data.id ? { ...p, ...data } as Post : p);
        const saved = updated.find((item) => item.id === data.id);
        if (saved) {
          saveDashboardCalendarPost(saved);
          void upsertCalendarPostToBackend(saved);
        }
        return updated;
      });
      showToast("✅ Post updated!", "green");
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
      setPosts(prev => [...prev, newPost]);
      saveDashboardCalendarPost(newPost);
      void upsertCalendarPostToBackend(newPost);
      setNextId(n => n + 1);
      showToast("✅ Post scheduled!", "green");
    }
    closeModal();
  };

  const deletePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    removeDashboardCalendarPost(id);
    void deleteCalendarPostFromBackend(id);
    showToast("🗑️ Post deleted", "red");
  };
  const dupPost = (id: number) => {
    const p = posts.find(x => x.id === id);
    if (p) { const d = new Date(p.date); d.setDate(d.getDate() + 1); setPosts(prev => [...prev, { ...p, id: nextId, status: "draft", date: d }]); setNextId(n => n + 1); showToast("📋 Duplicated", "brand"); }
  };

  const generatePostsLocally = (
    ind: string,
    subInd: string,
    count: number,
    scheduleAt: Date,
    baseId: number,
    images: string[]
  ): Post[] => {
    const topic = resolveTopicFromIndustry(ind, subInd);
    const topicTags = TOPIC_HASHTAG_MAP[topic] || TOPIC_HASHTAG_MAP.business;
    const captions = LOCAL_CAPTIONS_BY_TOPIC[topic] || LOCAL_CAPTIONS_BY_TOPIC.business;
    const posts: Post[] = [];
    for (let i = 0; i < count; i++) {
      const postDate = new Date(scheduleAt);
      postDate.setDate(postDate.getDate() + i);
      posts.push({
        id: baseId + i + 1,
        date: postDate,
        caption: captions[i % captions.length],
        hashtags: [...topicTags, `#${ind}`, `#${subInd}`].slice(0, 5),
        plats: rnd(PLAT_COMBOS),
        type: "image",
        timeStr: "9:00 AM",
        timesOptions: rnd(TIMES_POOL),
        img: images[i] ?? STOCK_IMAGES[i % STOCK_IMAGES.length],
        score: rndInt(72, 94),
        status: "scheduled",
        reach: rndInt(15, 110) * 1000,
        engRate: "8.5%",
        isAI: true,
      });
    }
    return posts;
  };

  const addIdeaPost = (idea: typeof IDEAS_LIST[0]) => {
    showToast(`✦ Generating: "${idea.title}"…`, "brand");
    setTimeout(() => {
      const d = new Date(today.getTime() + rndInt(3, 14) * 86400000);
      setPosts(prev => [...prev, { id: nextId, date: d, caption: rnd(CAPTIONS_POOL), hashtags: rnd(HASHTAG_POOLS), plats: rnd(PLAT_COMBOS), type: rnd(TYPE_POOL), timeStr: "7:45 AM", timesOptions: rnd(TIMES_POOL), img: rnd(STOCK_IMAGES), score: rndInt(72, 96), status: "scheduled", reach: rndInt(20, 90) * 1000, engRate: "9.1%", isAI: true }]);
      setNextId(n => n + 1);
      showToast("✅ Post generated!", "green");
    }, 1400);
  };

  const createPlanDirect = async () => {
    if (planLoading) return;

    const { industryId, subIndustryId } = resolveGeneratorProfileFields(
      (user ?? null) as Record<string, unknown> | null
    );
    const userSubIndustry = (user as Record<string, unknown>)?.subIndustryId as string | undefined;
    const effectiveSubIndustry = userSubIndustry || subIndustryId;

    if (!effectiveSubIndustry) {
      showToast("Please set your sub-industry in your profile settings", "red");
      return;
    }

    const prompt = `Create a complete monthly content plan for ${effectiveSubIndustry}, including educational, engagement, promotional, and trend-based posts.`;
    const startId = nextId;

    setPlanLoading(true);
    showToast("Creating your monthly plan...", "brand");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") || "" : "";
      const response = await createMonthlyPlan(
        {
          prompt,
          subIndustries: [effectiveSubIndustry],
          postTime: planPostTime,
        },
        token
      );

      if (!response.success) {
        showToast(response.message || "Failed to create plan", "red");
        return;
      }

      const planResponse = await getUserPlan(token);
      if (!planResponse.success || !planResponse.posts || planResponse.posts.length === 0) {
        showToast("Monthly plan created, but no posts were returned", "amber");
        return;
      }

      const selectedImages = await getSelectedSubIndustryImages(effectiveSubIndustry);
      const selectedImageQueue = [...selectedImages];
      const usedImageKeys = new Set<string>();

      const takeNextSelectedImage = () => {
        while (selectedImageQueue.length) {
          const candidate = selectedImageQueue.shift() || "";
          const key = imageFingerprint(candidate);
          if (candidate && key && !usedImageKeys.has(key)) {
            usedImageKeys.add(key);
            return candidate;
          }
        }
        return "";
      };

      const choosePlanImage = (backendImage?: string) => {
        const backend = (backendImage || "").trim();
        const backendKey = imageFingerprint(backend);
        if (backend && backendKey && !usedImageKeys.has(backendKey)) {
          usedImageKeys.add(backendKey);
          return backend;
        }

        const selectedFallback = takeNextSelectedImage();
        if (selectedFallback) return selectedFallback;

        if (backend) return backend;
        return FALLBACK_CALENDAR_IMAGE;
      };

      if (selectedImages.length < planResponse.posts.length) {
        showToast(
          `Only ${selectedImages.length} selected profile images found for ${planResponse.posts.length} posts. Using backend images for the rest.`,
          "amber"
        );
      }

      const mappedPosts = planResponse.posts.map((backendPost, index) => {
        const postDate = new Date(backendPost.postTime);
        return {
          id: startId + index,
          date: postDate,
          caption: backendPost.content?.text || "",
          hashtags: backendPost.content?.hashtags || [],
          plats: ["ig", "fb"] as PlatKey[],
          type: backendPost.media?.type === "REEL" ? "reel" : "image" as PostType,
          timeStr: postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timesOptions: TIMES_POOL[0],
          img: choosePlanImage(backendPost.media?.file),
          score: rndInt(75, 95),
          status: (backendPost.status.toLowerCase() as Status) || "scheduled",
          reach: rndInt(15, 110) * 1000,
          engRate: "8.5%",
          isAI: true,
        };
      });

      setPosts((prev) => {
        const existingKeys = new Set(prev.map((p) => `${p.date.toISOString()}|${p.caption}`));
        const additions = mappedPosts.filter(
          (p) => !existingKeys.has(`${p.date.toISOString()}|${p.caption}`)
        );
        const merged = [...prev, ...additions].sort((a, b) => a.date.getTime() - b.date.getTime());
        writeDashboardCalendarPosts(merged);
        return merged;
      });

      setNextId((prev) => Math.max(prev, startId + mappedPosts.length + 1));
      setView("month");
      setOffset(0);
      showToast(`✅ Plan created and ${mappedPosts.length} posts added to calendar`, "green");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create monthly plan";
      showToast(message, "red");
    } finally {
      setPlanLoading(false);
    }
  };

  const startAiGeneration = async () => {
    if (genInFlight) return;

    const { userId, industryId, subIndustryId } = resolveGeneratorProfileFields(
      (user ?? null) as Record<string, unknown> | null
    );

    if (!userId || !industryId || !subIndustryId) {
      showToast("Add user, industry and sub-industry in profile first.", "red");
      return;
    }

    const scheduleAt = new Date(today);
    scheduleAt.setDate(scheduleAt.getDate() + 1);
    scheduleAt.setHours(9, 0, 0, 0);

    // Pre-allocate 7 unique images from the industry-relevant pool — prevents any repeats
    const imageTopic = resolveTopicFromIndustry(industryId, subIndustryId);
    const preAllocatedImages = pickNonRepeatingImagePool(7, imageTopic);
    const usedImgs = new Set<string>();

    // Build 7 distinct content-angle prompts derived from the user's industry
    const anglesText = GENERATION_ANGLES.map((a, i) => `${i + 1}. ${a}`).join("; ");
    const industryPrompt = `Generate 7 unique high-performing social media posts for the ${subIndustryId} space within the ${industryId} industry. Each post must cover a different content angle in this exact order: ${anglesText}. Make every post distinct, engaging, and platform-optimised.`;

    let startId = nextId;
    let received = 0;

    setGenOpen(true);
    setGenInFlight(true);
    setGenProgress(5);
    setGenCount(0);
    setGenStatus("Connected. Waiting for chunks...");

    try {
      await streamGenerateAndSavePosts(
        {
          userId,
          industryId,
          subIndustryId,
          prompt: industryPrompt,
          postTime: scheduleAt.toISOString(),
        },
        {
          onChunk: (chunk) => {
            received += 1;
            const slotIndex = received - 1;
            const postDate = new Date(scheduleAt);
            postDate.setDate(postDate.getDate() + Math.max(0, chunk.index));

            // Use backend image only if it's non-empty and not already used in this batch
            const backendImg = chunk.post?.image?.imageUrl ?? "";
            let assignedImg: string;
            if (backendImg && !usedImgs.has(backendImg)) {
              assignedImg = backendImg;
            } else {
              // Use pre-allocated slot — guaranteed unique within the batch
              assignedImg = preAllocatedImages[slotIndex] ?? preAllocatedImages[0];
            }
            usedImgs.add(assignedImg);

            const localPost: Post = {
              id: startId + received,
              date: postDate,
              caption: chunk.post?.text || CAPTIONS_POOL[slotIndex % CAPTIONS_POOL.length],
              hashtags:
                chunk.post?.hashtags && chunk.post.hashtags.length
                  ? chunk.post.hashtags
                  : rnd(HASHTAG_POOLS),
              plats: rnd(PLAT_COMBOS),
              type: "image",
              timeStr: "9:00 AM",
              timesOptions: rnd(TIMES_POOL),
              img: assignedImg,
              score: chunk.post?.source === "LLM" ? rndInt(82, 96) : rndInt(70, 88),
              status: "scheduled",
              reach: rndInt(15, 110) * 1000,
              engRate: chunk.post?.source === "LLM" ? "9.4%" : "8.3%",
              isAI: true,
            };

            setPosts((prev) => [...prev, localPost]);
            setGenCount(received);
            setGenProgress(Math.min(95, Math.round((received / 7) * 100)));
            setGenStatus(`Received post ${received}/7 from ${chunk.post?.source || "stream"}`);
          },
          onDone: () => {
            setGenProgress(100);
            setGenStatus("Stream complete.");
          },
        }
      );

      setNextId(startId + Math.max(received, 1) + 1);
      showToast(`✦ ${received} AI posts generated & scheduled!`, "green");
    } catch (error) {
      const isNetworkError =
        error instanceof TypeError &&
        (error.message === "Failed to fetch" || error.message.includes("NetworkError") || error.message.includes("network"));
      console.warn("Calendar generate-and-save stream failed:", error);

      if (received === 0) {
        // Backend unreachable — generate all 7 posts locally using industry context
        setGenStatus("Backend unavailable. Generating locally...");
        const fallbackPosts = generatePostsLocally(
          industryId, subIndustryId, 7, scheduleAt, startId, preAllocatedImages
        );
        fallbackPosts.forEach((p, i) => {
          // Animate posts appearing one-by-one with a small delay
          setTimeout(() => {
            setPosts((prev) => [...prev, p]);
            saveDashboardCalendarPost(p);
            void upsertCalendarPostToBackend(p);
            setGenCount(i + 1);
            setGenProgress(Math.round(((i + 1) / 7) * 100));
            setGenStatus(`Generated post ${i + 1}/7`);
          }, i * 160);
        });
        setNextId(startId + 8);
        setTimeout(() => {
          setGenProgress(100);
          setGenStatus("Done.");
        }, 7 * 160 + 100);
        showToast(
          isNetworkError
            ? "✦ Backend offline — 7 posts generated locally!"
            : "✦ 7 posts generated (fallback mode)!",
          "brand"
        );
      } else {
        showToast(`✦ ${received} posts saved. Backend closed early.`, "amber");
      }
    } finally {
      setGenInFlight(false);
      setTimeout(() => setGenOpen(false), 1300);
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
        <div key={i} style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: "10px 8px 8px", borderRight: "1px solid #ECEDF8", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "#fff", position: "sticky", top: 0, zIndex: 10, borderBottom: "2px solid #E2E4F0" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "#8486AB" }}>{DAY_NAMES[d.getDay()]}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: isToday ? "#fff" : "#3D3F60", fontFamily: "Sora,sans-serif", lineHeight: 1.1, width: isToday ? 34 : undefined, height: isToday ? 34 : undefined, borderRadius: isToday ? "50%" : undefined, background: isToday ? "#5B5BD6" : undefined, display: isToday ? "flex" : undefined, alignItems: isToday ? "center" : undefined, justifyContent: isToday ? "center" : undefined, boxShadow: isToday ? "0 4px 20px rgba(91,91,214,.32)" : undefined }}>
              {isToday ? <span style={{ fontSize: 16 }}>{d.getDate()}</span> : d.getDate()}
            </div>
            <div style={{ fontSize: 10.5, color: "#BFC1D9", fontWeight: 500 }}>{dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}</div>
          </div>
          {/* Posts */}
          <div style={{ borderRight: "1px solid #ECEDF8", padding: 8, minHeight: 600, background: isWE ? "rgba(235,236,248,.35)" : isToday ? "rgba(91,91,214,.025)" : undefined, display: "flex", flexDirection: "column" }}>
            {dayPosts.map(p => <PostCard key={p.id} p={p} onOpen={() => openModal(p.id)} onDup={() => dupPost(p.id)} onDel={() => deletePost(p.id)} />)}
            <button onClick={() => openModal(null, d)} style={{ marginTop: "auto", padding: 8, borderRadius: 7, border: "1.5px dashed #E2E4F0", color: "#BFC1D9", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "transparent", width: "100%" }}>
              <i className="fa-solid fa-plus" style={{ fontSize: 11 }} /> Add Post
            </button>
          </div>
        </div>
      );
    }
    return <div style={{ display: "flex" }}>{cols}</div>;
  };

  const renderMonthGrid = (usePipeline = false) => {
    const anchor = getAnchor();
    const y = anchor.getFullYear(), mo = anchor.getMonth();
    const firstDow = new Date(y, mo, 1).getDay();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const prevDays = new Date(y, mo, 0).getDate();
    const cells: React.ReactNode[] = [];

    const addCell = (d: Date, isOther: boolean) => {
      const isToday = sameDay(d, today);
      const isWE = d.getDay() === 0 || d.getDay() === 6;
      const isFuture = d > today;
      const dayPosts = !isOther ? filtered.filter(p => sameDay(p.date, d)).sort((a, b) => a.timeStr.localeCompare(b.timeStr)) : [];
      cells.push(
        <div key={d.toISOString()} style={{ borderRight: "1px solid #ECEDF8", borderBottom: "1px solid #ECEDF8", padding: 6, minHeight: 160, background: isOther ? "#F4F5FB" : isWE ? "rgba(235,236,248,.3)" : isToday ? "rgba(91,91,214,.03)" : "#fff", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <div style={{ fontWeight: 700, color: isOther ? "#BFC1D9" : isToday ? "#fff" : "#3D3F60", width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: isToday ? "#5B5BD6" : undefined, boxShadow: isToday ? "0 4px 20px rgba(91,91,214,.32)" : undefined, flexShrink: 0, fontSize: isToday ? 11.5 : 12.5 }}>
              {d.getDate()}
            </div>
            {!isOther && <div onClick={() => openModal(null, d)} style={{ width: 20, height: 20, borderRadius: 5, background: "#EEEEFF", color: "#5B5BD6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer" }}>
              <i className="fa-solid fa-plus" />
            </div>}
          </div>
          {!isOther && (
            <>
              {usePipeline && isFuture && dayPosts.length === 0 && d.getDate() % 3 === 1 && (
                <div style={{ height: 70, borderRadius: 7, background: "linear-gradient(90deg,#EEEEFF 0%,#DDDDFB 50%,#EEEEFF 100%)", backgroundSize: "600px", animation: "shimmer 1.5s infinite" }} />
              )}
              {dayPosts.slice(0, 2).map(p => <MiniCard key={p.id} p={p} onOpen={() => openModal(p.id)} onDup={() => dupPost(p.id)} onDel={() => deletePost(p.id)} />)}
              {dayPosts.length > 2 && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "#5B5BD6", padding: "3px 7px", borderRadius: 5, background: "#EEEEFF", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                  <i className="fa-solid fa-layer-group" style={{ fontSize: 8 }} /> +{dayPosts.length - 2} more
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
        .mmc-actions { opacity: 0; transition: opacity .15s; }
        .mmc:hover .mmc-actions { opacity: 1; }
        .pc-hover-actions { opacity: 0; transition: opacity .14s; }
        .post-card:hover .pc-hover-actions { opacity: 1; }
        .tb-search:focus-within { width: 260px !important; border-color: #5B5BD6 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(91,91,214,.1) !important; }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* ── Sidebar (imported component) ── */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim(s => !s)} />

        {/* ── Main ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Topbar */}
          <AdminHeader
            pageTitle="Content Calendar"
            slim={sidebarSlim}
            onToggle={() => setSidebarSlim(s => !s)}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search posts…"
            actionButton={
              <button onClick={() => openModal(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 7, background: "#5B5BD6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(91,91,214,.32)" }}>
                <i className="fa-solid fa-plus" style={{ fontSize: 11 }} /> New Post
              </button>
            }
          />

          {/* Cal Toolbar */}
          <div style={{ flexShrink: 0, background: "#fff", borderBottom: "1px solid #E2E4F0" }}>
            {/* Row 1: View tabs + nav */}
            <div style={{ display: "flex", alignItems: "stretch", padding: "0 20px", gap: 4, borderBottom: "1px solid #ECEDF8" }}>
              {([["7d","fa-calendar-week","7 Days"],["month","fa-calendar","Monthly"],["pipeline","fa-robot","AI Pipeline"]] as const).map(([v, icon, label]) => (
                <div key={v} onClick={() => { setView(v); setOffset(0); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", fontSize: 13, fontWeight: 700, color: view === v ? "#5B5BD6" : "#8486AB", cursor: "pointer", position: "relative", whiteSpace: "nowrap", fontFamily: "Sora,sans-serif", borderBottom: `2px solid ${view === v ? "#5B5BD6" : "transparent"}`, height: 44 }}>
                  <i className={`fa-solid ${icon} fa-xs`} /> {label}
                  <span style={{ padding: "2px 7px", borderRadius: 8, fontSize: 10, fontWeight: 800, background: view === v ? "#EEEEFF" : "#F0F1F9", color: view === v ? "#5B5BD6" : "#8486AB" }}>
                    {v === "pipeline" ? "∞" : v === "7d" ? statSched : posts.filter(p => p.status !== "published").length}
                  </span>
                </div>
              ))}
              <div style={{ width: 1, background: "#ECEDF8", margin: "10px 8px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", marginLeft: "auto" }}>
                <div onClick={() => setOffset(o => view === "7d" ? o - 7 : o - 1)} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#3D3F60", cursor: "pointer", border: "1px solid #E2E4F0", background: "#fff", fontSize: 11 }}>
                  <i className="fa-solid fa-chevron-left" />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", minWidth: 160, textAlign: "center", letterSpacing: "-.2px" }}>{periodTitle}</div>
                <div onClick={() => setOffset(o => view === "7d" ? o + 7 : o + 1)} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#3D3F60", cursor: "pointer", border: "1px solid #E2E4F0", background: "#fff", fontSize: 11 }}>
                  <i className="fa-solid fa-chevron-right" />
                </div>
                <div onClick={() => setOffset(0)} style={{ padding: "5px 12px", borderRadius: 20, border: "1px solid #E2E4F0", background: "#fff", color: "#3D3F60", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>Today</div>
              </div>
            </div>
            {/* Row 2: Platform filters + AI Generate */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 20px" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
                {([
                  ["all", "All", "fa-border-all"] as [PlatKey | "all", string, string],
                  ...(Object.keys(PLAT_NAMES) as PlatKey[]).map(
                    (p): [PlatKey | "all", string, string] => [p, PLAT_NAMES[p], `fa-brands ${PLAT_ICONS[p]}`],
                  ),
                ]).map(([p, label, icon]) => {
                  const active = platFilter === p;
                  const bg = active ? (p === "all" ? "#5B5BD6" : PLAT_COLORS[p as PlatKey]) : undefined;
                  return (
                    <div key={p} onClick={() => setPlatFilter(p)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${active ? (p === "all" ? "#5B5BD6" : PLAT_COLORS[p as PlatKey]) : "#E2E4F0"}`, background: bg || "#fff", color: active ? "#fff" : "#8486AB", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                      <i className={icon} style={{ fontSize: 11 }} />{label}
                    </div>
                  );
                })}
              </div>
              <div style={{ width: 1, height: 24, background: "#E2E4F0", flexShrink: 0 }} />
              <button onClick={createPlanDirect} disabled={planLoading} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, background: "#10B981", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: planLoading ? "not-allowed" : "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(16,185,129,.32)", whiteSpace: "nowrap", flexShrink: 0, opacity: planLoading ? 0.7 : 1 }}>
                <i className="fa-solid fa-calendar-plus" style={{ fontSize: 12 }} /> {planLoading ? "Creating..." : "Create Plan"}
              </button>
              <button onClick={async () => {
                setUserPlanLoading(true);
                setUserPlanError("");
                try {
                  const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") || "" : "";
                  console.log("📋 Fetching user plan with token:", token ? "✓ Token present" : "✗ No token");
                  const response = await getUserPlan(token);
                  console.log("📋 User plan response:", response);
                  
                  if (response && response.success) {
                    console.log("📋 Plan fetched successfully:", response);
                    setUserPlanData(response);
                    setGetUserPlanOpen(true);
                  } else {
                    const errorMsg = response?.message || "Failed to fetch user plan";
                    console.log("📋 Plan fetch failed:", errorMsg);
                    setUserPlanError(errorMsg);
                  }
                } catch (error) {
                  const errorMsg = error instanceof Error ? error.message : "Failed to fetch user plan";
                  console.error("📋 Get user plan error:", errorMsg, error);
                  setUserPlanError(errorMsg);
                } finally {
                  setUserPlanLoading(false);
                }
              }} disabled={userPlanLoading} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, background: "#3B82F6", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: userPlanLoading ? "not-allowed" : "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(59,130,246,.32)", whiteSpace: "nowrap", flexShrink: 0, opacity: userPlanLoading ? 0.7 : 1 }}>
                <i className="fa-solid fa-file-lines" style={{ fontSize: 12 }} /> {userPlanLoading ? "Loading..." : "Get User Plan"}
              </button>
              <button onClick={startAiGeneration} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg,#5B5BD6,#7C3AED)", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(91,91,214,.32)", whiteSpace: "nowrap", flexShrink: 0 }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 12 }} /> AI Generate
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", background: "#F0F1F9", borderBottom: "1px solid #E2E4F0" }}>
            {[
              { dot:"#5B5BD6", val:statTotal, label:"Posts" },
              { dot:"#3B82F6", val:statSched, label:"Scheduled" },
              { dot:"#10B981", val:statPub,   label:"Published" },
              { dot:"#F59E0B", val:statDraft,  label:"Drafts" },
              { dot:"#EC4899", val:reachStr,   label:"Reach" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, border: "1px solid #E2E4F0", background: "#fff", fontSize: 12, fontWeight: 600, color: "#3D3F60", whiteSpace: "nowrap" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                <strong style={{ fontWeight: 800, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{s.val}</strong>&nbsp;{s.label}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "#EEEEFF", border: "1px solid #DDDDFB", color: "#5B5BD6", fontSize: 12, fontWeight: 700, marginLeft: "auto", fontFamily: "Sora,sans-serif" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#5B5BD6", animation: "pulse 2s ease-in-out infinite" }} />
              AI Pipeline Active
            </div>
          </div>

          {/* Calendar Area */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
              {view === "7d" && render7d()}
              {view === "month" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "2px solid #E2E4F0" }}>
                    {DAY_NAMES.map((n, i) => <div key={n} style={{ padding: 8, textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: i===0||i===6?"#BFC1D9":"#8486AB", borderRight: "1px solid #ECEDF8" }}>{n}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>{renderMonthGrid(false)}</div>
                </>
              )}
              {view === "pipeline" && (
                <>
                  <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 45%,#4338ca 75%,#6d28d9 100%)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif" }}>AI Content Pipeline — Rolling Generation</div>
                      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)", marginTop: 2 }}>New posts auto-generated every 7 days · Brand voice · Best times</div>
                    </div>
                    <button onClick={startAiGeneration} style={{ padding: "7px 14px", borderRadius: 7, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.22)", color: "rgba(255,255,255,.9)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>+ Generate More</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", position: "sticky", top: 66, zIndex: 9, background: "#fff", borderBottom: "2px solid #E2E4F0" }}>
                    {DAY_NAMES.map((n, i) => <div key={n} style={{ padding: 8, textAlign: "center", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: i===0||i===6?"#BFC1D9":"#8486AB", borderRight: "1px solid #ECEDF8" }}>{n}</div>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>{renderMonthGrid(true)}</div>
                </>
              )}
            </div>

            {/* Right Panel */}
            <RightPanel rpTab={rpTab} setRpTab={setRpTab} posts={filtered} onOpen={id => openModal(id)} onAddIdea={addIdeaPost} showToast={showToast} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal state={modal} posts={posts} today={today} onClose={closeModal} onSave={savePost} onDelete={deletePost} onDuplicate={dupPost} showToast={showToast} user={user} />

      {/* AI Generate Modal */}
      <GenModal open={genOpen} pct={genProgress} generatedCount={genCount} statusText={genStatus} />

      {/* Get User Plan Modal */}
      {getUserPlanOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(11,12,26,.55)", backdropFilter: "blur(8px)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setGetUserPlanOpen(false);
              setUserPlanError("");
            }
          }}
        >
          <div style={{ background: "#fff", borderRadius: 18, padding: "32px 38px", width: 560, maxHeight: "90vh", overflowY: "auto", textAlign: "left", boxShadow: "0 32px 80px rgba(11,12,26,.2)" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.3px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>📋 Your Content Plan</span>
              <button
                onClick={() => {
                  setGetUserPlanOpen(false);
                  setUserPlanError("");
                }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8486AB" }}
              >
                ✕
              </button>
            </div>

            {userPlanError && (
              <div style={{ background: "#FEF2F2", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#EF4444", fontWeight: 600 }}>
                ❌ {userPlanError}
              </div>
            )}

            {userPlanLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
                <div style={{ color: "#8486AB", fontSize: 14 }}>Loading your content plan...</div>
              </div>
            ) : userPlanData ? (
              <div>
                {/* Plan Metadata */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                  <div style={{ background: "#F8F9FC", border: "1px solid #E2E4F0", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8486AB", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Total Posts</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0B0C1A" }}>{userPlanData.meta?.totalPosts || userPlanData.posts?.length || 0}</div>
                  </div>
                  <div style={{ background: "#F8F9FC", border: "1px solid #E2E4F0", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8486AB", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Status</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#0B0C1A" }}>📅 Active</div>
                  </div>
                </div>

                {/* Connected Socials */}
                {(userPlanData.meta?.connectedSocials?.length || 0) > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A", marginBottom: 10 }}>🔗 Connected Platforms</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {userPlanData.meta?.connectedSocials?.map((s: unknown, i: number) => {
                        const platform = typeof s === "object" && s !== null && "platform" in s ? (s as Record<string, unknown>).platform : typeof s === "object" && s !== null && "name" in s ? (s as Record<string, unknown>).name : "Unknown";
                        return (
                          <span key={i} style={{ background: "#E8E8FF", color: "#5B5BD6", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                            {String(platform)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Posts List */}
                {(userPlanData.posts?.length || 0) > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A", marginBottom: 12 }}>📝 Scheduled Posts ({userPlanData.posts?.length || 0})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {userPlanData.posts?.slice(0, 5).map((post, i: number) => (
                        <div key={post.postId || i} style={{ background: "#F8F9FC", border: "1px solid #E2E4F0", borderRadius: 10, padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0B0C1A", marginBottom: 4 }}>Post #{i + 1}</div>
                              <div style={{ fontSize: 11.5, color: "#8486AB", marginBottom: 6, lineHeight: 1.4 }}>
                                {post.content?.text?.substring(0, 80)}
                                {(post.content?.text?.length || 0) > 80 ? "..." : ""}
                              </div>
                              <div style={{ fontSize: 10.5, color: "#8486AB" }}>
                                📅 {new Date(post.postTime).toLocaleDateString()} • {new Date(post.postTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                            <span style={{ background: post.status === "PUBLISHED" ? "#D1FAE5" : post.status === "SCHEDULED" ? "#FEF3C7" : "#E0E7FF", color: post.status === "PUBLISHED" ? "#047857" : post.status === "SCHEDULED" ? "#92400E" : "#4338CA", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>
                              {post.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {(userPlanData.posts?.length || 0) > 5 && (
                        <div style={{ textAlign: "center", padding: "10px", color: "#8486AB", fontSize: 12 }}>
                          +{(userPlanData.posts?.length || 0) - 5} more posts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => {
                  setGetUserPlanOpen(false);
                  setUserPlanError("");
                }}
                style={{ padding: "10px 18px", borderRadius: 8, background: "#fff", color: "#3D3F60", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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