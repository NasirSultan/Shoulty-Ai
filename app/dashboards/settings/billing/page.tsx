"use client";

import { useState } from "react";
import AdminHeader from "../../AdminHeader";

type Cycle    = "monthly" | "yearly";
type Currency = "inr" | "usd";
// Cycle type kept for activePlan state only

const PRICING = {
  inr: { monthly: 10000, yearly: 8000, yearlyTotal: 96000, saving: 24000, equiv: { monthly: "≈ $119/mo in USD", yearly: "≈ $95/mo in USD" } },
  usd: { monthly: 119,   yearly: 95,   yearlyTotal: 1143,  saving: 286,   equiv: { monthly: "≈ ₹10,000/mo in INR", yearly: "≈ ₹8,000/mo in INR" } },
};
const SYM = { inr: "₹", usd: "$" };

const HISTORY = [
  { date: "Mar 8, 2026", plan: "Business Plan", desc: "Monthly subscription",     amt: "$197.00", status: "paid" },
  { date: "Feb 8, 2026", plan: "Business Plan", desc: "Monthly subscription",     amt: "$197.00", status: "paid" },
  { date: "Jan 8, 2026", plan: "Business Plan", desc: "Monthly subscription",     amt: "$197.00", status: "paid" },
  { date: "Dec 8, 2025", plan: "Business Plan", desc: "Monthly subscription",     amt: "$197.00", status: "paid" },
  { date: "Nov 8, 2025", plan: "Creator Plan",  desc: "Plan upgrade · pro-rated", amt: "$118.00", status: "paid" },
  { date: "Nov 1, 2025", plan: "Creator Plan",  desc: "Monthly subscription",     amt: "$79.00",  status: "paid" },
];
const HISTORY_EXTRA = [
  { date: "Oct 1, 2025", plan: "Creator Plan", desc: "Monthly subscription", amt: "$79.00", status: "paid" },
  { date: "Sep 1, 2025", plan: "Solo Plan",    desc: "Monthly subscription", amt: "$29.00", status: "paid" },
];

const PLAN_FEATURES = [
  "365 AI posts per year",
  "Unlimited reels & stories",
  "Festival & occasion creatives",
  "Auto-schedule across 10 platforms",
  "Brand overlay & watermark-free",
  "Priority support",
];

export default function BillingPage() {
  const [currency, setCurrency]   = useState<Currency>("inr");
  const [activePlan, setActivePlan] = useState<Cycle>("yearly");
  const [historyRows, setHistoryRows] = useState(HISTORY);
  const [moreLoaded, setMoreLoaded]   = useState(false);
  const [defaultCard, setDefaultCard] = useState<"visa" | "mc">("visa");

  const p   = PRICING[currency];
  const sym = SYM[currency];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F8F9FB; color: #0B0C1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes gradMove { 0%{background-position:0%}50%{background-position:100%}100%{background-position:0%} }
        .plan-card { transition: transform .22s, box-shadow .22s; }
        .plan-card:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(11,12,26,.12) !important; }
        .btn-hover:hover { opacity: .88; }
        .row-hover:hover td { background: #F9FAFB !important; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AdminHeader pageTitle="Subscription & Billing" searchPlaceholder="Search billing…" />

        <div style={{ flex: 1, overflowY: "auto", padding: "30px 28px 48px", background: "#F8F9FB" }}>

          {/* ── Heading ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 20, animation: "fadeUp .35s ease both" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.5px", marginBottom: 5 }}>One Plan. Full Power.</h1>
              <p style={{ fontSize: 13.5, color: "#6B7280", maxWidth: 460, lineHeight: 1.55 }}>Everything your business needs to stay visible — posts, reels, scheduling, and more.</p>
            </div>
            <div style={{ display: "flex", gap: 2, padding: 4, borderRadius: 10, background: "#fff", border: "1px solid #E2E4F0", boxShadow: "0 1px 3px rgba(11,12,26,.05)", flexShrink: 0 }}>
              {(["inr","usd"] as Currency[]).map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", border: "none", background: currency === c ? "linear-gradient(135deg,#F97316,#EA580C)" : "transparent", color: currency === c ? "#fff" : "#6B7280", transition: "all .16s", boxShadow: currency === c ? "0 2px 8px rgba(249,115,22,.28)" : "none" }}>
                  {c === "inr" ? "₹ INR" : "$ USD"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Plan Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28, animation: "fadeUp .35s ease .12s both" }}>

            {/* Yearly */}
            <div className="plan-card" style={{ background: "#fff", borderRadius: 18, border: "2px solid #F97316", boxShadow: "0 8px 28px rgba(249,115,22,.13)", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#F97316,#EF4444,#FB923C,#F97316)", backgroundSize: "300%", animation: "gradMove 4s ease infinite" }} />
              <div style={{ position: "absolute", top: 14, right: 14, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg,#F97316,#EF4444)", color: "#fff", fontSize: 9.5, fontWeight: 900, fontFamily: "Sora,sans-serif" }}>BEST VALUE</div>
              <div style={{ padding: "22px 24px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#F97316", fontFamily: "Sora,sans-serif", marginBottom: 10 }}>BEST VALUE — SAVE 20% · RATE LOCKED 12 MONTHS</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 1, marginBottom: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", marginTop: 7 }}>{sym}</span>
                  <span style={{ fontSize: 50, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: -2, lineHeight: 1 }}>{p.yearly.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, marginTop: 12 }}>/mo</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 2 }}>billed annually at {sym}{p.yearlyTotal.toLocaleString()}</div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 12 }}>{p.equiv.yearly}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 9, background: "#ECFDF5", border: "1px solid rgba(16,185,129,.18)", marginBottom: 18 }}>
                  <i className="fa-solid fa-circle-check" style={{ color: "#10B981", fontSize: 12, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>You save {sym}{p.saving.toLocaleString()} a year — 2.4 months free</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {PLAN_FEATURES.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#374151" }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#10B981", flexShrink: 0 }} />{f}
                    </li>
                  ))}
                  <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#374151" }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#10B981", flexShrink: 0 }} />Rate locked for 12 months
                  </li>
                </ul>
                <button onClick={() => setActivePlan("yearly")} className="btn-hover" style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif", border: "none", background: "linear-gradient(135deg,#F97316,#EF4444)", color: "#fff", boxShadow: "0 4px 16px rgba(249,115,22,.38)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  {activePlan === "yearly" ? <><i className="fa-solid fa-check" style={{ fontSize: 11 }} /> Current Plan</> : <><i className="fa-solid fa-bolt" style={{ fontSize: 11 }} /> Get Started — Yearly</>}
                </button>
              </div>
            </div>

            {/* Monthly */}
            <div className="plan-card" style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #E2E4F0", boxShadow: "0 4px 14px rgba(11,12,26,.05)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 4, background: "#E5E7EB" }} />
              <div style={{ padding: "22px 24px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#6B7280", fontFamily: "Sora,sans-serif", marginBottom: 10 }}>FLEXIBLE — CANCEL ANYTIME</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 1, marginBottom: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", marginTop: 7 }}>{sym}</span>
                  <span style={{ fontSize: 50, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: -2, lineHeight: 1 }}>{p.monthly.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, marginTop: 12 }}>/mo</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 2 }}>billed monthly</div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 12 }}>{p.equiv.monthly}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 9, background: "#F9FAFB", border: "1px solid #E2E4F0", marginBottom: 18 }}>
                  <i className="fa-solid fa-rotate" style={{ color: "#6B7280", fontSize: 12, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Flexible month-to-month — cancel anytime</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {PLAN_FEATURES.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#374151" }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#10B981", flexShrink: 0 }} />{f}
                    </li>
                  ))}
                  <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#374151" }}>
                    <i className="fa-solid fa-check" style={{ fontSize: 9, color: "#10B981", flexShrink: 0 }} />No long-term commitment
                  </li>
                </ul>
                <button onClick={() => setActivePlan("monthly")} className="btn-hover" style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Sora,sans-serif", border: activePlan === "monthly" ? "none" : "2px solid #E2E4F0", background: activePlan === "monthly" ? "#0B0C1A" : "#fff", color: activePlan === "monthly" ? "#fff" : "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .18s" }}>
                  {activePlan === "monthly" ? <><i className="fa-solid fa-check" style={{ fontSize: 11 }} /> Current Plan</> : "Choose Monthly"}
                </button>
              </div>
            </div>
          </div>

          {/* Payment logos */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10, marginBottom: 32, animation: "fadeUp .35s ease .18s both" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}>Accepted:</span>
            {[{l:"Visa",bg:"#1A1F71"},{l:"Mastercard",bg:"#1C1C1C"},{l:"Amex",bg:"#2E77BC"},{l:"PayPal",bg:"#003087"}].map(c => (
              <span key={c.l} style={{ padding: "4px 10px", borderRadius: 5, background: c.bg, fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif" }}>{c.l}</span>
            ))}
            <span style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 12 }}>
              {[{icon:"fa-lock",t:"SSL"},{icon:"fa-shield-halved",t:"PCI DSS"},{icon:"fa-rotate-left",t:"Cancel anytime"}].map(x => (
                <span key={x.t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#6B7280", fontWeight: 600 }}>
                  <i className={`fa-solid ${x.icon}`} style={{ color: "#10B981", fontSize: 10 }} />{x.t}
                </span>
              ))}
            </span>
          </div>

          {/* ── Bottom Grid: main + sidebar ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 20, animation: "fadeUp .35s ease .22s both" }}>

            {/* ── LEFT: Payment Methods + Billing History ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Payment Methods */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid #ECEDF8" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-wallet" style={{ fontSize: 13, color: "#F97316" }} /> Payment Methods
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", background: "#F97316", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(249,115,22,.35)" }}>
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> Add Card
                  </button>
                </div>
                <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 9 }}>
                  {/* Visa */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#F9FAFB", border: `1.5px solid ${defaultCard==="visa"?"rgba(249,115,22,.3)":"#F3F4F6"}`, position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => setDefaultCard("visa")}>
                    {defaultCard === "visa" && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#F97316", borderRadius: "10px 0 0 10px" }} />}
                    <div style={{ width: 48, height: 30, borderRadius: 6, background: "#1A1F71", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 60 38" width="40"><text x="6" y="27" fontFamily="serif" fontSize="17" fontWeight="900" fill="#F7F7F7">VISA</text></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A" }}>Visa <span style={{ color: "#8486AB", fontWeight: 400 }}>ending in</span> 4242</div>
                      <div style={{ fontSize: 11, color: "#BFC1D9", fontFamily: "JetBrains Mono,monospace", marginTop: 1 }}>Expires 08 / 2027</div>
                    </div>
                    {defaultCard === "visa" && <span style={{ padding: "2px 8px", borderRadius: 5, background: "#FFF7ED", color: "#F97316", fontSize: 10, fontWeight: 800 }}>DEFAULT</span>}
                    <div style={{ display: "flex", gap: 5 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", border: "1px solid #E2E4F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8486AB" }}>
                        <i className="fa-solid fa-pen" style={{ fontSize: 9 }} />
                      </div>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", border: "1px solid #E2E4F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#EF4444" }}>
                        <i className="fa-solid fa-trash" style={{ fontSize: 9 }} />
                      </div>
                    </div>
                  </div>
                  {/* Mastercard */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#F9FAFB", border: `1.5px solid ${defaultCard==="mc"?"rgba(249,115,22,.3)":"#F3F4F6"}`, position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => setDefaultCard("mc")}>
                    {defaultCard === "mc" && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#F97316", borderRadius: "10px 0 0 10px" }} />}
                    <div style={{ width: 48, height: 30, borderRadius: 6, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 60 38" width="40"><circle cx="22" cy="19" r="12" fill="#EB001B"/><circle cx="38" cy="19" r="12" fill="#F79E1B"/><path d="M30 10.5a12 12 0 010 17A12 12 0 0130 10.5z" fill="#FF5F00"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A" }}>Mastercard <span style={{ color: "#8486AB", fontWeight: 400 }}>ending in</span> 8834</div>
                      <div style={{ fontSize: 11, color: "#BFC1D9", fontFamily: "JetBrains Mono,monospace", marginTop: 1 }}>Expires 12 / 2026</div>
                    </div>
                    {defaultCard === "mc" && <span style={{ padding: "2px 8px", borderRadius: 5, background: "#FFF7ED", color: "#F97316", fontSize: 10, fontWeight: 800 }}>DEFAULT</span>}
                    <div style={{ display: "flex", gap: 5 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", border: "1px solid #E2E4F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8486AB" }}>
                        <i className="fa-solid fa-star" style={{ fontSize: 9 }} />
                      </div>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: "#fff", border: "1px solid #E2E4F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#EF4444" }}>
                        <i className="fa-solid fa-trash" style={{ fontSize: 9 }} />
                      </div>
                    </div>
                  </div>
                  {/* Add new */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 11, borderRadius: 10, border: "1.5px dashed #E2E4F0", background: "#fff", color: "#8486AB", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> Add New Payment Method
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid #ECEDF8" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 13, color: "#F97316" }} /> Billing History
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", background: "#F9FAFB", border: "1px solid #E2E4F0", color: "#374151" }}>
                    <i className="fa-solid fa-file-arrow-down" style={{ fontSize: 10 }} /> Export All
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Date","Plan","Description","Amount","Status","Invoice"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", textAlign: "left", borderBottom: "2px solid #E2E4F0", fontFamily: "Sora,sans-serif", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((r, i) => (
                        <tr key={i} className="row-hover">
                          <td style={{ padding: "11px 14px", fontSize: 12.5, fontWeight: 600, color: "#0B0C1A", whiteSpace: "nowrap", borderBottom: "1px solid #ECEDF8" }}>{r.date}</td>
                          <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                            <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: "#FFF7ED", color: "#F97316" }}>{r.plan}</span>
                          </td>
                          <td style={{ padding: "11px 14px", fontSize: 12.5, color: "#8486AB", borderBottom: "1px solid #ECEDF8" }}>{r.desc}</td>
                          <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                            <span style={{ fontWeight: 800, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{r.amt}</span>
                          </td>
                          <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: r.status === "paid" ? "#ECFDF5" : "#FFFBEB", color: r.status === "paid" ? "#059669" : "#D97706" }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, border: "1px solid #E2E4F0", background: "#F9FAFB", color: "#374151", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", whiteSpace: "nowrap" }}>
                              <i className="fa-solid fa-file-arrow-down" style={{ fontSize: 10 }} /> Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "12px 20px" }}>
                  <button onClick={() => { if (!moreLoaded) { setHistoryRows([...historyRows, ...HISTORY_EXTRA]); setMoreLoaded(true); } }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 9, border: "1px solid #E2E4F0", background: "#F9FAFB", color: "#374151", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: 10 }} /> {moreLoaded ? "All Invoices Loaded" : "Load Earlier Invoices"}
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Next Billing + Quick Actions ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Next Billing — Upcoming */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div style={{ padding: "14px 17px", borderBottom: "1px solid #ECEDF8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 7 }}>
                    <i className="fa-solid fa-calendar-days" style={{ fontSize: 12, color: "#F97316" }} /> Next Billing
                  </div>
                  <span style={{ padding: "2px 9px", borderRadius: 20, background: "#FFF7ED", border: "1px solid rgba(249,115,22,.2)", color: "#F97316", fontSize: 10, fontWeight: 800, fontFamily: "Sora,sans-serif" }}>Upcoming</span>
                </div>
                <div style={{ padding: "15px 17px" }}>
                  <div style={{ padding: 13, borderRadius: 11, background: "linear-gradient(135deg,#FFF7ED,#FFEDD5)", border: "1px solid rgba(249,115,22,.15)", marginBottom: 13 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#F97316", fontFamily: "Sora,sans-serif", marginBottom: 3 }}>Next Charge</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>April 8, 2026</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", marginTop: 2 }}>$197.00 · Business Plan</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: "#F97316", marginTop: 7, fontFamily: "JetBrains Mono,monospace" }}>
                      <i className="fa-solid fa-hourglass-half" style={{ fontSize: 9 }} /> 31 days remaining
                    </div>
                  </div>
                  {[
                    { l: "This month",     v: "$197.00",    green: false },
                    { l: "Last month",     v: "$197.00",    green: false },
                    { l: "YTD 2026",       v: "$591.00",    green: false },
                    { l: "Agency savings", v: "$4,803/mo",  green: true  },
                  ].map(r => (
                    <div key={r.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: r.green ? undefined : "1px solid #ECEDF8" }}>
                      <span style={{ fontSize: 12, color: r.green ? "#10B981" : "#8486AB", fontWeight: 600 }}>{r.l}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: r.green ? "#10B981" : "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security trust */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div style={{ padding: "14px 17px", borderBottom: "1px solid #ECEDF8" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 7 }}>
                    <i className="fa-solid fa-shield-halved" style={{ fontSize: 12, color: "#F97316" }} /> Security
                  </div>
                </div>
                <div style={{ padding: "14px 17px", display: "flex", flexDirection: "column", gap: 7 }}>
                  {[
                    { icon: "fa-lock",        t: "256-bit SSL Encryption",  s: "All data encrypted in transit" },
                    { icon: "fa-shield-check", t: "PCI DSS Level 1",         s: "Highest card security standard" },
                    { icon: "fa-eye-slash",   t: "Zero Card Storage",       s: "Tokenized via Stripe Vault" },
                  ].map(x => (
                    <div key={x.t} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "9px 11px", borderRadius: 9, background: "#F9FAFB", border: "1px solid #ECEDF8" }}>
                      <i className={`fa-solid ${x.icon}`} style={{ fontSize: 13, color: "#10B981", flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{x.t}</div>
                        <div style={{ fontSize: 11, color: "#8486AB", marginTop: 1 }}>{x.s}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 9, background: "#F9FAFB", border: "1px solid #ECEDF8", marginTop: 2 }}>
                    <i className="fa-brands fa-stripe" style={{ fontSize: 20, color: "#635BFF" }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0B0C1A" }}>Powered by Stripe</div>
                      <div style={{ fontSize: 11, color: "#8486AB", marginTop: 1 }}>Trusted by 500K+ businesses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
