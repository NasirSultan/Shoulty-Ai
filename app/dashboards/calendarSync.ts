"use client";

export type DashboardPlatKey = "ig" | "fb" | "li" | "tw" | "tk" | "yt" | "th";
export type DashboardPostType = "image" | "reel" | "carousel" | "story";
export type DashboardStatus = "scheduled" | "draft" | "published";

export interface DashboardTimeSlot {
  t: string;
  e: string;
  best: boolean;
}

export interface DashboardCalendarPost {
  id: number;
  date: Date;
  caption: string;
  hashtags: string[];
  plats: DashboardPlatKey[];
  type: DashboardPostType;
  timeStr: string;
  timesOptions: DashboardTimeSlot[];
  img: string;
  score: number;
  status: DashboardStatus;
  reach: number;
  engRate: string;
  isAI: boolean;
}

interface StoredCalendarPost extends Omit<DashboardCalendarPost, "date"> {
  date: string;
}

export const DASHBOARD_CALENDAR_STORAGE_KEY = "shoutly.dashboard.calendar.posts";
export const DASHBOARD_CALENDAR_EVENT = "shoutly:calendar-posts-updated";

const isBrowser = typeof window !== "undefined";

const getScopedCalendarStorageKey = () => {
  if (!isBrowser) return DASHBOARD_CALENDAR_STORAGE_KEY;

  try {
    const raw = window.localStorage.getItem("shoutly_user");
    if (!raw) return DASHBOARD_CALENDAR_STORAGE_KEY;
    const user = JSON.parse(raw) as { id?: string | number; email?: string };
    const scope =
      (typeof user.id === "string" || typeof user.id === "number"
        ? String(user.id)
        : "") ||
      (typeof user.email === "string" ? user.email.trim().toLowerCase() : "");
    if (!scope) return DASHBOARD_CALENDAR_STORAGE_KEY;
    return `${DASHBOARD_CALENDAR_STORAGE_KEY}.${scope}`;
  } catch {
    return DASHBOARD_CALENDAR_STORAGE_KEY;
  }
};

const serializePost = (post: DashboardCalendarPost): StoredCalendarPost => ({
  ...post,
  date: post.date.toISOString(),
});

const deserializePost = (post: StoredCalendarPost): DashboardCalendarPost => ({
  ...post,
  date: new Date(post.date),
});

export function readDashboardCalendarPosts(): DashboardCalendarPost[] {
  if (!isBrowser) return [];

  try {
    const raw = window.localStorage.getItem(getScopedCalendarStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCalendarPost[];
    return parsed.map(deserializePost);
  } catch {
    return [];
  }
}

export function writeDashboardCalendarPosts(posts: DashboardCalendarPost[]) {
  if (!isBrowser) return;

  window.localStorage.setItem(
    getScopedCalendarStorageKey(),
    JSON.stringify(posts.map(serializePost)),
  );
  window.dispatchEvent(new CustomEvent(DASHBOARD_CALENDAR_EVENT));
}

export function saveDashboardCalendarPost(post: DashboardCalendarPost) {
  if (!isBrowser) return;

  const existing = readDashboardCalendarPosts();
  const filtered = existing.filter((item) => item.id !== post.id);
  const next = [...filtered, post].sort((a, b) => a.date.getTime() - b.date.getTime());
  writeDashboardCalendarPosts(next);
}

export function removeDashboardCalendarPost(id: number) {
  if (!isBrowser) return;
  const existing = readDashboardCalendarPosts();
  const next = existing.filter((item) => item.id !== id);
  writeDashboardCalendarPosts(next);
}
