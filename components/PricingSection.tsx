"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Feature {
  text: string;
  ok: boolean;
}

interface Plan {
  id: string;
  name: string;
  badge: string | null;
  tagline: string;
  inr_monthly: number;
  inr_annual: number;
  free: boolean;
  cta: string;
  ctaStyle: "outline" | "fill" | "dark";
  color: string;
  border: string;
  platforms: string[];
  brands: string;
  features: Feature[];
  highlight?: boolean;
}

interface PlatformColor {
  bg: string;
  color: string;
}

// ── Pricing data — all in INR ─────────────────────────────────────────────────
const INR_TO_USD = 84;

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "STARTER",
    badge: null,
    tagline: "Try risk-free — no card needed",
    inr_monthly: 0,
    inr_annual:  0,
    free: true,
    cta: "Start Free",
    ctaStyle: "outline",
    color: "#6B7280",
    border: "#E5E7EB",
    platforms: ["Instagram", "Facebook"],
    brands: "1",
    features: [
      { text: "7 days of AI posts", ok: true },
      { text: "1 brand", ok: true },
      { text: "Photo posts only", ok: true },
      { text: "Watermark on posts", ok: false },
      { text: "No reels", ok: false },
      { text: "No scheduling", ok: false },
    ],
  },
  {
    id: "solo",
    name: "SOLO",
    badge: null,
    tagline: "One brand, one full year",
    inr_monthly: 3000,
    inr_annual:  2400,
    free: false,
    cta: "Start Solo",
    ctaStyle: "outline",
    color: "#0F766E",
    border: "#99F6E4",
    platforms: ["Instagram", "Facebook"],
    brands: "1",
    features: [
      { text: "365 AI posts / year", ok: true },
      { text: "1 brand only", ok: true },
      { text: "Photos + 5 reels/mo", ok: true },
      { text: "No watermark", ok: true },
      { text: "Festival calendar (India)", ok: true },
      { text: "Email support", ok: true },
      { text: "2 platforms only", ok: false },
    ],
  },
  {
    id: "creator",
    name: "CREATOR",
    badge: "MOST POPULAR",
    tagline: "Unlimited content, all platforms",
    inr_monthly: 6000,
    inr_annual:  4800,
    free: false,
    cta: "Start Creator",
    ctaStyle: "fill",
    color: "#2563EB",
    border: "#2563EB",
    highlight: true,
    platforms: ["Instagram", "Facebook", "X / Twitter", "LinkedIn", "TikTok", "Google My Business"],
    brands: "1",
    features: [
      { text: "Unlimited posts", ok: true },
      { text: "15 reels / month", ok: true },
      { text: "1 brand", ok: true },
      { text: "No watermark", ok: true },
      { text: "Festival + occasion AI", ok: true },
      { text: "6 platforms", ok: true },
      { text: "Priority support", ok: true },
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    badge: null,
    tagline: "Multiple brands, one dashboard",
    inr_monthly: 12000,
    inr_annual:  9600,
    free: false,
    cta: "Start Business",
    ctaStyle: "outline",
    color: "#7C3AED",
    border: "#DDD6FE",
    platforms: ["Instagram", "Facebook", "X / Twitter", "LinkedIn", "TikTok", "Google My Business", "YouTube", "Threads"],
    brands: "3",
    features: [
      { text: "Unlimited posts + reels", ok: true },
      { text: "3 brands", ok: true },
      { text: "All 8 platforms", ok: true },
      { text: "Analytics dashboard", ok: true },
      { text: "Premium branding", ok: true },
      { text: "Priority support", ok: true },
    ],
  },
  {
    id: "agency",
    name: "AGENCY",
    badge: "WHITE-LABEL",
    tagline: "Run client brands at scale",
    inr_monthly: 25000,
    inr_annual:  20000,
    free: false,
    cta: "Contact Sales",
    ctaStyle: "dark",
    color: "#B45309",
    border: "#FDE68A",
    platforms: ["Instagram", "Facebook", "X / Twitter", "LinkedIn", "TikTok", "Google My Business", "YouTube", "Threads"],
    brands: "10",
    features: [
      { text: "Unlimited posts + reels", ok: true },
      { text: "10 brands", ok: true },
      { text: "White-label option", ok: true },
      { text: "API access", ok: true },
      { text: "Custom AI training", ok: true },
      { text: "Dedicated manager + SLA", ok: true },
    ],
  },
];

const PLATFORM_COLORS: Record<string, PlatformColor> = {
  "Instagram":          { bg: "#FCE7F3", color: "#BE185D" },
  "Facebook":           { bg: "#DBEAFE", color: "#1D4ED8" },
  "X / Twitter":        { bg: "#E0F2FE", color: "#0369A1" },
  "LinkedIn":           { bg: "#EFF6FF", color: "#1E40AF" },
  "TikTok":             { bg: "#F0FDF4", color: "#166534" },
  "Google My Business": { bg: "#FEF9C3", color: "#854D0E" },
  "YouTube":            { bg: "#FEE2E2", color: "#B91C1C" },
  "Threads":            { bg: "#F5F3FF", color: "#6D28D9" },
};

const ALL_PLATFORMS = [
  "Instagram", "Facebook", "X / Twitter", "LinkedIn",
  "TikTok", "Google My Business", "YouTube", "Threads",
];

// ── Formatters ────────────────────────────────────────────────────────────────
const fINR = (n: number) => "₹" + n.toLocaleString("en-IN");
const fUSD = (inr: number) => "~$" + Math.round(inr / INR_TO_USD);

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const [inr, setInr] = useState(true);

  const planPrice = (plan: Plan) => {
    if (plan.free) return "Free";
    const val = annual ? plan.inr_annual : plan.inr_monthly;
    return inr ? fINR(val) : fUSD(val);
  };

  const planAlt = (plan: Plan) => {
    if (plan.free) return null;
    const val = annual ? plan.inr_annual : plan.inr_monthly;
    return inr ? `${fUSD(val)}/mo in USD` : `${fINR(val)}/mo in INR`;
  };

  const planSub = (plan: Plan) => {
    if (plan.free) return "Forever free";
    return annual ? "billed annually" : "billed monthly";
  };

  return (
    <div style={{ fontFamily: "'Sora','DM Sans',system-ui,sans-serif", background: "#F8F9FD", minHeight: "100vh", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .pc:hover { transform: translateY(-4px) !important; }
        .cta-btn:hover { opacity: 0.88; }
        @media(max-width:900px){ .pg { grid-template-columns: repeat(3,1fr) !important; } }
        @media(max-width:600px){ .pg { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:380px){ .pg { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1B2A4A 60%,#0F2A5A 100%)", padding: "56px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%,rgba(37,99,235,.18) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(124,58,237,.14) 0%,transparent 40%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,.22)", border: "1px solid rgba(37,99,235,.4)", color: "#93C5FD", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 18 }}>
            💰 Investment — Not an Expense
          </div>
          <h1 style={{ fontSize: "clamp(24px,4.5vw,44px)", fontWeight: 800, color: "#fff", lineHeight: 1.12, margin: "0 0 10px" }}>
            ONE PRICE. <span style={{ color: "#60A5FA" }}>365 DAYS.</span><br />ZERO EFFORT.
          </h1>
          <p style={{ fontSize: 14, color: "#94A3B8", maxWidth: 460, margin: "0 auto 30px", lineHeight: 1.6 }}>
            Replace your ₹3L/year agency. One prompt — a full year of branded content, scheduled and posted.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: annual ? "#94A3B8" : "#fff" }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 26, borderRadius: 13, background: "#2563EB", position: "relative", cursor: "pointer", border: "none", outline: "none", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: annual ? 25 : 3, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: annual ? "#fff" : "#94A3B8" }}>Annual</span>
            {annual && <span style={{ background: "linear-gradient(90deg,#059669,#10B981)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>SAVE 20%</span>}
          </div>

          {/* Currency toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
            {["inr", "usd"].map((c) => (
              <button key={c} onClick={() => setInr(c === "inr")} style={{ padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: (c === "inr") === inr ? "#2563EB" : "transparent", color: (c === "inr") === inr ? "#fff" : "#94A3B8", border: `1.5px solid ${(c === "inr") === inr ? "#2563EB" : "rgba(255,255,255,.2)"}`, transition: "all .15s" }}>
                {c === "inr" ? "₹ INR" : "$ USD"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 16px" }}>

        {/* INR Quick Bar */}
        {inr && (
          <div style={{ background: "linear-gradient(135deg,#EFF6FF,#F5F3FF)", border: "1.5px solid #BFDBFE", borderRadius: 14, padding: "18px 20px", margin: "18px 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            {PLANS.filter(p => !p.free).map((p, i) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 28, background: "#BFDBFE", margin: "0 4px" }} />}
                <div style={{ textAlign: "center", padding: "0 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: p.color, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{fINR(annual ? p.inr_annual : p.inr_monthly)}</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>{annual ? "/mo annual" : "/month"}</div>
                </div>
              </div>
            ))}
            <div style={{ width: "100%", textAlign: "center", fontSize: 10, color: "#6B7280", marginTop: 8 }}>
              💡 Pay via UPI · Net Banking · Indian Debit/Credit · GST invoice included · Cancel anytime
            </div>
          </div>
        )}

        {annual && (
          <div style={{ background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 10, padding: "10px 18px", fontSize: 12, color: "#065F46", textAlign: "center", margin: "14px 0", fontWeight: 500 }}>
            🎉 Annual billing saves 20% — equivalent to <strong>2.4 months free</strong> every year
          </div>
        )}

        {/* PLAN CARDS */}
        <div className="pg" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 11, marginTop: inr ? 16 : -24, paddingBottom: 10 }}>
          {PLANS.map((plan) => (
            <div key={plan.id} className="pc" style={{ background: "#fff", border: `${plan.highlight ? 2 : 1.5}px solid ${plan.border}`, borderRadius: 16, padding: "22px 14px 18px", position: "relative", display: "flex", flexDirection: "column", transition: "transform .2s, box-shadow .2s", boxShadow: plan.highlight ? "0 8px 36px rgba(37,99,235,.18)" : "0 2px 6px rgba(0,0,0,.04)" }}>

              {plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 800, letterSpacing: ".1em", padding: "3px 11px", borderRadius: 20, color: "#fff", background: plan.color, whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: plan.color, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 12, lineHeight: 1.4 }}>{plan.tagline}</div>

              {/* Price */}
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                {planPrice(plan)}
                {!plan.free && <sup style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", verticalAlign: "super" }}>/mo</sup>}
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", margin: "3px 0 2px" }}>{planSub(plan)}</div>
              {planAlt(plan) && <div style={{ fontSize: 10, fontWeight: 600, color: plan.color, marginBottom: 12 }}>{planAlt(plan)}</div>}
              {!planAlt(plan) && <div style={{ height: 20, marginBottom: 12 }} />}

              <hr style={{ border: "none", borderTop: "1px solid #F3F4F6", margin: "0 0 10px" }} />

              {/* Platforms */}
              <div style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Platforms</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
                {plan.platforms.map((pl) => {
                  const s = PLATFORM_COLORS[pl] || { bg: "#F1F5F9", color: "#475569" };
                  return <span key={pl} style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 8, background: s.bg, color: s.color }}>{pl}</span>;
                })}
              </div>
              <div style={{ fontSize: 9, color: "#9CA3AF", marginBottom: 6 }}>Brands: <strong style={{ color: "#374151" }}>{plan.brands}</strong></div>

              <hr style={{ border: "none", borderTop: "1px solid #F3F4F6", margin: "0 0 10px" }} />

              {/* Features */}
              <div style={{ flex: 1, marginBottom: 14 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 10, color: f.ok ? "#374151" : "#9CA3AF", marginBottom: 6, lineHeight: 1.4 }}>
                    <div style={{ width: 13, height: 13, borderRadius: "50%", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, background: f.ok ? "#D1FAE5" : "#F3F4F6", color: f.ok ? "#059669" : "#9CA3AF" }}>
                      {f.ok ? "✓" : "✗"}
                    </div>
                    {f.text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="cta-btn" style={{
                display: "block", width: "100%", padding: "10px", borderRadius: 9,
                fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: "inherit",
                ...(plan.ctaStyle === "fill"
                  ? { background: plan.color, color: "#fff", border: "none" }
                  : plan.ctaStyle === "dark"
                  ? { background: "#111827", color: "#fff", border: "none" }
                  : { background: "transparent", color: plan.color, border: `1.5px solid ${plan.color}` })
              }}>
                {plan.cta} →
              </button>
            </div>
          ))}
        </div>

        {/* PLATFORM MATRIX */}
        <div style={{ margin: "8px 0 36px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", textAlign: "center", marginBottom: 4 }}>Platform access by plan</h2>
          <p style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginBottom: 20 }}>Upgrade to unlock more channels</p>
          <div style={{ overflowX: "auto", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
              <thead>
                <tr>
                  {["Platform", "STARTER", "SOLO", "CREATOR", "BUSINESS", "AGENCY"].map((h, i) => (
                    <th key={h} style={{ padding: "11px 10px", fontSize: 10, fontWeight: 700, background: i === 3 ? "#EFF6FF" : "#F9FAFB", color: i === 3 ? "#1E40AF" : "#6B7280", borderBottom: "1.5px solid #E5E7EB", textAlign: i === 0 ? "left" : "center", paddingLeft: i === 0 ? 14 : 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_PLATFORMS.map((platform, ri) => (
                  <tr key={platform}>
                    <td style={{ padding: "10px 14px", fontSize: 11, fontWeight: 500, color: "#374151", borderBottom: ri < ALL_PLATFORMS.length - 1 ? "1px solid #F3F4F6" : "none" }}>{platform}</td>
                    {PLANS.map((plan, pi) => {
                      const has = plan.platforms.includes(platform);
                      return (
                        <td key={plan.id} style={{ textAlign: "center", borderBottom: ri < ALL_PLATFORMS.length - 1 ? "1px solid #F3F4F6" : "none", background: pi === 2 ? "#EFF6FF" : "transparent", fontSize: 13, fontWeight: 700, color: has ? "#059669" : "#D1D5DB" }}>
                          {has ? "✓" : "✗"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ background: "#F9FAFB" }}>
                  <td style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#111827" }}>Brands included</td>
                  {PLANS.map((plan, pi) => (
                    <td key={plan.id} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: pi === 2 ? "#1E40AF" : "#374151", background: pi === 2 ? "#EFF6FF" : "transparent" }}>
                      {plan.brands}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Competitor table */}
        <h2 style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 800, color: "#111827", textAlign: "center", marginBottom: 5 }}>How we compare</h2>
        <p style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>ShoutlyAI is the only tool built for India — festival AI, INR pricing, 5,000+ poster library</p>
        <div style={{ overflowX: "auto", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,.06)", marginBottom: 36 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr>
                {["Tool", "Entry price", "No watermark", "Reels", "Festival AI", "India focus", "365-day plan", "Free tier"].map((h) => (
                  <th key={h} style={{ padding: "10px 9px", fontSize: 10, fontWeight: 700, background: "#F9FAFB", color: "#6B7280", borderBottom: "1.5px solid #E5E7EB", textAlign: h === "Tool" ? "left" : "center", paddingLeft: h === "Tool" ? 14 : 9 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "ShoutlyAI", you: true, entry: inr ? "₹3,000" : "$36", noWm: inr ? "₹3,000" : "$36", reels: true, fest: true, india: true, y365: true, free: "7-day" },
                { name: "Predis.ai", you: false, entry: "$19", noWm: "$19", reels: true, fest: false, india: false, y365: false, free: "Trial" },
                { name: "SocialBee", you: false, entry: "$29", noWm: "$29", reels: false, fest: false, india: false, y365: false, free: "14-day" },
                { name: "Buffer",    you: false, entry: "$6/ch", noWm: "$6/ch", reels: false, fest: false, india: false, y365: false, free: "3 channels" },
                { name: "Hootsuite", you: false, entry: "$99", noWm: "$99", reels: false, fest: false, india: false, y365: false, free: "No" },
              ].map((c, ci) => (
                <tr key={c.name} style={{ background: c.you ? "#EFF6FF" : "transparent" }}>
                  <td style={{ padding: "10px 14px", fontSize: c.you ? 12 : 11, fontWeight: 700, color: c.you ? "#1D4ED8" : "#111827", borderBottom: ci < 4 ? "1px solid #F3F4F6" : "none" }}>
                    {c.you ? "🚀 " : ""}{c.name}
                    {c.you && <span style={{ marginLeft: 5, fontSize: 8, background: "#2563EB", color: "#fff", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>YOU</span>}
                  </td>
                  {[c.entry, c.noWm, c.reels, c.fest, c.india, c.y365, c.free].map((val, vi) => (
                    <td key={vi} style={{ textAlign: "center", fontSize: typeof val === "boolean" ? 13 : 10, fontWeight: typeof val === "boolean" ? 700 : 400, color: typeof val === "boolean" ? (val ? "#059669" : "#D1D5DB") : (c.you ? "#1E40AF" : "#374151"), borderBottom: ci < 4 ? "1px solid #F3F4F6" : "none", background: c.you ? "#EFF6FF" : "transparent" }}>
                      {typeof val === "boolean" ? (val ? "✓" : "✗") : (val as string)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#9CA3AF", margin: "0 0 36px" }}>
          Extra brand add-on: ₹2,500/mo &nbsp;·&nbsp; White-label: ₹15,000/mo &nbsp;·&nbsp; API access: Agency plan only &nbsp;·&nbsp; Custom AI training: ₹83,000 one-time
        </div>

        {/* Value banner */}
        <div style={{ background: "linear-gradient(135deg,#1B2A4A,#0F172A)", borderRadius: 20, padding: "36px 28px", textAlign: "center", color: "#fff", marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: "#60A5FA", marginBottom: 9, textTransform: "uppercase" }}>The Math Is Simple</div>
          <div style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 800, marginBottom: 10, lineHeight: 1.3 }}>
            Agency charges ₹3,00,000/year.<br />
            <span style={{ color: "#60A5FA" }}>ShoutlyAI costs ₹{((annual ? 4800 : 6000) * 12).toLocaleString("en-IN")}/year.</span>
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 auto 22px", maxWidth: 400, lineHeight: 1.6 }}>
            Same content. Zero briefings. No revisions. No invoices. Just 365 days of on-brand posts, done.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Start 7-Day Free Trial →</button>
            <button style={{ background: "transparent", color: "#94A3B8", border: "1.5px solid rgba(255,255,255,.15)", borderRadius: 10, padding: "12px 22px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>See how it works</button>
          </div>
          <div style={{ fontSize: 10, color: "#475569" }}>No credit card required &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; GST invoice on all paid plans</div>
        </div>

        {/* FAQs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 40 }}>
          {[
            { q: "Is there a free trial?", a: "Yes — 7 days of AI content, completely free. No credit card. Upgrade anytime when you're ready." },
            { q: "Can I pay in INR?", a: "Yes. UPI, Net Banking, and all Indian Debit/Credit cards accepted. GST invoice included with every paid plan." },
            { q: "Why is SOLO limited to 2 platforms?", a: "SOLO is built for SMBs starting out. Instagram + Facebook cover 90% of Indian SMB social reach. Upgrade to CREATOR for all 6 platforms." },
            { q: "Can I switch plans anytime?", a: "Absolutely. Upgrade or downgrade anytime. Annual plan unused days are prorated automatically." },
          ].map((faq) => (
            <div key={faq.q} style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{faq.q}</div>
              <div style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
