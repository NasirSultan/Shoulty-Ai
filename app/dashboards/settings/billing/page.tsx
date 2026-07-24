"use client";

import { useState, useEffect } from "react";
import AdminHeader from "../../AdminHeader";
import { API_BASE_URL } from "@/api/configApi";

type Currency = "inr" | "usd";

const SUB_BASE = API_BASE_URL;

const PRICING = {
  inr: { monthly: 10000, yearly: 8000, yearlyTotal: 96000, saving: 24000, equiv: { monthly: "≈ $119/mo in USD", yearly: "≈ $95/mo in USD" } },
  usd: { monthly: 119,   yearly: 95,   yearlyTotal: 1143,  saving: 286,   equiv: { monthly: "≈ ₹10,000/mo in INR", yearly: "≈ ₹8,000/mo in INR" } },
};
const SYM: Record<string, string> = { inr: "₹", usd: "$", INR: "₹", USD: "$" };

const PLAN_FEATURES = [
  "365 AI posts per year",
  "Unlimited reels & stories",
  "Festival & occasion creatives",
  "Auto-schedule across 10 platforms",
  "Brand overlay & watermark-free",
  "Priority support",
];

interface CurrentSub {
  hasActivePlan: boolean;
  isTrial?: boolean;
  billing?: "MONTHLY" | "YEARLY";
  currency?: "INR" | "USD";
  amount?: number;
  startedAt?: string;
  expiresAt?: string;
  daysRemaining?: number;
}

interface HistoryRow {
  id: string;
  plan: string | null;
  billing: "MONTHLY" | "YEARLY" | null;
  amount: number | null;
  currency: "INR" | "USD" | null;
  isTrial: boolean;
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") ?? "" : "";
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const fmtAmt = (amt: number | null, cur: string | null) => {
  if (amt == null || !cur) return "—";
  return `${SYM[cur] ?? ""}${amt.toLocaleString()}`;
};

export default function BillingPage() {
  const [currency, setCurrency]     = useState<Currency>("inr");
  const [currentSub, setCurrentSub] = useState<CurrentSub | null>(null);
  const [history, setHistory]       = useState<HistoryRow[]>([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [buyLoading, setBuyLoading] = useState<"MONTHLY" | "YEARLY" | null>(null);
  const [defaultCard, setDefaultCard] = useState<"visa" | "mc">("visa");
  const [toast, setToast]           = useState<{ msg: string; type: "green" | "red" | "amber" } | null>(null);

  const showToast = (msg: string, type: "green" | "red" | "amber" = "green") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingSub(true);
      try {
        const [curRes, histRes] = await Promise.all([
          fetch(`${SUB_BASE}/api/subscription/current`, { headers: authHeaders() }),
          fetch(`${SUB_BASE}/api/subscription/history`, { headers: authHeaders() }),
        ]);
        if (curRes.ok) {
          const cur: CurrentSub = await curRes.json();
          setCurrentSub(cur);
          if (cur.currency) setCurrency(cur.currency.toLowerCase() as Currency);
        }
        if (histRes.ok) {
          const hist: HistoryRow[] = await histRes.json();
          setHistory(Array.isArray(hist) ? hist : []);
        }
      } catch {
        showToast("Could not load subscription data", "red");
      } finally {
        setLoadingSub(false);
      }
    };
    fetchAll();
  }, []);

  const handleBuy = async (billing: "MONTHLY" | "YEARLY") => {
    setBuyLoading(billing);
    try {
      const res = await fetch(`${SUB_BASE}/api/subscription/buy`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ billing, currency: currency.toUpperCase() }),
      });
      if (res.status === 401) { window.location.href = "/sign-in"; return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err?.message || "Purchase failed — please try again", "red");
        return;
      }
      showToast(`${billing === "YEARLY" ? "Yearly" : "Monthly"} plan activated!`, "green");
      // Refresh current subscription
      const cur: CurrentSub = await fetch(`${SUB_BASE}/api/subscription/current`, { headers: authHeaders() }).then(r => r.json());
      setCurrentSub(cur);
      const hist: HistoryRow[] = await fetch(`${SUB_BASE}/api/subscription/history`, { headers: authHeaders() }).then(r => r.json());
      setHistory(Array.isArray(hist) ? hist : []);
    } catch {
      showToast("Network error — could not complete purchase", "red");
    } finally {
      setBuyLoading(null);
    }
  };

  const p   = PRICING[currency];
  const sym = SYM[currency];
  const activeBilling = currentSub?.hasActivePlan ? currentSub.billing : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F8F9FB; color: #0B0C1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes gradMove { 0%{background-position:0%}50%{background-position:100%}100%{background-position:0%} }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .plan-card { transition: transform .22s, box-shadow .22s; }
        .plan-card:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(11,12,26,.12) !important; }
        .btn-hover:hover { opacity: .88; }
        .row-hover:hover td { background: #F9FAFB !important; }
        .bill-toast { position:fixed; top:80px; right:18px; z-index:9999; min-width:260px; max-width:360px; padding:10px 14px; border-radius:10px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:8px; box-shadow:0 8px 28px rgba(0,0,0,.14); animation:fadeUp .25s ease both; }
        .bill-toast.green { background:#ECFDF5; border:1px solid rgba(16,185,129,.35); color:#065F46; }
        .bill-toast.red   { background:#FEF2F2; border:1px solid rgba(239,68,68,.35);  color:#991B1B; }
        .bill-toast.amber { background:#FFFBEB; border:1px solid rgba(245,158,11,.35); color:#92400E; }
        .bill-bottom-grid, .bill-bottom-grid > div, .bill-card { min-width: 0; }
        .bill-history-cards { display: none; }
        .bill-hist-card { border: 1px solid #ECEDF8; border-radius: 12px; padding: 12px 13px; background: #F9FAFB; }
        .bill-hist-card + .bill-hist-card { margin-top: 10px; }
        .bill-hist-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .bill-hist-card-date { font-size: 12.5px; font-weight: 700; color: #0B0C1A; margin-bottom: 6px; }
        .bill-hist-card-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: #6B7280; }

        @media (min-width: 768px) {
          .bill-admin-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
            background: #fff !important;
            border-bottom: 1px solid #E4E5EF !important;
          }
          .bill-wrapper {
            margin-top: 56px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .bill-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 767px) {
          .bill-admin-header {
            display: none !important;
          }
          .bill-wrapper {
            padding: 14px 12px 36px !important;
            overflow-x: hidden !important;
          }
          .bill-heading-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
            margin-bottom: 18px !important;
          }
          .bill-title { font-size: 20px !important; }
          .bill-sub { font-size: 12.5px !important; max-width: 100% !important; }
          .bill-currency-toggle { align-self: flex-start !important; }

          .bill-plans-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            margin-bottom: 20px !important;
          }
          .bill-plan-body { padding: 18px 18px 16px !important; }
          .bill-plan-badge { font-size: 9px !important; line-height: 1.4 !important; }
          .bill-price-val { font-size: 38px !important; }
          .bill-price-sym { font-size: 15px !important; }

          .bill-logos-row {
            gap: 8px !important;
            margin-bottom: 22px !important;
          }

          .bill-bottom-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .bill-card-hdr {
            padding: 12px 14px !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .bill-card-body { padding: 14px !important; }
          .bill-pay-row { padding: 10px 12px !important; gap: 10px !important; }

          .bill-table-wrap {
            display: none !important;
          }
          .bill-history-cards {
            display: block !important;
            padding: 12px !important;
          }
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

      {toast && (
        <div className={`bill-toast ${toast.type}`}>
          <i className={`fa-solid ${toast.type === "green" ? "fa-circle-check" : toast.type === "red" ? "fa-circle-xmark" : "fa-triangle-exclamation"}`} />
          {toast.msg}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AdminHeader className="bill-admin-header" pageTitle="Subscription & Billing" searchPlaceholder="Search billing…" />

        <div className="bill-wrapper" style={{ flex: 1, overflowY: "auto", padding: "30px 28px 48px", background: "#F8F9FB" }}>

          {/* ── Heading + Currency toggle ── */}
          <div className="bill-heading-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 20, animation: "fadeUp .35s ease both" }}>
            <div>
              <h1 className="bill-title" style={{ fontSize: 24, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.5px", marginBottom: 5 }}>One Plan. Full Power.</h1>
              <p className="bill-sub" style={{ fontSize: 13.5, color: "#6B7280", maxWidth: 460, lineHeight: 1.55 }}>Everything your business needs to stay visible — posts, reels, scheduling, and more.</p>
            </div>
            <div className="bill-currency-toggle" style={{ display: "flex", gap: 2, padding: 4, borderRadius: 10, background: "#fff", border: "1px solid #E2E4F0", boxShadow: "0 1px 3px rgba(11,12,26,.05)", flexShrink: 0 }}>
              {(["inr", "usd"] as Currency[]).map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", border: "none", background: currency === c ? "linear-gradient(135deg,#F97316,#EA580C)" : "transparent", color: currency === c ? "#fff" : "#6B7280", transition: "all .16s", boxShadow: currency === c ? "0 2px 8px rgba(249,115,22,.28)" : "none" }}>
                  {c === "inr" ? "₹ INR" : "$ USD"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Plan Cards ── */}
          <div className="bill-plans-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28, animation: "fadeUp .35s ease .12s both" }}>

            {/* Yearly */}
            <div className="plan-card" style={{ background: "#fff", borderRadius: 18, border: `2px solid ${activeBilling === "YEARLY" ? "#10B981" : "#F97316"}`, boxShadow: "0 8px 28px rgba(249,115,22,.13)", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#F97316,#EF4444,#FB923C,#F97316)", backgroundSize: "300%", animation: "gradMove 4s ease infinite" }} />
              {activeBilling === "YEARLY" && (
                <div style={{ position: "absolute", top: 14, right: 14, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontSize: 9.5, fontWeight: 900, fontFamily: "Sora,sans-serif" }}>ACTIVE</div>
              )}
              {activeBilling !== "YEARLY" && (
                <div style={{ position: "absolute", top: 14, right: 14, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg,#F97316,#EF4444)", color: "#fff", fontSize: 9.5, fontWeight: 900, fontFamily: "Sora,sans-serif" }}>BEST VALUE</div>
              )}
              <div className="bill-plan-body" style={{ padding: "22px 24px 20px" }}>
                <div className="bill-plan-badge" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#F97316", fontFamily: "Sora,sans-serif", marginBottom: 10 }}>BEST VALUE — SAVE 20% · RATE LOCKED 12 MONTHS</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 1, marginBottom: 2 }}>
                  <span className="bill-price-sym" style={{ fontSize: 18, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", marginTop: 7 }}>{sym}</span>
                  <span className="bill-price-val" style={{ fontSize: 50, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: -2, lineHeight: 1 }}>{p.yearly.toLocaleString()}</span>
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
                <button
                  onClick={() => activeBilling !== "YEARLY" && handleBuy("YEARLY")}
                  disabled={buyLoading === "YEARLY" || activeBilling === "YEARLY"}
                  className="btn-hover"
                  style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: activeBilling === "YEARLY" ? "default" : "pointer", fontFamily: "Sora,sans-serif", border: "none", background: activeBilling === "YEARLY" ? "linear-gradient(135deg,#10B981,#059669)" : "linear-gradient(135deg,#F97316,#EF4444)", color: "#fff", boxShadow: "0 4px 16px rgba(249,115,22,.38)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: buyLoading === "YEARLY" ? .7 : 1 }}
                >
                  {buyLoading === "YEARLY"
                    ? <><i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite", fontSize: 12 }} /> Processing…</>
                    : activeBilling === "YEARLY"
                      ? <><i className="fa-solid fa-check" style={{ fontSize: 11 }} /> Current Plan</>
                      : <><i className="fa-solid fa-bolt" style={{ fontSize: 11 }} /> Get Started — Yearly</>}
                </button>
              </div>
            </div>

            {/* Monthly */}
            <div className="plan-card" style={{ background: "#fff", borderRadius: 18, border: `${activeBilling === "MONTHLY" ? "2px solid #10B981" : "1.5px solid #E2E4F0"}`, boxShadow: "0 4px 14px rgba(11,12,26,.05)", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ height: 4, background: activeBilling === "MONTHLY" ? "#10B981" : "#E5E7EB" }} />
              {activeBilling === "MONTHLY" && (
                <div style={{ position: "absolute", top: 14, right: 14, padding: "3px 10px", borderRadius: 20, background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", fontSize: 9.5, fontWeight: 900, fontFamily: "Sora,sans-serif" }}>ACTIVE</div>
              )}
              <div className="bill-plan-body" style={{ padding: "22px 24px 20px" }}>
                <div className="bill-plan-badge" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#6B7280", fontFamily: "Sora,sans-serif", marginBottom: 10 }}>FLEXIBLE — CANCEL ANYTIME</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 1, marginBottom: 2 }}>
                  <span className="bill-price-sym" style={{ fontSize: 18, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", marginTop: 7 }}>{sym}</span>
                  <span className="bill-price-val" style={{ fontSize: 50, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif", letterSpacing: -2, lineHeight: 1 }}>{p.monthly.toLocaleString()}</span>
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
                <button
                  onClick={() => activeBilling !== "MONTHLY" && handleBuy("MONTHLY")}
                  disabled={buyLoading === "MONTHLY" || activeBilling === "MONTHLY"}
                  className="btn-hover"
                  style={{ width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: activeBilling === "MONTHLY" ? "default" : "pointer", fontFamily: "Sora,sans-serif", border: activeBilling === "MONTHLY" ? "none" : "2px solid #E2E4F0", background: activeBilling === "MONTHLY" ? "#10B981" : "#fff", color: activeBilling === "MONTHLY" ? "#fff" : "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all .18s", opacity: buyLoading === "MONTHLY" ? .7 : 1 }}
                >
                  {buyLoading === "MONTHLY"
                    ? <><i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite", fontSize: 12 }} /> Processing…</>
                    : activeBilling === "MONTHLY"
                      ? <><i className="fa-solid fa-check" style={{ fontSize: 11 }} /> Current Plan</>
                      : "Choose Monthly"}
                </button>
              </div>
            </div>
          </div>

          {/* Payment logos */}
          <div className="bill-logos-row" style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10, marginBottom: 32, animation: "fadeUp .35s ease .18s both", flexWrap: "wrap" }}>
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

          {/* ── Bottom Grid ── */}
          <div className="bill-bottom-grid" style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 20, animation: "fadeUp .35s ease .22s both" }}>

            {/* LEFT: Payment Methods + Billing History */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Payment Methods */}
              <div className="bill-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div className="bill-card-hdr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid #ECEDF8" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-wallet" style={{ fontSize: 13, color: "#F97316" }} /> Payment Methods
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", background: "#F97316", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(249,115,22,.35)" }}>
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> Add Card
                  </button>
                </div>
                <div className="bill-card-body" style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 9 }}>
                  <div className="bill-pay-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#F9FAFB", border: `1.5px solid ${defaultCard==="visa"?"rgba(249,115,22,.3)":"#F3F4F6"}`, position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => setDefaultCard("visa")}>
                    {defaultCard === "visa" && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#F97316", borderRadius: "10px 0 0 10px" }} />}
                    <div style={{ width: 48, height: 30, borderRadius: 6, background: "#1A1F71", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 60 38" width="40"><text x="6" y="27" fontFamily="serif" fontSize="17" fontWeight="900" fill="#F7F7F7">VISA</text></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A" }}>Visa <span style={{ color: "#8486AB", fontWeight: 400 }}>ending in</span> 4242</div>
                      <div style={{ fontSize: 11, color: "#BFC1D9", fontFamily: "JetBrains Mono,monospace", marginTop: 1 }}>Expires 08 / 2027</div>
                    </div>
                    {defaultCard === "visa" && <span style={{ padding: "2px 8px", borderRadius: 5, background: "#FFF7ED", color: "#F97316", fontSize: 10, fontWeight: 800 }}>DEFAULT</span>}
                  </div>
                  <div className="bill-pay-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#F9FAFB", border: `1.5px solid ${defaultCard==="mc"?"rgba(249,115,22,.3)":"#F3F4F6"}`, position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => setDefaultCard("mc")}>
                    {defaultCard === "mc" && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#F97316", borderRadius: "10px 0 0 10px" }} />}
                    <div style={{ width: 48, height: 30, borderRadius: 6, background: "#1C1C1C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 60 38" width="40"><circle cx="22" cy="19" r="12" fill="#EB001B"/><circle cx="38" cy="19" r="12" fill="#F79E1B"/><path d="M30 10.5a12 12 0 010 17A12 12 0 0130 10.5z" fill="#FF5F00"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0B0C1A" }}>Mastercard <span style={{ color: "#8486AB", fontWeight: 400 }}>ending in</span> 8834</div>
                      <div style={{ fontSize: 11, color: "#BFC1D9", fontFamily: "JetBrains Mono,monospace", marginTop: 1 }}>Expires 12 / 2026</div>
                    </div>
                    {defaultCard === "mc" && <span style={{ padding: "2px 8px", borderRadius: 5, background: "#FFF7ED", color: "#F97316", fontSize: 10, fontWeight: 800 }}>DEFAULT</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 11, borderRadius: 10, border: "1.5px dashed #E2E4F0", background: "#fff", color: "#8486AB", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>
                    <i className="fa-solid fa-plus" style={{ fontSize: 10 }} /> Add New Payment Method
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <div className="bill-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div className="bill-card-hdr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid #ECEDF8" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 13, color: "#F97316" }} /> Billing History
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", background: "#F9FAFB", border: "1px solid #E2E4F0", color: "#374151" }}>
                    <i className="fa-solid fa-file-arrow-down" style={{ fontSize: 10 }} /> Export All
                  </button>
                </div>
                {loadingSub ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "#8486AB", fontSize: 13 }}>
                    <i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite", fontSize: 18 }} />
                    <div style={{ marginTop: 10 }}>Loading history…</div>
                  </div>
                ) : history.length === 0 ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "#8486AB", fontSize: 13 }}>No billing history yet.</div>
                ) : (
                  <>
                    {/* Desktop/tablet table */}
                    <div className="bill-table-wrap" style={{ overflowX: "auto" }}>
                      <table className="bill-history-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            {["Date", "Plan", "Billing", "Amount", "Status", "Invoice"].map(h => (
                              <th key={h} style={{ padding: "10px 14px", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#8486AB", textAlign: "left", borderBottom: "2px solid #E2E4F0", fontFamily: "Sora,sans-serif", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((r) => (
                            <tr key={r.id} className="row-hover">
                              <td style={{ padding: "11px 14px", fontSize: 12.5, fontWeight: 600, color: "#0B0C1A", whiteSpace: "nowrap", borderBottom: "1px solid #ECEDF8" }}>{fmtDate(r.createdAt)}</td>
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                                <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: r.isTrial ? "#EFF6FF" : "#FFF7ED", color: r.isTrial ? "#3B82F6" : "#F97316" }}>
                                  {r.isTrial ? "Trial" : (r.plan ?? "—")}
                                </span>
                              </td>
                              <td style={{ padding: "11px 14px", fontSize: 12.5, color: "#8486AB", borderBottom: "1px solid #ECEDF8" }}>
                                {r.billing ? `${r.billing.charAt(0)}${r.billing.slice(1).toLowerCase()} subscription` : "—"}
                              </td>
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                                <span style={{ fontWeight: 800, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{fmtAmt(r.amount, r.currency)}</span>
                              </td>
                              <td style={{ padding: "11px 14px", borderBottom: "1px solid #ECEDF8" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: r.isActive ? "#ECFDF5" : "#F3F4F6", color: r.isActive ? "#059669" : "#6B7280" }}>
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                                  {r.isActive ? "Active" : "Expired"}
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

                    {/* Mobile card list — no horizontal scroll */}
                    <div className="bill-history-cards">
                      {history.map((r) => (
                        <div key={r.id} className="bill-hist-card">
                          <div className="bill-hist-card-top">
                            <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: r.isTrial ? "#EFF6FF" : "#FFF7ED", color: r.isTrial ? "#3B82F6" : "#F97316" }}>
                              {r.isTrial ? "Trial" : (r.plan ?? "—")}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: r.isActive ? "#ECFDF5" : "#F3F4F6", color: r.isActive ? "#059669" : "#6B7280" }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                              {r.isActive ? "Active" : "Expired"}
                            </span>
                          </div>
                          <div className="bill-hist-card-date">{fmtDate(r.createdAt)}</div>
                          <div className="bill-hist-card-row">
                            <span>{r.billing ? `${r.billing.charAt(0)}${r.billing.slice(1).toLowerCase()} subscription` : "—"}</span>
                            <span style={{ fontWeight: 800, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{fmtAmt(r.amount, r.currency)}</span>
                          </div>
                          <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 10px", borderRadius: 7, border: "1px solid #E2E4F0", background: "#F9FAFB", color: "#374151", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif", width: "100%", marginTop: 8 }}>
                            <i className="fa-solid fa-file-arrow-down" style={{ fontSize: 10 }} /> Download Invoice
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Next Billing + Security */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Next Billing */}
              <div className="bill-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div className="bill-card-hdr" style={{ padding: "14px 17px", borderBottom: "1px solid #ECEDF8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 7 }}>
                    <i className="fa-solid fa-calendar-days" style={{ fontSize: 12, color: "#F97316" }} /> Next Billing
                  </div>
                  <span style={{ padding: "2px 9px", borderRadius: 20, background: currentSub?.hasActivePlan ? "#FFF7ED" : "#F3F4F6", border: `1px solid ${currentSub?.hasActivePlan ? "rgba(249,115,22,.2)" : "#E2E4F0"}`, color: currentSub?.hasActivePlan ? "#F97316" : "#6B7280", fontSize: 10, fontWeight: 800, fontFamily: "Sora,sans-serif" }}>
                    {loadingSub ? "…" : currentSub?.hasActivePlan ? "Upcoming" : "No Plan"}
                  </span>
                </div>
                <div className="bill-card-body" style={{ padding: "15px 17px" }}>
                  {loadingSub ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "#8486AB" }}>
                      <i className="fa-solid fa-spinner" style={{ animation: "spin 1s linear infinite", fontSize: 16 }} />
                    </div>
                  ) : currentSub?.hasActivePlan ? (
                    <>
                      <div style={{ padding: 13, borderRadius: 11, background: "linear-gradient(135deg,#FFF7ED,#FFEDD5)", border: "1px solid rgba(249,115,22,.15)", marginBottom: 13 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#F97316", fontFamily: "Sora,sans-serif", marginBottom: 3 }}>Next Charge</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#0B0C1A", fontFamily: "Sora,sans-serif" }}>{currentSub.expiresAt ? fmtDate(currentSub.expiresAt) : "—"}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", marginTop: 2 }}>
                          {fmtAmt(currentSub.amount ?? null, currentSub.currency ?? null)} · {currentSub.billing ? `${currentSub.billing.charAt(0)}${currentSub.billing.slice(1).toLowerCase()} Plan` : "—"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: "#F97316", marginTop: 7, fontFamily: "JetBrains Mono,monospace" }}>
                          <i className="fa-solid fa-hourglass-half" style={{ fontSize: 9 }} /> {currentSub.daysRemaining ?? 0} days remaining
                        </div>
                      </div>
                      {[
                        { l: "Billing cycle", v: currentSub.billing ?? "—" },
                        { l: "Currency",      v: currentSub.currency ?? "—" },
                        { l: "Started",       v: currentSub.startedAt ? fmtDate(currentSub.startedAt) : "—" },
                      ].map(r => (
                        <div key={r.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #ECEDF8" }}>
                          <span style={{ fontSize: 12, color: "#8486AB", fontWeight: 600 }}>{r.l}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#0B0C1A", fontFamily: "JetBrains Mono,monospace" }}>{r.v}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#8486AB" }}>
                      <i className="fa-solid fa-circle-xmark" style={{ fontSize: 28, color: "#E2E4F0", marginBottom: 10, display: "block" }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>No Active Plan</div>
                      <div style={{ fontSize: 12, color: "#8486AB", lineHeight: 1.5 }}>Choose a plan above to get started</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security */}
              <div className="bill-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E4F0", overflow: "hidden", boxShadow: "0 1px 4px rgba(11,12,26,.05)" }}>
                <div className="bill-card-hdr" style={{ padding: "14px 17px", borderBottom: "1px solid #ECEDF8" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0B0C1A", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 7 }}>
                    <i className="fa-solid fa-shield-halved" style={{ fontSize: 12, color: "#F97316" }} /> Security
                  </div>
                </div>
                <div className="bill-card-body" style={{ padding: "14px 17px", display: "flex", flexDirection: "column", gap: 7 }}>
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
