"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import Sidebar from "./Sidebar";
import { API_ENDPOINTS } from "@/api/configApi";

// ── Orange / white palette (matches homepage) ──────────────────────────────
const GRAD = "linear-gradient(115deg,#F97316,#EA580C)";
const GRAD_R = "linear-gradient(115deg,#EA580C,#F97316)";

// ── SVG Icons ──────────────────────────────────────────────────────────────
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

const PLATS = [
  { nm: "LinkedIn",   ch: "in", cls: "#0A66C2", on: true,  posts: 18, next: "Tue 11:00" },
  { nm: "Facebook",   ch: "f",  cls: "#1877F2", on: false, posts: 12, next: "—" },
  { nm: "Instagram",  ch: "IG", cls: "radial-gradient(circle at 30% 110%,#FDB750 0%,#D53692 55%,#743BC8 100%)", on: true, posts: 26, next: "Today 21:00" },
  { nm: "X",          ch: "𝕏", cls: "#111",    on: true,  posts: 14, next: "Tue 11:00" },
  { nm: "TikTok",     ch: "TT", cls: "#0F0F14", on: true,  posts: 16, next: "Today 21:00" },
  { nm: "YouTube",    ch: "▶",  cls: "#FF0000", on: true,  posts: 4,  next: "Tomorrow 18:45" },
  { nm: "Pinterest",  ch: "P",  cls: "#E60023", on: true,  posts: 7,  next: "Wed 12:30" },
  { nm: "Threads",    ch: "@",  cls: "#1A1A1A", on: true,  posts: 9,  next: "Wed 10:00" },
  { nm: "G Business", ch: "G",  cls: "#4285F4", on: true,  posts: 6,  next: "Thu 09:00" },
  { nm: "Bluesky",    ch: "B",  cls: "#1185FE", on: true,  posts: 8,  next: "Fri 17:00" },
];

const QUICK = [
  { label: "Generate content",  icon: Icon.star,     grad: GRAD,                                              href: "/" },
  { label: "Generate images",   icon: Icon.img,      grad: "linear-gradient(125deg,#F97316,#DC2626)",        href: "/dashboards/library" },
  { label: "Generate reel",     icon: Icon.reel,     grad: "linear-gradient(125deg,#EA580C,#7C3AED)",        href: "/dashboards/library" },
  { label: "Schedule posts",    icon: Icon.calendar, grad: "linear-gradient(125deg,#16A34A,#F97316)",        href: "/dashboards/calendar" },
  { label: "Browse library",    icon: Icon.book,     grad: "linear-gradient(125deg,#0E7490,#F97316)",        href: "/dashboards/library" },
  { label: "Create campaign",   icon: Icon.campaign, grad: "linear-gradient(125deg,#1D4ED8,#F97316)",        href: "/dashboards/calendar" },
  { label: "Connect account",   icon: Icon.link,     grad: "linear-gradient(125deg,#F97316,#EA580C)",        href: "/dashboards/settings/accounts" },
  { label: "Brand kit",         icon: Icon.brand,    grad: "linear-gradient(125deg,#7C3AED,#F97316)",        href: "/dashboards/settings/brand" },
];

const CREATIONS = [
  { cls: GRAD },
  { cls: "linear-gradient(125deg,#F97316,#DC2626)" },
  { cls: "linear-gradient(160deg,#EA580C,#7C3AED)" },
  { cls: "linear-gradient(125deg,#16A34A,#F97316)" },
  { cls: "linear-gradient(140deg,#F97316,#D53692)" },
  { cls: "linear-gradient(125deg,#0E7490,#EA580C)" },
];

export default function DashboardPage() {
  const { user, initials } = useUserProfile();
  const [ringAnimated, setRingAnimated] = useState(false);
  const [counts, setCounts] = useState({ posts: 0, scheduled: 0, platforms: 0 });
  const ringRef = useRef<SVGCircleElement>(null);

  const firstName = user?.name?.split(" ")[0] || "there";
  const userInitials = initials || "U";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    const targets = { posts: 214, scheduled: 151, platforms: 9 };
    const dur = 800;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts({ posts: Math.round(targets.posts * e), scheduled: Math.round(targets.scheduled * e), platforms: Math.round(targets.platforms * e) });
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 300);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setRingAnimated(true), 500);
    return () => clearTimeout(t);
  }, []);

  const SCORE = 92;
  const R = 64;
  const C = 2 * Math.PI * R;
  const offset = ringAnimated ? C * (1 - SCORE / 100) : C;

  // Inline chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{type:"bot"|"user";text:string}[]>([
    { type: "bot", text: "👋 Hi! I'm Shoutly AI. Ask me anything about your account, features, or content strategy." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, chatLoading]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMsgs(p => [...p, { type: "user", text: q }]);
    setChatLoading(true);
    try {
      const r = await fetch(API_ENDPOINTS.ragChat, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ query: q, topK: 5 }),
      });
      const d = await r.json();
      setChatMsgs(p => [...p, { type: "bot", text: r.ok && d.success ? d.answer : "Sorry, something went wrong. Please try again." }]);
    } catch {
      setChatMsgs(p => [...p, { type: "bot", text: "Couldn't connect. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

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
        @keyframes typingDot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
        .chat-scroll::-webkit-scrollbar{width:3px}.chat-scroll::-webkit-scrollbar-thumb{background:rgba(249,115,22,.25);border-radius:3px}
      `}</style>

      <div className="db-body" style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── SIDEBAR ── */}
        <Sidebar />

        {/* ── MAIN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* TOPBAR */}
          <div style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)",
            borderBottom: "1px solid #F3F4F6",
            padding: "0 28px", height: 56,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
          }}>
            <nav style={{ fontSize: ".75rem", color: "#9CA3AF" }}>
              Workspace&nbsp;<span>/</span>&nbsp;<b style={{ color: "#111827", fontWeight: 500 }}>Dashboard</b>
            </nav>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #FED7AA", background: "#FFF7ED", borderRadius: 99, padding: "5px 13px", fontSize: ".75rem", color: "#6B7280" }}>
                <span style={{ width: 13, height: 13, color: "#F97316" }}>{Icon.star}</span>
                <b style={{ color: "#111827" }}>1,240</b>&nbsp;credits
              </span>
              <button style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", display: "grid", placeItems: "center", cursor: "pointer", position: "relative" }}>
                <span style={{ position: "absolute", top: 7, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#DC2626", border: "1.5px solid #fff" }} />
                <span style={{ width: 16, height: 16 }}>{Icon.bell}</span>
              </button>
              <Link href="/dashboards/settings/billing" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 8, fontSize: ".79rem", fontWeight: 600, textDecoration: "none", background: GRAD, color: "#fff", boxShadow: "0 4px 12px -3px rgba(249,115,22,.45)" }}>
                Upgrade
              </Link>
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: GRAD, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: ".72rem", cursor: "pointer", boxShadow: "0 2px 8px -2px rgba(249,115,22,.5)" }}>
                {userInitials}
              </span>
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: 24, padding: "28px 28px 0", maxWidth: 1360, margin: "0 auto", width: "100%" }}>

            {/* ── MAIN COLUMN ── */}
            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Hello */}
              <div>
                <h1 className="font-display" style={{ fontSize: "1.55rem", letterSpacing: "-.02em", color: "#111827" }}>
                  Welcome back, {firstName} 👋
                </h1>
                <p style={{ fontSize: ".78rem", color: "#9CA3AF", marginTop: 3 }}>
                  {today} · next post in <b style={{ color: "#111827" }}>2h 14m</b>
                </p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, background: "#FFF7ED", border: "1px solid #FED7AA", color: "#6B7280", fontSize: ".84rem", padding: "7px 13px", borderRadius: 99 }}>
                  <span style={{ width: 13, height: 13, color: "#F97316", flexShrink: 0 }}>{Icon.star}</span>
                  Your engagement grew 18% this week — your audience loves the tips series. Keep it going!
                </span>
              </div>

              {/* HERO */}
              <section style={{
                position: "relative", borderRadius: 20, overflow: "hidden",
                background: "linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 50%,#FEF3C7 100%)",
                border: "1px solid #FED7AA",
                boxShadow: "0 4px 16px -4px rgba(249,115,22,.12)",
                padding: "28px 30px",
              }}>
                {/* Decorative blobs */}
                <span style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(249,115,22,.08)", pointerEvents: "none" }} />
                <span style={{ position: "absolute", right: 60, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(234,88,12,.06)", pointerEvents: "none" }} />

                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: ".68rem", letterSpacing: ".13em", textTransform: "uppercase", color: "#16A34A", background: "#DCFCE7", padding: "5px 12px", borderRadius: 99, border: "1px solid #86EFAC" }}>
                  <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
                  Autopilot active
                </span>
                <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)", letterSpacing: "-.02em", margin: "12px 0 18px", color: "#111827" }}>
                  Your social media is running on autopilot 🚀
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11, marginBottom: 20 }}>
                  {[
                    { k: "Posts generated",     v: counts.posts,     suffix: "" },
                    { k: "Posts scheduled",     v: counts.scheduled, suffix: "" },
                    { k: "Platforms connected", v: counts.platforms, suffix: " / 10" },
                    { k: "Next scheduled post", v: "9:00", suffix: " PM today", raw: true },
                  ].map(({ k, v, suffix, raw }) => (
                    <div key={k} style={{ background: "rgba(255,255,255,.8)", backdropFilter: "blur(8px)", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 14px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                        <span style={{ width: 11, height: 11, color: "#16A34A" }}>{Icon.check}</span>
                        {k}
                      </span>
                      <div className="font-display" style={{ fontSize: "1.3rem", letterSpacing: "-.02em", marginTop: 4, color: "#111827" }}>
                        {v}<small style={{ fontSize: ".75rem", color: "#9CA3AF", fontWeight: 600 }}>{suffix}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, fontWeight: 600, fontSize: ".85rem", textDecoration: "none", background: GRAD, color: "#fff", boxShadow: "0 4px 14px -3px rgba(249,115,22,.45)" }}>
                    <span style={{ width: 14, height: 14 }}>{Icon.star}</span>Generate more content
                  </Link>
                  <Link href="/dashboards/calendar" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, fontWeight: 600, fontSize: ".85rem", textDecoration: "none", background: "#fff", border: "1px solid #E5E7EB", color: "#374151" }}>
                    Open calendar
                  </Link>
                </div>
              </section>

              {/* QUICK ACTIONS */}
              <section>
                <h2 className="font-display" style={{ fontSize: "1rem", marginBottom: 12, color: "#111827" }}>Quick actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11 }}>
                  {QUICK.map(({ label, icon, grad, href }) => (
                    <Link key={label} href={href} className="qa-card" style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "15px 13px", display: "flex", flexDirection: "column", gap: 10, textDecoration: "none", color: "#111827", transition: "all .2s", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: grad, display: "grid", placeItems: "center", color: "#fff" }}>
                        <span style={{ width: 16, height: 16 }}>{icon}</span>
                      </span>
                      <b style={{ fontSize: ".84rem", fontWeight: 600 }}>{label}</b>
                    </Link>
                  ))}
                </div>
              </section>

              {/* ACTIVITY + UPCOMING */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <section style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 18px 0" }}>
                    <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Today's activity</h2>
                    <a href="#" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>All →</a>
                  </div>
                  <div style={{ padding: "4px 18px 14px" }}>
                    {[
                      { ok: false, icon: Icon.star,  text: <>AI generated <b>14 images</b> for next week</>,   time: "6:00 AM" },
                      { ok: true,  icon: Icon.check, text: <><b>9 posts</b> generated across 4 industries</>,  time: "6:05 AM" },
                      { ok: true,  icon: Icon.check, text: <><b>5 posts</b> scheduled for optimal times</>,    time: "6:06 AM" },
                      { ok: true,  icon: Icon.check, text: <><b>2 posts</b> published — LinkedIn completed</>, time: "9:30 AM" },
                      { ok: false, icon: Icon.clock, text: <>Instagram Reel <b>queued</b> for 9:00 PM</>,      time: "just now" },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", position: "relative" }}>
                        {i < 4 && <span style={{ position: "absolute", left: 11, top: 34, bottom: -8, width: 2, background: "#F3F4F6" }} />}
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: item.ok ? "#DCFCE7" : "#FFF7ED", color: item.ok ? "#16A34A" : "#F97316", display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1 }}>
                          <span style={{ width: 11, height: 11 }}>{item.icon}</span>
                        </span>
                        <span style={{ fontSize: ".85rem" }}>
                          {item.text}
                          <span style={{ display: "block", fontSize: ".69rem", color: "#9CA3AF", marginTop: 1 }}>{item.time}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 18px 0" }}>
                    <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Upcoming posts</h2>
                    <Link href="/dashboards/calendar" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>Full calendar →</Link>
                  </div>
                  <div style={{ padding: "4px 18px 14px" }}>
                    {[
                      { day: "Today",     items: [{ t: "9:00 PM", n: "3 mobility moves for desk workers",    chips: ["IG", "TT"] }] },
                      { day: "Tomorrow",  items: [{ t: "9:30 AM", n: "Client win: Ritu's 12-week reset",    chips: ["IG", "f"] }, { t: "6:45 PM", n: "Myth: cardio kills gains", chips: ["▶", "TT"] }] },
                      { day: "This week", items: [{ t: "Tue",     n: "Hiring: part-time trainer",           chips: ["in", "𝕏"] }, { t: "Wed", n: "Monsoon smoothie recipe drop", chips: ["IG", "P"] }] },
                    ].map(({ day, items }) => (
                      <div key={day}>
                        <div style={{ fontSize: ".66rem", letterSpacing: ".11em", textTransform: "uppercase", color: "#9CA3AF", padding: "10px 0 5px" }}>{day}</div>
                        {items.map(({ t, n, chips }) => (
                          <div key={n} className="uitem" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 9, cursor: "pointer", transition: "background .15s" }}>
                            <span style={{ fontSize: ".72rem", color: "#6B7280", width: 48, flexShrink: 0 }}>{t}</span>
                            <span style={{ flex: 1, fontSize: ".84rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</span>
                            {chips.map(c => (
                              <span key={c} style={{ width: 19, height: 19, borderRadius: 6, background: c === "IG" ? "radial-gradient(circle at 30% 110%,#FDB750,#D53692 55%,#743BC8)" : c === "TT" ? "#0F0F14" : c === "f" ? "#1877F2" : c === "▶" ? "#FF0000" : c === "in" ? "#0A66C2" : c === "𝕏" ? "#111" : "#E60023", display: "grid", placeItems: "center", color: "#fff", fontSize: ".5rem", fontWeight: 700, flexShrink: 0 }}>{c}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* PLATFORMS */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
                  <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Connected platforms</h2>
                  <Link href="/dashboards/settings/accounts" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>Manage →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 11 }}>
                  {PLATS.map(p => (
                    <div key={p.nm} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 13px", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ width: 25, height: 25, borderRadius: 8, background: p.cls, display: "grid", placeItems: "center", color: "#fff", fontSize: ".55rem", fontWeight: 700 }}>{p.ch}</span>
                        <span style={{ fontSize: ".6rem", padding: "2px 7px", borderRadius: 99, background: p.on ? "#DCFCE7" : "#FEF3C7", color: p.on ? "#16A34A" : "#D97706" }}>{p.on ? "Connected" : "Reconnect"}</span>
                      </div>
                      <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#111827" }}>{p.nm}</div>
                      <div style={{ fontSize: ".65rem", color: "#9CA3AF", marginTop: 3, lineHeight: 1.6 }}>{p.posts} posts this month<br />Next: {p.next}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* PERFORMANCE SNAPSHOT */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
                  <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Performance snapshot</h2>
                  <Link href="/dashboards/analytics" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>Analytics →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 11 }}>
                  {[
                    { k: "Reach · 30d",  v: "428k",       trend: "▲ 18.2%", up: true },
                    { k: "Engagement",   v: "5.9%",        trend: "▲ 0.7 pts", up: true },
                    { k: "Followers",    v: "+2,340",      trend: "▲ 9.4%", up: true },
                    { k: "Top platform", v: "Instagram",   trend: "51% of reach", up: true },
                  ].map(({ k, v, trend, up }) => (
                    <div key={k} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px 15px", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                      <span style={{ fontSize: ".65rem", letterSpacing: ".11em", textTransform: "uppercase", color: "#9CA3AF" }}>{k}</span>
                      <div className="font-display" style={{ fontSize: "1.4rem", letterSpacing: "-.02em", margin: "5px 0 3px", color: "#111827" }}>{v}</div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: ".7rem", padding: "2px 8px", borderRadius: 99, background: up ? "#DCFCE7" : "#FEF3C7", color: up ? "#16A34A" : "#D97706" }}>{trend}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI SUGGESTIONS */}
              <section>
                <h2 className="font-display" style={{ fontSize: "1rem", marginBottom: 11, color: "#111827" }}>AI suggestions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {[
                    { icon: Icon.star,     title: "International Coffee Day is tomorrow.", sub: "Cafés in your library are trending — want a 3-post campaign?",  btn: "Generate campaign", primary: true },
                    { icon: Icon.trend,    title: "Your LinkedIn engagement increased 18%.", sub: "Carousel posts are driving it — double down next week?",        btn: "See what worked",   primary: false },
                    { icon: Icon.calendar, title: "Instagram needs 3 more posts this week", sub: "to stay on your 5-per-week cadence.",                           btn: "Fill the slots",    primary: false },
                    { icon: Icon.clock,    title: "Your audience engages best at 7 PM.",    sub: "Shift Thursday's post from 4 PM for ~22% more reach.",          btn: "Reschedule",        primary: false },
                  ].map(({ icon, title, sub, btn, primary }) => (
                    <div key={title} style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 15px", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                      <span style={{ width: 32, height: 32, borderRadius: 10, background: GRAD, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <span style={{ width: 15, height: 15 }}>{icon}</span>
                      </span>
                      <span style={{ flex: 1, fontSize: ".87rem" }}>
                        <b style={{ fontWeight: 600, color: "#111827" }}>{title}</b>
                        <span style={{ display: "block", color: "#6B7280", fontSize: ".8rem" }}>{sub}</span>
                      </span>
                      <button style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 8, fontWeight: 600, fontSize: ".79rem", cursor: "pointer", border: primary ? "none" : "1px solid #E5E7EB", background: primary ? GRAD : "#fff", color: primary ? "#fff" : "#374151", boxShadow: primary ? "0 4px 12px -3px rgba(249,115,22,.4)" : "none", whiteSpace: "nowrap" }}>
                        {btn}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* INDUSTRY INSPIRATION */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}>
                  <h2 className="font-display" style={{ fontSize: "1rem", color: "#111827" }}>Industry inspiration</h2>
                  <Link href="/" style={{ color: "#F97316", fontWeight: 600, fontSize: ".8rem", textDecoration: "none" }}>All 155+ industries →</Link>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Restaurants", "Healthcare", "Gyms", "Law Firms", "Real Estate", "Education", "Retail"].map(ind => (
                    <Link key={ind} href="/" className="ichip" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #E5E7EB", background: "#fff", borderRadius: 99, padding: "7px 14px", fontSize: ".83rem", fontWeight: 500, color: "#374151", textDecoration: "none", transition: "all .15s", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: GRAD, display: "inline-block" }} />
                      {ind}
                    </Link>
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
                        <b className="font-display" style={{ fontSize: "1.9rem", letterSpacing: "-.02em", color: "#111827", display: "block" }}>{SCORE}</b>
                        <span style={{ fontSize: ".64rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".1em" }}>/ 100</span>
                      </span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    {[
                      { label: "Content consistency", w: 96 },
                      { label: "Brand voice",          w: 94 },
                      { label: "Posting frequency",    w: 88 },
                      { label: "Profile completion",   w: 90 },
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
                      Add 2 more posts per week on TikTok to lift posting frequency above 90.
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 70, alignSelf: "start" }}>

              {/* Festival */}
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04)", padding: "14px 16px" }}>
                <h3 style={{ fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>Upcoming festival</h3>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: GRAD, display: "grid", placeItems: "center", fontSize: "1.15rem", flexShrink: 0 }}>☕</span>
                  <span>
                    <b style={{ fontSize: ".88rem", display: "block", color: "#111827" }}>Intl. Coffee Day</b>
                    <span style={{ fontSize: ".7rem", color: "#9CA3AF" }}>Tomorrow · Jul 6</span>
                  </span>
                </div>
                <button style={{ marginTop: 11, width: "100%", display: "flex", justifyContent: "center", padding: "7px 12px", borderRadius: 8, fontWeight: 600, fontSize: ".79rem", cursor: "pointer", border: "1px solid #FED7AA", background: "#FFF7ED", color: "#EA580C" }}>
                  Prepare posts
                </button>
              </div>

              {/* Hashtags */}
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04)", padding: "14px 16px" }}>
                <h3 style={{ fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>Trending hashtags</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["#coffeeday", "#mondaymotivation", "#smallbusiness", "#reels", "#fitnessjourney", "#monsoon"].map(tag => (
                    <button key={tag} style={{ fontSize: ".7rem", color: "#F97316", background: "#FFF7ED", padding: "3px 9px", borderRadius: 99, cursor: "pointer", border: "1px solid #FED7AA", fontWeight: 500 }}>{tag}</button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04)", padding: "14px 16px" }}>
                <h3 style={{ fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>Quick notes</h3>
                <textarea placeholder="Jot an idea for your next post…" style={{ width: "100%", border: "1px solid #E5E7EB", background: "#F9FAFB", borderRadius: 9, fontFamily: "inherit", fontSize: ".83rem", color: "#374151", padding: "9px 11px", resize: "vertical", minHeight: 64, outline: "none" }} />
              </div>

              {/* Support card — always visible, click opens floating chat */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setChatOpen(true)}
                onKeyDown={e => e.key === "Enter" && setChatOpen(true)}
                style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, boxShadow: "0 1px 2px rgba(0,0,0,.04)", padding: "14px 16px", cursor: "pointer", transition: "border-color .15s, box-shadow .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#FED7AA"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(249,115,22,.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 2px rgba(0,0,0,.04)"; }}
              >
                <h3 style={{ fontSize: ".65rem", letterSpacing: ".12em", textTransform: "uppercase", color: "#9CA3AF", marginBottom: 10 }}>Support</h3>
                <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, background: GRAD, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: "0 4px 10px -2px rgba(249,115,22,.4)" }}>
                    <span style={{ width: 16, height: 16 }}>{Icon.chat}</span>
                  </span>
                  <span>
                    <b style={{ fontSize: ".85rem", display: "block", color: "#111827" }}>Chat with AI</b>
                    <span style={{ fontSize: ".75rem", color: "#9CA3AF" }}>Answers in seconds</span>
                  </span>
                </div>
              </div>
            </aside>
          </div>

          {/* FOOTER */}
          <footer style={{ borderTop: "1px solid #F3F4F6", marginTop: 32, padding: "20px 28px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <b style={{ fontSize: ".9rem", color: "#111827" }}>Need help?</b>
            <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {["Chat with AI", "Video tutorials", "Documentation", "Support"].map(l => (
                <a key={l} href="#" style={{ color: "#6B7280", textDecoration: "none", fontSize: ".84rem", fontWeight: 500 }}>{l}</a>
              ))}
            </nav>
          </footer>
        </div>
      </div>

      {/* ── FLOATING CHAT POPUP (fixed bottom-right, only when open) ── */}
      {chatOpen && (
        <div style={{ position: "fixed", bottom: 24, right: 28, zIndex: 999, width: 340, display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.15), 0 8px 20px rgba(249,115,22,.1)", border: "1px solid #FED7AA", animation: "chatSlideUp .22s ease-out" }}>
          <style>{`@keyframes chatSlideUp{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

          {/* Header */}
          <div style={{ background: GRAD, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <span style={{ width: 15, height: 15, color: "#fff" }}>{Icon.chat}</span>
            </span>
            <span style={{ flex: 1 }}>
              <b style={{ fontSize: ".85rem", color: "#fff", display: "block", lineHeight: 1.2 }}>Shoutly AI</b>
              <span style={{ fontSize: ".69rem", color: "rgba(255,255,255,.8)" }}>Online · replies instantly</span>
            </span>
            <button
              onClick={() => setChatOpen(false)}
              style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1, display: "grid", placeItems: "center" }}
              title="Close"
            >×</button>
          </div>

          {/* Messages */}
          <div className="chat-scroll" style={{ height: 320, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9, background: "#fff" }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: m.type === "user" ? "13px 13px 3px 13px" : "13px 13px 13px 3px", background: m.type === "user" ? GRAD : "#F3F4F6", color: m.type === "user" ? "#fff" : "#111827", fontSize: ".8rem", lineHeight: 1.55 }}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex" }}>
                <div style={{ padding: "9px 13px", borderRadius: "13px 13px 13px 3px", background: "#F3F4F6", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", display: "inline-block", animation: `typingDot 1.2s ease-in-out ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "9px 11px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, alignItems: "center", background: "#fff" }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Type a message…"
              disabled={chatLoading}
              autoFocus
              style={{ flex: 1, border: "1px solid #E5E7EB", borderRadius: 9, padding: "7px 11px", fontSize: ".8rem", fontFamily: "inherit", outline: "none", background: "#F9FAFB", color: "#111827", minWidth: 0 }}
            />
            <button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              style={{ width: 34, height: 34, borderRadius: 9, background: GRAD, border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, opacity: chatLoading || !chatInput.trim() ? 0.45 : 1, transition: "opacity .15s" }}
              title="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7Z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
