"use client";

import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import { useUserProfile } from "@/hooks/useUserProfile";

// ── Types ──────────────────────────────────────────────────────────────────
interface Post {
  img: string;
  name: string;
  plat: string;
  platC: string;
  date: string;
  time: string;
  reach: string;
  eng: string;
  status: "scheduled" | "draft" | "published";
}

interface Idea {
  icon: string;
  bg: string;
  title: string;
  sub: string;
  score: number;
  sc: string;
  sb: string;
}

interface Tag {
  name: string;
  pct: number;
}

interface WFStep {
  c: string;
  tc: string;
  dot: string;
  title: string;
  sub: string;
}

interface TeamMember {
  av: string;
  bg: string;
  name: string;
  action: string;
  time: string;
  status: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
const posts: Post[] = [
  { img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=80&q=60", name: "3 viral growth hacks that tripled our reach", plat: "Instagram", platC: "#E1306C", date: "Today", time: "7:30 PM", reach: "82K", eng: "11.3%", status: "scheduled" },
  { img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&q=60", name: "New menu drop — truffle risotto is here", plat: "Facebook", platC: "#1877F2", date: "Mar 9", time: "12:00 PM", reach: "28K", eng: "6.8%", status: "scheduled" },
  { img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=60", name: "30-day transformation: Meet Alex", plat: "LinkedIn", platC: "#0A66C2", date: "Mar 10", time: "9:00 AM", reach: "45K", eng: "8.4%", status: "draft" },
  { img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=60", name: "Just listed — 4-bed Victorian in prime location", plat: "Instagram", platC: "#E1306C", date: "Mar 11", time: "8:00 AM", reach: "19K", eng: "5.7%", status: "scheduled" },
  { img: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=80&q=60", name: "✨ Happy Diwali from our entire team", plat: "Multi-platform", platC: "#F59E0B", date: "Mar 12", time: "8:00 AM", reach: "67K", eng: "9.2%", status: "published" },
];

const ideas: Idea[] = [
  { icon: "🔥", bg: "#FEF2F2", title: "Behind-the-scenes reel", sub: "High virality potential · Est. 12% eng", score: 94, sc: "#EF4444", sb: "#FEF2F2" },
  { icon: "💡", bg: "#FFFBEB", title: "Industry myth-busting thread", sub: "Educational · Best for LinkedIn & Twitter", score: 88, sc: "#F59E0B", sb: "#FFFBEB" },
  { icon: "📊", bg: "#EFF6FF", title: "Market update carousel", sub: "High saves · Peak: Wednesday 9 AM", score: 82, sc: "#3B82F6", sb: "#EFF6FF" },
  { icon: "✨", bg: "#ECFDF5", title: "Customer transformation story", sub: "Trust builder · Works all platforms", score: 79, sc: "#10B981", sb: "#ECFDF5" },
  { icon: "🎯", bg: "#EEEEFF", title: "Poll: What content do you want?", sub: "Quick engagement boost · Stories", score: 71, sc: "#5B5BD6", sb: "#EEEEFF" },
];

const tags: Tag[] = [
  { name: "#GrowthHacks", pct: 92 },
  { name: "#ContentStrategy", pct: 78 },
  { name: "#AIMarketing", pct: 85 },
  { name: "#SocialMedia2026", pct: 70 },
  { name: "#DigitalMarketing", pct: 65 },
];

const wfSteps: WFStep[] = [
  { c: "#ECFDF5", tc: "#10B981", dot: "✓", title: "Content Brief Created", sub: "AI generated 5 post ideas" },
  { c: "#EEEEFF", tc: "#5B5BD6", dot: "2", title: "Caption Writing", sub: "In progress · 3 of 5 done" },
  { c: "#FFFBEB", tc: "#F59E0B", dot: "3", title: "Design & Visuals", sub: "Pending approval" },
  { c: "#F0F1F8", tc: "#9496B5", dot: "4", title: "Schedule & Publish", sub: "Not started" },
];

const team: TeamMember[] = [
  { av: "AM", bg: "#5B5BD6", name: "Alex Morgan", action: "Scheduled 3 posts", time: "2m ago", status: "#10B981" },
  { av: "SR", bg: "#E1306C", name: "Sam Rivera", action: "Edited brand settings", time: "18m ago", status: "#10B981" },
  { av: "KL", bg: "#F59E0B", name: "Kim Lee", action: "Added new hashtag set", time: "1h ago", status: "#F59E0B" },
  { av: "JP", bg: "#06B6D4", name: "Jordan Park", action: "Reviewed analytics", time: "3h ago", status: "#9496B5" },
];

const captions: Record<string, string[]> = {
  ig: ["New drop just hit different 🔥 Our latest collection is giving everything — swipe to see the full range. Link in bio to shop before it's gone. ✨", "Stop scrolling — this one's for you 👀 3 content hacks that literally doubled our engagement in 30 days. Save this. You'll need it."],
  li: ["Excited to share that after 18 months of building in public, we've crossed 100K users organically. Zero paid acquisition. Here's the full breakdown of what worked and what didn't 🧵", "The most underrated skill in 2026? Clear written communication. I've reviewed 200+ job applications this year. The gap is enormous. Here's how to fix it in 30 days."],
  tw: ["hot take: the brands winning on social in 2026 aren't posting more. they're posting with more intention. less content, more craft.", "thread: everything we got wrong in year 1 (and what saved us in year 2) 🧵👇"],
  fb: ["We've been getting this question every week: 'How do you consistently create content without burning out?' We sat down and mapped out our entire content system. Here's the full breakdown 👇", "BIG NEWS: After months of work, our new product is finally here. We're so proud of what the team built. Here's what it does and why we think it'll change the game for you ⬇️"],
  tk: ["POV: you finally figured out the algorithm 👀 #contentcreator #socialmediatips #fyp", "Come with me to plan a month of content in 2 hours ✨ this system changed everything for me #contentplanning #smallbusiness"],
};

const hashtagMap: Record<string, string[]> = {
  ig: ["#ContentCreator", "#SocialMediaTips", "#GrowthHacks", "#MarketingStrategy", "#InstagramGrowth", "#DigitalMarketing"],
  li: ["#LinkedIn", "#CareerGrowth", "#Leadership", "#Marketing", "#BuildInPublic", "#Startup"],
  tw: ["#Marketing", "#GrowthHacking", "#ContentStrategy", "#SocialMedia", "#DigitalMarketing"],
  fb: ["#SmallBusiness", "#Marketing", "#ContentMarketing", "#FacebookMarketing", "#BusinessTips"],
  tk: ["#ContentCreator", "#TikTokMarketing", "#FYP", "#SocialMediaTips", "#BusinessTok"],
};

const platColors: Record<string, string> = {
  ig: "#E1306C", li: "#0A66C2", tw: "#1DA1F2", fb: "#1877F2", tk: "#111",
};

const platLabels: Record<string, string> = {
  ig: "Instagram", li: "LinkedIn", tw: "Twitter", fb: "Facebook", tk: "TikTok",
};

// ── Toast Hook ─────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: "" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, msg });
    timerRef.current = setTimeout(() => setToast({ visible: false, msg: "" }), 2800);
  };
  return { toast, show };
}

// ── Mini Calendar ──────────────────────────────────────────────────────────
function MiniCalendar() {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const hasPosts = [3, 5, 8, 10, 12, 14, 17, 19, 21, 24, 26, 28];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginTop: 8 }}>
      {days.map((d) => (
        <div key={d} style={{ fontSize: 10, fontWeight: 700, textAlign: "center", color: "#C8CADF", padding: "4px 0", textTransform: "uppercase" }}>{d}</div>
      ))}
      {[26, 27, 28, 29, 30].map((n) => (
        <div key={`prev-${n}`} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, borderRadius: 6, color: "#C8CADF" }}>{n}</div>
      ))}
      {Array.from({ length: 31 }, (_, i) => i + 1).map((i) => {
        const isToday = i === 8;
        const hasPost = hasPosts.includes(i);
        return (
          <div
            key={i}
            style={{
              aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11.5, borderRadius: isToday ? 8 : 6, cursor: "pointer", position: "relative",
              background: isToday ? "#5B5BD6" : undefined,
              color: isToday ? "#fff" : "#9496B5",
              fontWeight: isToday ? 700 : 400,
            }}
          >
            {i}
            {hasPost && (
              <span style={{
                position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                width: 4, height: 4, borderRadius: "50%",
                background: isToday ? "#fff" : "#10B981",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [sidebarSlim, setSidebarSlim] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [activePlat, setActivePlat] = useState("ig");
  const [generating, setGenerating] = useState(false);
  const [caption, setCaption] = useState("");
  const [tags2, setTags2] = useState<string[]>([]);
  const { toast, show: showToast } = useToast();
  const { user, initials } = useUserProfile();

  const generateCaption = () => {
    setCaption("");
    setTags2([]);
    setGenerating(true);
    setTimeout(() => {
      const caps = captions[activePlat] || captions.ig;
      setCaption(caps[Math.floor(Math.random() * caps.length)]);
      setTags2(hashtagMap[activePlat] || hashtagMap.ig);
      setGenerating(false);
    }, 1400);
  };

  const copyCaption = () => {
    navigator.clipboard?.writeText(caption).catch(() => {});
    showToast("📋 Caption copied to clipboard!");
  };

  const tabs = ["Overview", "Posts", "Analytics", "Automation", "Team"];

  return (
    <>
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; background: #F5F6FA; color: #0D0E1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E4E5EF; border-radius: 4px; }
        @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes cardIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
        .skel-line {
          height: 12px; border-radius: 6px; margin-bottom: 8px;
          background: linear-gradient(90deg,#F0F1F8 0%,#ECEDF5 50%,#F0F1F8 100%);
          background-size: 600px; animation: shimmer 1.5s infinite;
        }
        .ai-banner-anim {
          background: linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4338ca 70%,#6d28d9 100%);
          background-size: 200% 200%; animation: gradMove 6s ease infinite;
        }
        .row-actions { opacity: 0; transition: opacity .13s; display: flex; gap: 5px; }
        tr:hover .row-actions { opacity: 1; }
        tr:hover td { background: #F0F1F8; }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
        .tb-icon-hover:hover { background: #F0F1F8; color: #0D0E1A; }
        .row-btn-hover:hover { background: #EEEEFF; border-color: #5B5BD6; color: #5B5BD6; }
      `}</style>

      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      {/* Shell: Sidebar + Main side by side */}
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

        {/* ── Sidebar (separate component) ── */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim((s) => !s)} />

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, background: "#F5F6FA" }}>

          {/* Topbar */}
          <AdminHeader
            pageTitle="Dashboard"
            onToggle={() => setSidebarSlim((s) => !s)}
            searchPlaceholder="Search posts, analytics…"
            userName={user?.name}
            userInitials={initials}
            actionButton={
              <button
                onClick={() => showToast("✦ Opening Post Composer…")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7, background: "#5B5BD6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(91,91,214,.28)" }}
              >
                <i className="fa-solid fa-plus" style={{ fontSize: 11 }} /> New Post
              </button>
            }
          />

          {/* Tab Bar */}
          <div style={{ display: "flex", alignItems: "center", padding: "0 22px", background: "#fff", borderBottom: "1px solid #E4E5EF", flexShrink: 0 }}>
            {tabs.map((t) => (
              <div
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "14px 18px", fontSize: 13,
                  fontWeight: activeTab === t ? 700 : 600,
                  color: activeTab === t ? "#5B5BD6" : "#9496B5",
                  cursor: "pointer", position: "relative", whiteSpace: "nowrap",
                }}
              >
                {t}
                {t === "Posts" && (
                  <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 10, fontSize: 10.5, fontWeight: 700, background: activeTab === t ? "#EEEEFF" : "#F0F1F8", color: activeTab === t ? "#5B5BD6" : "#9496B5" }}>68</span>
                )}
                {activeTab === t && (
                  <span style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 2, background: "#5B5BD6", borderRadius: "2px 2px 0 0" }} />
                )}
              </div>
            ))}
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>

            {/* Welcome greeting */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.3px" }}>
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
              </div>
              {user?.brandName && (
                <div style={{ fontSize: 13, color: "#9496B5", marginTop: 3 }}>
                  Managing <strong style={{ color: "#5B5BD6" }}>{user.brandName}</strong>
                  {user.connectedSocials && user.connectedSocials.length > 0 && (
                    <> · {user.connectedSocials.length} platform{user.connectedSocials.length > 1 ? "s" : ""} connected</>
                  )}
                </div>
              )}
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
              {[
                { icon: "fa-solid fa-users", iconBg: "#EEEEFF", iconC: "#5B5BD6", val: "147.2K", lbl: "Total Followers", delta: "+12.4%", up: true },
                { icon: "fa-solid fa-chart-line", iconBg: "#ECFDF5", iconC: "#10B981", val: "8.7%", lbl: "Avg Engagement", delta: "+2.1%", up: true },
                { icon: "fa-solid fa-calendar-check", iconBg: "#FFFBEB", iconC: "#F59E0B", val: "68", lbl: "Posts This Month", delta: "+8", up: true },
                { icon: "fa-solid fa-eye", iconBg: "#FDF2F8", iconC: "#EC4899", val: "2.1M", lbl: "Total Reach", delta: "+18.3%", up: true },
              ].map((k, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(13,14,26,.07)", animation: `cardIn .3s ease ${i * 0.05 + 0.05}s both` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: k.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={k.icon} style={{ color: k.iconC }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 7px", borderRadius: 20, background: k.up ? "#ECFDF5" : "#FEF2F2", color: k.up ? "#10B981" : "#EF4444", fontSize: 11.5, fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>
                      <i className={`fa-solid fa-arrow-${k.up ? "up" : "down"}`} style={{ fontSize: 9 }} />{k.delta}
                    </div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.5px", lineHeight: 1 }}>{k.val}</div>
                  <div style={{ fontSize: 12.5, color: "#9496B5", marginTop: 4, fontWeight: 500 }}>{k.lbl}</div>
                </div>
              ))}
            </div>

            {/* AI Banner */}
            <div className="ai-banner-anim" style={{ borderRadius: 14, padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: "0 4px 20px rgba(91,91,214,.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✦</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif", marginBottom: 3 }}>Shoutly AI Insight — Your best time to post is TODAY at 7:30 PM</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.65)" }}>Based on your audience activity patterns across Instagram & LinkedIn · Predicted +34% higher engagement vs your avg</div>
                </div>
              </div>
              <button onClick={() => showToast("✦ Opening full AI insights…")} style={{ padding: "9px 18px", borderRadius: 7, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Sora,sans-serif", flexShrink: 0 }}>View Details →</button>
            </div>

            {/* Charts + AI Generator */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              {/* Engagement Chart Placeholder */}
              <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.2px" }}>Engagement Overview</div>
                    <div style={{ fontSize: 12, color: "#9496B5", marginTop: 2 }}>Cross-platform performance · Last 30 days</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["7D", "30D", "90D"].map((ct, i) => (
                      <div key={ct} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, cursor: "pointer", background: i === 0 ? "#EEEEFF" : undefined, color: i === 0 ? "#5B5BD6" : "#9496B5" }}>{ct}</div>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: -4, right: 0, padding: "2px 8px", borderRadius: 20, background: "#ECFDF5", border: "1px solid rgba(16,185,129,.2)", color: "#10B981", fontSize: 11, fontWeight: 700 }}>↑ +208% vs last month</div>
                  <div style={{ height: 160, background: "#F0F1F8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#9496B5", fontSize: 12 }}>📊 Chart renders here (Chart.js)</div>
                </div>
              </div>

              {/* AI Post Generator */}
              <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", marginBottom: 2 }}>AI Post Generator</div>
                <div style={{ fontSize: 12, color: "#9496B5", marginBottom: 14 }}>Generate captions with a single click ✦</div>
                <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
                  {Object.entries(platLabels).map(([key, label]) => {
                    const active = activePlat === key;
                    return (
                      <div
                        key={key}
                        onClick={() => { setActivePlat(key); setCaption(""); setTags2([]); }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${active ? platColors[key] : "#E4E5EF"}`, fontSize: 12, fontWeight: 700, cursor: "pointer", background: active ? platColors[key] : "#fff", color: active ? "#fff" : "#4B4D6B" }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "rgba(255,255,255,.4)" : platColors[key] }} />
                        {label}
                      </div>
                    );
                  })}
                </div>
                <textarea
                  placeholder="Describe your post topic… e.g. 'new product launch, summer vibe, call to action'"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 7, border: "1px solid #E4E5EF", background: "#F0F1F8", color: "#0D0E1A", fontSize: 13.5, outline: "none", resize: "none", height: 70, fontFamily: "inherit", lineHeight: 1.6 }}
                />
                {generating && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="skel-line" style={{ width: "100%" }} />
                    <div className="skel-line" style={{ width: "85%" }} />
                    <div className="skel-line" style={{ width: "70%" }} />
                  </div>
                )}
                {caption && !generating && (
                  <div style={{ background: "linear-gradient(135deg,#EEEEFF,rgba(236,233,255,.5))", border: "1px solid rgba(91,91,214,.2)", borderRadius: 7, padding: "12px 14px", fontSize: 13.5, color: "#0D0E1A", lineHeight: 1.7, marginBottom: 12 }}>
                    {caption}
                  </div>
                )}
                {tags2.length > 0 && !generating && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {tags2.map((t) => (
                      <span key={t} style={{ padding: "3px 9px", borderRadius: 6, background: "#EEEEFF", border: "1px solid #E0E0FA", color: "#5B5BD6", fontSize: 11.5, fontWeight: 600, fontFamily: "JetBrains Mono,monospace", cursor: "pointer" }}>{t}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={generateCaption} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 13px", borderRadius: 7, background: "#5B5BD6", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: "none" }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 11 }} /> Generate
                  </button>
                  {caption && !generating && (
                    <>
                      <button onClick={generateCaption} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 7, border: "1px solid #E4E5EF", background: "#fff", color: "#4B4D6B", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                        <i className="fa-solid fa-rotate-right" style={{ fontSize: 11 }} /> Regen
                      </button>
                      <button onClick={copyCaption} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 7, border: "1px solid #E4E5EF", background: "#fff", color: "#4B4D6B", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                        <i className="fa-regular fa-copy" style={{ fontSize: 11 }} /> Copy
                      </button>
                      <button onClick={() => showToast("📅 Added to calendar!")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 7, border: "1px solid #E4E5EF", background: "#fff", color: "#4B4D6B", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                        <i className="fa-solid fa-calendar-plus" style={{ fontSize: 11 }} /> Schedule
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scheduled Posts Table */}
            <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, boxShadow: "0 1px 4px rgba(13,14,26,.07)", marginBottom: 18 }}>
              <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Scheduled Posts</div>
                  <div style={{ fontSize: 12, color: "#9496B5" }}>Upcoming content across all platforms</div>
                </div>
                <button onClick={() => showToast("Opening full post manager…")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 7, border: "1px solid #E4E5EF", background: "#fff", color: "#4B4D6B", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                  View all <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                </button>
              </div>
              <div style={{ padding: "10px 0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Post", "Scheduled", "Est. Reach", "Status", "Actions"].map((h, i) => (
                        <th key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#9496B5", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #E4E5EF", paddingLeft: i === 0 ? 18 : 12, paddingRight: i === 4 ? 18 : 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((p, i) => {
                      const statusStyles: Record<string, { bg: string; color: string; icon: string }> = {
                        scheduled: { bg: "#EFF6FF", color: "#3B82F6", icon: "🕐" },
                        draft: { bg: "#FFFBEB", color: "#F59E0B", icon: "✏️" },
                        published: { bg: "#ECFDF5", color: "#10B981", icon: "✅" },
                      };
                      const ss = statusStyles[p.status];
                      return (
                        <tr key={i}>
                          <td style={{ padding: "10px 12px 10px 18px", borderBottom: "1px solid #ECEDF5", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <img src={p.img} alt="" style={{ width: 44, height: 44, borderRadius: 7, objectFit: "cover", display: "block" }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0E1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{p.name}</div>
                                <div style={{ fontSize: 11.5, color: "#9496B5", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.platC }} />{p.plat}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", borderBottom: "1px solid #ECEDF5", verticalAlign: "middle" }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0D0E1A", fontFamily: "JetBrains Mono,monospace" }}>{p.time}</div>
                            <div style={{ fontSize: 11.5, color: "#9496B5" }}>{p.date}</div>
                          </td>
                          <td style={{ padding: "10px 12px", borderBottom: "1px solid #ECEDF5", verticalAlign: "middle" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "JetBrains Mono,monospace" }}>{p.reach}</div>
                            <div style={{ fontSize: 11, color: "#9496B5", fontFamily: "JetBrains Mono,monospace" }}>{p.eng} eng</div>
                          </td>
                          <td style={{ padding: "10px 12px", borderBottom: "1px solid #ECEDF5", verticalAlign: "middle" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: ss.bg, color: ss.color }}>
                              {ss.icon} {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: "10px 18px 10px 12px", borderBottom: "1px solid #ECEDF5", verticalAlign: "middle" }}>
                            <div className="row-actions">
                              <div className="row-btn-hover" onClick={() => showToast("Opening editor…")} style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#9496B5", fontSize: 12, cursor: "pointer", border: "1px solid #E4E5EF" }}>
                                <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
                              </div>
                              <div className="row-btn-hover" onClick={() => showToast("More options…")} style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#9496B5", fontSize: 12, cursor: "pointer", border: "1px solid #E4E5EF" }}>
                                <i className="fa-solid fa-ellipsis" style={{ fontSize: 11 }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1fr", gap: 14, marginBottom: 18 }}>

              {/* Mini Calendar */}
              <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", marginBottom: 2 }}>Content Calendar</div>
                <div style={{ fontSize: 12, color: "#9496B5", marginBottom: 8 }}>March 2026</div>
                <MiniCalendar />
              </div>

              {/* AI Ideas */}
              <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>AI Content Ideas</div>
                  <span style={{ fontSize: 11, color: "#5B5BD6", fontWeight: 700, cursor: "pointer" }}>Refresh ↺</span>
                </div>
                {ideas.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < ideas.length - 1 ? "1px solid #ECEDF5" : undefined }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: d.sb, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{d.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0E1A", marginBottom: 2 }}>{d.title}</div>
                      <div style={{ fontSize: 11.5, color: "#9496B5" }}>{d.sub}</div>
                    </div>
                    <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: d.sb, color: d.sc, flexShrink: 0, fontFamily: "JetBrains Mono,monospace" }}>{d.score}</div>
                  </div>
                ))}
              </div>

              {/* Trending + Workflow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", marginBottom: 14 }}>Trending Hashtags</div>
                  {tags.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < tags.length - 1 ? "1px solid #ECEDF5" : undefined }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#5B5BD6", fontFamily: "JetBrains Mono,monospace" }}>{t.name}</div>
                      <div style={{ flex: 1, margin: "0 12px", height: 4, background: "#E4E5EF", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#5B5BD6,#7C3AED)", width: `${t.pct}%` }} />
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#10B981", fontFamily: "JetBrains Mono,monospace" }}>+{t.pct}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", marginBottom: 8 }}>Active Workflow</div>
                  {wfSteps.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", position: "relative" }}>
                      {i < wfSteps.length - 1 && <span style={{ position: "absolute", left: 13, top: 32, bottom: -8, width: 1.5, background: "#ECEDF5" }} />}
                      <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: s.c, color: s.tc, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.dot}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0E1A" }}>{s.title}</div>
                        <div style={{ fontSize: 11.5, color: "#9496B5", marginTop: 1 }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team + Top Post */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", marginBottom: 8 }}>Team Activity</div>
                  {team.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < team.length - 1 ? "1px solid #ECEDF5" : undefined }}>
                      <div style={{ position: "relative" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>{t.av}</div>
                        <div style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: t.status, border: "1.5px solid #fff" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0E1A" }}>{t.name}</div>
                        <div style={{ fontSize: 11.5, color: "#9496B5" }}>{t.action}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "#C8CADF", whiteSpace: "nowrap", fontFamily: "JetBrains Mono,monospace" }}>{t.time}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(13,14,26,.07)" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", marginBottom: 12 }}>Top Performing Post</div>
                  <div style={{ borderRadius: 7, overflow: "hidden", background: "linear-gradient(135deg,#1e1b4b,#4338ca)", padding: 14 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.85)", fontSize: 11, fontWeight: 700, marginBottom: 8, fontFamily: "Sora,sans-serif" }}>🔥 #1 This Month</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.9)", lineHeight: 1.5 }}>3 viral social media growth hacks that tripled our reach in 30 days…</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                      {[["82K", "Reach"], ["11.3%", "Engagement"], ["3.1K", "Saves"], ["940", "Shares"]].map(([v, l]) => (
                        <div key={l} style={{ background: "rgba(255,255,255,.1)", borderRadius: 8, padding: 8, border: "1px solid rgba(255,255,255,.1)" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif" }}>{v}</div>
                          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.55)" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Platform Icons */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "8px 0" }}>
              {[
                { cls: "fa-brands fa-instagram", color: "#E1306C" },
                { cls: "fa-brands fa-facebook", color: "#1877F2" },
                { cls: "fa-brands fa-linkedin", color: "#0A66C2" },
                { cls: "fa-brands fa-x-twitter", color: "#000" },
                { cls: "fa-brands fa-threads", color: "#000" },
                { cls: "fa-brands fa-tiktok", color: "#111" },
                { cls: "fa-brands fa-youtube", color: "#FF0000" },
              ].map((ic, i) => (
                <i key={i} className={ic.cls} style={{ color: ic.color, fontSize: 16 }} />
              ))}
            </div>

          </div>{/* /content */}
        </div>{/* /main */}
      </div>{/* /shell */}

      {/* Toast */}
      <div style={{
        position: "fixed", bottom: 22, right: 22, zIndex: 9999,
        display: "flex", alignItems: "center", gap: 9,
        padding: "11px 16px", borderRadius: 10,
        background: "#0D0E1A", color: "#fff", fontSize: 13, fontWeight: 600,
        boxShadow: "0 12px 32px rgba(13,14,26,.10)",
        fontFamily: "Sora,sans-serif",
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? "translateY(0)" : "translateY(8px)",
        transition: "all .3s cubic-bezier(.4,0,.2,1)",
        pointerEvents: "none",
      }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,.2)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✓</div>
        {toast.msg}
      </div>
    </>
  );
}