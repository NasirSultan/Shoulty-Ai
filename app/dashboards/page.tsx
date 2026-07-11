"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { API_ENDPOINTS } from "@/api/configApi";

// ── palette ───────────────────────────────────────────────────────────────────
const GRAD   = "linear-gradient(115deg,#F97316,#EA580C)";

// ── icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  star:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4L12 3Z"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"   strokeLinecap="round" strokeLinejoin="round"><path d="m4 12 5 5L20 6"/></svg>,
  trend:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>,
  chat:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/></svg>,
  clock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4m8-4v4"/></svg>,
  img:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-4 3 2 5-5 5 5"/></svg>,
  reel:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>,
  link:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>,
  brand:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 11.5c3 0 4 2 4 4 0 3-2.5 5.5-8 5.5S3 18 3 12.5 7 3 12 3"/></svg>,
  campaign: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 21 3l-8 18-2.5-7.5L3 11Z"/></svg>,
  book:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13"/><path d="M4 19a2 2 0 0 0 2 2h14M9 8h6"/></svg>,
};

// ── platform visual map ───────────────────────────────────────────────────────
const PLAT_MAP: Record<string, { nm: string; ch: string; cls: string }> = {
  FACEBOOK:   { nm: "Facebook",   ch: "f",  cls: "#1877F2" },
  INSTAGRAM:  { nm: "Instagram",  ch: "IG", cls: "radial-gradient(circle at 30% 110%,#FDB750 0%,#D53692 55%,#743BC8 100%)" },
  LINKEDIN:   { nm: "LinkedIn",   ch: "in", cls: "#0A66C2" },
  X:          { nm: "X",          ch: "𝕏",  cls: "#111" },
  TIKTOK:     { nm: "TikTok",     ch: "TT", cls: "#0F0F14" },
  YOUTUBE:    { nm: "YouTube",    ch: "▶",  cls: "#FF0000" },
  PINTEREST:  { nm: "Pinterest",  ch: "P",  cls: "#E60023" },
  THREADS:    { nm: "Threads",    ch: "@",  cls: "#1A1A1A" },
  GOOGLE_BIZ: { nm: "G Business", ch: "G", cls: "#4285F4" },
  BLUESKY:    { nm: "Bluesky",    ch: "B",  cls: "#1185FE" },
};

// ── API types ─────────────────────────────────────────────────────────────────
interface DashData {
  greeting: { name: string; date: string; nextPostAt: string };
  subIndustrySelected: boolean;
  industry: { id: string; name: string } | null;
  subIndustry: { id: string; name: string } | null;
  subscription: { plan: string; isPurchased: boolean };
  insight: { message: string; engagementGrowthPct: number };
  autopilot: {
    active: boolean;
    postsGenerated: number;
    postsScheduled: number;
    platformsConnected: { connected: number; total: number };
    nextScheduledPost: { time: string; title: string };
  };
  upcomingFestival: { name: string; date: string; imageUrl: string };
  trendingHashtags: string[];
  quickNotes: { text: string; updatedAt: string };
  recentActivity: Array<{ type: string; message: string; time: string }>;
  upcomingPosts: {
    today: Array<{ time: string; title: string; platforms: string[] }>;
    tomorrow: Array<{ time: string; title: string; platforms: string[] }>;
    thisWeek: Array<{ time: string; title: string; platforms: string[] }>;
  };
  connectedPlatforms: Array<{
    platform: string;
    connected: boolean;
    supported: boolean;
    username: string | null;
    avatarUrl: string | null;
  }>;
  analytics: { totalFollowers: number; postsQueued: number; avgEngagementRate: number };
  brandHealth: {
    score: number;
    breakdown: { contentConsistency: number; postingFrequency: number; profileCompletion: number };
    suggestion: string;
  };
}

// ── dashboard cache (1 hour) ────────────────────────────────────────────────
const DASH_CACHE_KEY = "shoutly:dashboard:v1";
const DASH_CACHE_TTL_MS = 60 * 60 * 1000;

function readDashCache(): DashData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DASH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number; data: DashData };
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > DASH_CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeDashCache(data: DashData) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DASH_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // ignore storage quota / private-mode errors
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────
function getCountdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtFestivalDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const tom = new Date(now); tom.setDate(tom.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === tom.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtUpcomingTime(iso: string, group: "today" | "tomorrow" | "thisWeek") {
  if (group === "thisWeek") return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
  return fmtTime(iso);
}

function activityMeta(type: string): { icon: React.ReactElement; ok: boolean } {
  if (type === "post_published" || type === "posts_scheduled") return { icon: Icon.check, ok: true };
  if (type === "posts_generated") return { icon: Icon.star, ok: false };
  return { icon: Icon.clock, ok: false };
}

// ── component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useUserProfile();

  // API state
  const [dash, setDash]           = useState<DashData | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [noteText, setNoteText]   = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // UI animation state
  const [ringAnimated, setRingAnimated] = useState(false);
  const [counts, setCounts] = useState({ posts: 0, scheduled: 0, platforms: 0 });
  const ringRef = useRef<SVGCircleElement>(null);

  // ── auth helper ──
  const authHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── fetch dashboard + notes on mount (dashboard cached for 1 hour) ──
  useEffect(() => {
    const headers = authHeaders();
    const cached = readDashCache();

    if (cached) {
      // Fresh cache hit — skip the dashboard call entirely, notes still fetched live.
      setDash(cached);
      setDashLoading(false);
      fetch(API_ENDPOINTS.notes, { headers }).then(r => r.ok ? r.json() : null)
        .then(notesData => {
          if (notesData?.text) setNoteText(notesData.text);
          else if (cached.quickNotes?.text) setNoteText(cached.quickNotes.text);
        })
        .catch(console.error);
      return;
    }

    setDashLoading(true);
    Promise.all([
      fetch(API_ENDPOINTS.dashboard, { headers }).then(r => r.ok ? r.json() : null),
      fetch(API_ENDPOINTS.notes,     { headers }).then(r => r.ok ? r.json() : null),
    ])
      .then(([dashData, notesData]) => {
        if (dashData) { setDash(dashData); writeDashCache(dashData); }
        if (notesData?.text) setNoteText(notesData.text);
        else if (dashData?.quickNotes?.text) setNoteText(dashData.quickNotes.text);
      })
      .catch(console.error)
      .finally(() => setDashLoading(false));
  }, []);

  // ── animate counts when dash data arrives ──
  useEffect(() => {
    if (!dash) return;
    const targets = {
      posts:     dash.autopilot.postsGenerated,
      scheduled: dash.autopilot.postsScheduled,
      platforms: dash.autopilot.platformsConnected.connected,
    };
    const dur = 800;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts({
        posts:     Math.round(targets.posts * e),
        scheduled: Math.round(targets.scheduled * e),
        platforms: Math.round(targets.platforms * e),
      });
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 300);
  }, [dash]);

  // ── ring animation ──
  useEffect(() => {
    const t = setTimeout(() => setRingAnimated(true), 500);
    return () => clearTimeout(t);
  }, []);

  // ── notes: debounced PATCH ──
  const handleNoteChange = (text: string) => {
    setNoteText(text);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      setNoteSaving(true);
      try {
        await fetch(API_ENDPOINTS.notes, {
          method: "PATCH",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      } finally {
        setNoteSaving(false);
      }
    }, 800);
  };

  // ── derived values ──
  const firstName      = user?.name?.split(" ")[0] || dash?.greeting.name || "there";
  const today          = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const nextCountdown  = dash?.greeting.nextPostAt ? getCountdown(dash.greeting.nextPostAt) : "—";
  const insightMsg     = dash?.insight.message ?? "Your engagement grew 18% this week — keep it going!";
  const score          = dash?.brandHealth.score ?? 0;
  const breakdown      = dash?.brandHealth.breakdown;
  const suggestion     = dash?.brandHealth.suggestion ?? "Schedule 1 more post this week to lift posting frequency.";
  const R = 64, C = 2 * Math.PI * R;
  const offset = ringAnimated ? C * (1 - score / 100) : C;

  // platforms
  const connectedPlats = dash?.connectedPlatforms ?? [];
  const totalConnected = dash?.autopilot.platformsConnected.total ?? 10;

  // upcoming posts groups
  const upcomingGroups: Array<{ day: string; group: "today" | "tomorrow" | "thisWeek"; items: DashData["upcomingPosts"]["today"] }> = dash ? (
    [
      { day: "Today",     group: "today"     as const, items: dash.upcomingPosts.today },
      { day: "Tomorrow",  group: "tomorrow"  as const, items: dash.upcomingPosts.tomorrow },
      { day: "This week", group: "thisWeek"  as const, items: dash.upcomingPosts.thisWeek },
    ] as const
  ).filter(g => g.items.length > 0) : [];

  // trending hashtags
  const hashtags = dash?.trendingHashtags ?? ["#coffeeday", "#mondaymotivation", "#smallbusiness", "#reels", "#fitnessjourney", "#monsoon"];

  // festival
  const festival = dash?.upcomingFestival;

  // analytics
  const analytics = dash?.analytics;

  // activity
  const activity = dash?.recentActivity ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        .db-body { font-family:'Inter',system-ui,sans-serif; background:#F9FAFB; color:#111827; font-size:14.5px; line-height:1.55; min-height:100vh; }
        .font-display { font-family:'Space Grotesk',system-ui,sans-serif; font-weight:700; }
        .grad-text { background:${GRAD}; -webkit-background-clip:text; background-clip:text; color:transparent; }
        .ring-fg { transition:stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1); }
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,.4)}55%{box-shadow:0 0 0 6px transparent}}
        .pulse-dot{animation:pulse 2s infinite}
        .qa-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px -4px rgba(249,115,22,.18);border-color:rgba(249,115,22,.35);}
        .ichip:hover{border-color:rgba(249,115,22,.5);background:#FFF7ED!important;transform:translateY(-1px);}
        .uitem:hover{background:#FFF7ED}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .skeleton{background:linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%);background-size:200% 100%;animation:shimmer 1.2s ease-in-out infinite;border-radius:6px;}
      `}</style>

      <div className="db-body" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* TOPBAR */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #F3F4F6", padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <nav style={{ fontSize: ".75rem", color: "#9CA3AF" }}>
            Workspace&nbsp;<span>/</span>&nbsp;<b style={{ color: "#111827", fontWeight: 500 }}>Dashboard</b>
          </nav>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "28px 28px 0", maxWidth: 1360, margin: "0 auto", width: "100%" }}>

          {/* ── MAIN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Greeting */}
            <div>
              <h1 className="font-display" style={{ fontSize: "1.55rem", letterSpacing: "-.02em", color: "#111827" }}>
                Welcome back, {firstName}
              </h1>
              <p style={{ fontSize: ".78rem", color: "#9CA3AF", marginTop: 3 }}>
                {today} · next post in <b style={{ color: "#111827" }}>{nextCountdown}</b>
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#6B7280", fontSize: ".84rem", padding: "7px 13px", borderRadius: 99 }}>
                <span style={{ width: 13, height: 13, color: "#F97316", flexShrink: 0 }}>{Icon.star}</span>
                {dashLoading ? <span className="skeleton" style={{ width: 280, height: 14 }} /> : insightMsg}
              </span>
              {dash?.subIndustrySelected && (
                <Link
                  href="/dashboards/settings"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, marginLeft: 10, background: "#fff", border: "1px solid #E5E7EB", color: "#374151", fontSize: ".84rem", padding: "7px 13px", borderRadius: 99, textDecoration: "none" }}
                >
                  <span style={{ width: 13, height: 13, color: "#F97316", flexShrink: 0 }}>{Icon.brand}</span>
                  <b style={{ color: "#111827", fontWeight: 600 }}>{dash.subIndustry?.name}</b>
                  {dash.industry && (
                    <span style={{ color: "#9CA3AF" }}>· {dash.industry.name}</span>
                  )}
                </Link>
              )}
            </div>

            {/* INDUSTRY NOT SELECTED */}
            {dash && !dash.subIndustrySelected && (
              <section style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "#FEF3C7", display: "grid", placeItems: "center", color: "#D97706", flexShrink: 0 }}>
                    <span style={{ width: 16, height: 16 }}>{Icon.brand}</span>
                  </span>
                  <div>
                    <b style={{ fontSize: ".86rem", color: "#111827", display: "block" }}>Select your industry</b>
                    <span style={{ fontSize: ".78rem", color: "#6B7280" }}>Choose your industry & sub-category so we can personalize your content.</span>
                  </div>
                </div>
                <Link href="/dashboards/settings" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: ".8rem", fontWeight: 700, textDecoration: "none", background: GRAD, color: "#fff", boxShadow: "0 4px 12px -3px rgba(249,115,22,.45)", flexShrink: 0 }}>
                  Select industry
                </Link>
              </section>
            )}

            {/* HERO / Autopilot */}
            <section style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 50%,#FEF3C7 100%)", border: "1px solid #FED7AA", boxShadow: "0 4px 16px -4px rgba(249,115,22,.12)", padding: "28px 30px" }}>
              <span style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,.08)", pointerEvents: "none" }} />
              <span style={{ position: "absolute", right: 60, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(234,88,12,.06)", pointerEvents: "none" }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: ".68rem", letterSpacing: ".13em", textTransform: "uppercase", color: "#16A34A", background: "#DCFCE7", padding: "5px 12px", borderRadius: 99, border: "1px solid #86EFAC" }}>
                <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                {dash?.autopilot.active ? "Autopilot active" : "Autopilot"}
              </span>
              <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)", letterSpacing: "-.02em", margin: "12px 0 18px", color: "#111827", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: GRAD, display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 12px -2px rgba(249,115,22,.4)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                </span>
                Your social media is running on autopilot
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11, marginBottom: 20 }}>
                {[
                  { k: "Posts generated",     v: counts.posts,     suffix: "" },
                  { k: "Posts scheduled",     v: counts.scheduled, suffix: "" },
                  { k: "Platforms connected", v: counts.platforms, suffix: ` / ${totalConnected}` },
                  { k: "Next scheduled post", v: dash?.autopilot.nextScheduledPost ? fmtTime(dash.autopilot.nextScheduledPost.time) : "—", suffix: "", raw: true },
                ].map(({ k, v, suffix, raw }) => (
                  <div key={k} style={{ background: "rgba(255,255,255,.8)", backdropFilter: "blur(8px)", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                      <span style={{ width: 11, height: 11, color: "#16A34A" }}>{Icon.check}</span>{k}
                    </span>
                    <div className="font-display" style={{ fontSize: "1.3rem", letterSpacing: "-.02em", marginTop: 4, color: "#111827" }}>
                      {dashLoading ? <span className="skeleton" style={{ display: "block", width: 48, height: 22 }} /> : <>{v}<small style={{ fontSize: ".75rem", color: "#9CA3AF", fontWeight: 600 }}>{suffix}</small></>}
                    </div>
                  </div>
                ))}
              </div>
              {dash?.autopilot.nextScheduledPost && (
                <p style={{ fontSize: ".78rem", color: "#6B7280", marginBottom: 16 }}>
                  Next: <b style={{ color: "#111827" }}>{dash.autopilot.nextScheduledPost.title}</b>
                </p>
              )}
            </section>

            {/* ACTIVITY + UPCOMING */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Activity */}
              <section style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 18px 0" }}>
                  <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Today's activity</h2>
                </div>
                <div style={{ padding: "4px 18px 14px" }}>
                  {dashLoading ? (
                    [0,1,2].map(i => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0" }}>
                        <span className="skeleton" style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0 }} />
                        <span className="skeleton" style={{ flex: 1, height: 14, marginTop: 4 }} />
                      </div>
                    ))
                  ) : activity.length > 0 ? (
                    activity.slice(0, 3).map((item, i, arr) => {
                      const { icon, ok } = activityMeta(item.type);
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", position: "relative", minWidth: 0 }}>
                          {i < arr.length - 1 && <span style={{ position: "absolute", left: 11, top: 34, bottom: -8, width: 2, background: "#F3F4F6" }} />}
                          <span style={{ width: 24, height: 24, borderRadius: "50%", background: ok ? "#DCFCE7" : "#FFF7ED", color: ok ? "#16A34A" : "#F97316", display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1 }}>
                            <span style={{ width: 11, height: 11 }}>{icon}</span>
                          </span>
                          <span style={{ fontSize: ".85rem", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <b style={{ fontWeight: 500 }}>{item.message}</b>
                            <span style={{ display: "block", fontSize: ".69rem", color: "#9CA3AF", marginTop: 1 }}>{fmtTime(item.time)}</span>
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ fontSize: ".84rem", color: "#9CA3AF", padding: "12px 0" }}>No activity yet today.</p>
                  )}
                </div>
              </section>

              {/* Upcoming posts */}
              <section style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 18px 0" }}>
                  <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Upcoming posts</h2>
                  <Link href="/dashboards/calendar" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none", flexShrink: 0 }}>Full calendar →</Link>
                </div>
                <div style={{ padding: "4px 18px 14px" }}>
                  {dashLoading ? (
                    [0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 32, marginBottom: 8, borderRadius: 8 }} />)
                  ) : upcomingGroups.length > 0 ? (
                    upcomingGroups.map(({ day, group, items }) => (
                      <div key={day}>
                        <div style={{ fontSize: ".66rem", letterSpacing: ".11em", textTransform: "uppercase", color: "#9CA3AF", padding: "10px 0 5px" }}>{day}</div>
                        {items.slice(0, group === "thisWeek" ? 2 : 3).map(post => (
                          <div key={post.title} className="uitem" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 9, cursor: "pointer", transition: "background .15s", minWidth: 0 }}>
                            <span style={{ fontSize: ".72rem", color: "#6B7280", width: 52, flexShrink: 0 }}>{fmtUpcomingTime(post.time, group)}</span>
                            <span style={{ flex: 1, minWidth: 0, fontSize: ".84rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</span>
                            {post.platforms.slice(0, 3).map(pl => {
                              const pm = PLAT_MAP[pl];
                              if (!pm) return null;
                              return (
                                <span key={pl} style={{ width: 19, height: 19, borderRadius: 6, background: pm.cls, display: "grid", placeItems: "center", color: "#fff", fontSize: ".5rem", fontWeight: 700, flexShrink: 0 }}>{pm.ch}</span>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: ".84rem", color: "#9CA3AF", padding: "12px 0" }}>No upcoming posts scheduled.</p>
                  )}
                </div>
              </section>
            </div>

            {/* CONNECTED PLATFORMS */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
                <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Connected platforms</h2>
                <Link href="/dashboards/settings/accounts" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>Manage →</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 11 }}>
                {dashLoading ? (
                  [0,1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />)
                ) : connectedPlats.map(p => {
                  const pm = PLAT_MAP[p.platform];
                  if (!pm) return null;
                  return (
                    <div key={p.platform} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 13px", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ width: 25, height: 25, borderRadius: 8, background: pm.cls, display: "grid", placeItems: "center", color: "#fff", fontSize: ".55rem", fontWeight: 700 }}>{pm.ch}</span>
                        <span style={{ fontSize: ".6rem", padding: "2px 7px", borderRadius: 99, background: p.connected ? "#DCFCE7" : p.supported ? "#FEF3C7" : "#F3F4F6", color: p.connected ? "#16A34A" : p.supported ? "#D97706" : "#9CA3AF" }}>
                          {p.connected ? "Connected" : p.supported ? "Connect" : "Soon"}
                        </span>
                      </div>
                      <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#111827" }}>{pm.nm}</div>
                      <div style={{ fontSize: ".65rem", color: "#9CA3AF", marginTop: 3 }}>
                        {p.connected && p.username ? `@${p.username}` : p.supported ? "Not connected" : "Coming soon"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* UPCOMING FESTIVAL */}
            {(dashLoading || festival) && (
              <section style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)", padding: "16px 18px" }}>
                <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827", marginBottom: 12 }}>Upcoming festival</h2>
                {dashLoading ? (
                  <div className="skeleton" style={{ height: 54, borderRadius: 12 }} />
                ) : festival ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 14px" }}>
                    <span style={{ width: 38, height: 38, borderRadius: 10, background: GRAD, display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 }}>
                      <span style={{ width: 17, height: 17 }}>{Icon.star}</span>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: ".88rem", color: "#111827", display: "block" }}>{festival.name}</b>
                      <span style={{ fontSize: ".74rem", color: "#9CA3AF" }}>{fmtFestivalDate(festival.date)}</span>
                    </div>
                    <Link href="/dashboards/calendar" style={{ fontSize: ".8rem", fontWeight: 600, color: "#F97316", textDecoration: "none", flexShrink: 0 }}>Plan post →</Link>
                  </div>
                ) : null}
              </section>
            )}

            {/* PERFORMANCE SNAPSHOT */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
                <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Performance snapshot</h2>
                <Link href="/dashboards/analytics" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>Analytics →</Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11 }}>
                {[
                  { k: "Total followers",  v: analytics ? analytics.totalFollowers.toLocaleString() : "—",   trend: "▲ 9.4%",       up: true },
                  { k: "Avg engagement",   v: analytics ? `${analytics.avgEngagementRate}%` : "—",           trend: "▲ 0.7 pts",    up: true },
                  { k: "Posts queued",     v: analytics ? String(analytics.postsQueued) : "—",               trend: "ready to send", up: true },
                  { k: "Platforms live",   v: dash ? `${dash.autopilot.platformsConnected.connected} / ${dash.autopilot.platformsConnected.total}` : "—", trend: "active", up: true },
                ].map(({ k, v, trend, up }) => (
                  <div key={k} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 15px", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                    <span style={{ fontSize: ".65rem", letterSpacing: ".11em", textTransform: "uppercase", color: "#9CA3AF" }}>{k}</span>
                    <div className="font-display" style={{ fontSize: "1.4rem", letterSpacing: "-.02em", margin: "5px 0 3px", color: "#111827" }}>
                      {dashLoading ? <span className="skeleton" style={{ display: "block", width: 60, height: 24 }} /> : v}
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: ".7rem", padding: "2px 8px", borderRadius: 99, background: up ? "#DCFCE7" : "#FEF3C7", color: up ? "#16A34A" : "#D97706" }}>{trend}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* BRAND HEALTH */}
            <section style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)", marginBottom: 0 }}>
              <div style={{ padding: "16px 22px 0" }}>
                <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Brand health</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24, alignItems: "center", padding: "20px 22px" }}>
                <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto" }}>
                  <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
                    <defs>
                      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#F97316"/>
                        <stop offset="1" stopColor="#EA580C"/>
                      </linearGradient>
                    </defs>
                    <circle cx="75" cy="75" r={R} fill="none" stroke="#F3F4F6" strokeWidth="11" />
                    <circle ref={ringRef} cx="75" cy="75" r={R} fill="none" stroke="url(#rg)" strokeWidth="11" strokeLinecap="round"
                      className="ring-fg"
                      style={{ strokeDasharray: C, strokeDashoffset: offset }} />
                  </svg>
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
                    <span>
                      <b className="font-display" style={{ fontSize: "1.9rem", letterSpacing: "-.02em", color: "#111827", display: "block" }}>{score}</b>
                      <span style={{ fontSize: ".64rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".1em" }}>/ 100</span>
                    </span>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {[
                    { label: "Content consistency", w: breakdown?.contentConsistency ?? 0 },
                    { label: "Posting frequency",    w: breakdown?.postingFrequency  ?? 0 },
                    { label: "Profile completion",   w: breakdown?.profileCompletion ?? 0 },
                  ].map(({ label, w }) => (
                    <div key={label} style={{ display: "grid", gridTemplateColumns: "150px 1fr 36px", gap: 12, alignItems: "center", fontSize: ".84rem", fontWeight: 500, color: "#374151" }}>
                      <span>{label}</span>
                      <span style={{ height: 7, borderRadius: 99, background: "#F3F4F6", overflow: "hidden" }}>
                        <span style={{ display: "block", height: "100%", borderRadius: 99, background: GRAD, width: ringAnimated ? `${w}%` : "0%", transition: "width 1s cubic-bezier(.22,1,.36,1)" }} />
                      </span>
                      <span style={{ fontSize: ".72rem", color: "#9CA3AF", textAlign: "right" }}>{w}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 9, alignItems: "center", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "9px 13px", fontSize: ".82rem", color: "#6B7280" }}>
                    <span style={{ width: 14, height: 14, color: "#F97316", flexShrink: 0 }}>{Icon.star}</span>
                    {suggestion}
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

      </div>
    </>
  );
}
