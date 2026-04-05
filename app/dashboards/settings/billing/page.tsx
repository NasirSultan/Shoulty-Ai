"use client";

import { useState, useRef } from "react";
import Sidebar from "../../Sidebar";
import AdminHeader from "../../AdminHeader";
import { useSidebarState } from "@/hooks/useSidebarState";

// ── Types ──────────────────────────────────────────────────────────────────
type CycleType = "monthly" | "yearly";
type ModalType = "upgrade" | "cycle" | "addCard" | "deleteCard" | "cancel" | "confirmSwitch" | null;

interface PlanFeature { yes: boolean; txt: string; icon: string }
interface Plan {
  id: string; name: string; monthly: number; yearly: number;
  color: string; grad: string; popular?: boolean;
  features: PlanFeature[];
}
interface Addon {
  id: string; name: string; desc: string; price: string; period: string;
  icon: string; grad: string; badge: string; badgeClr: string; active: boolean;
}
interface HistoryRow {
  date: string; plan: string; desc: string; amt: string; status: "paid" | "pending" | "failed";
}

// ── Data ───────────────────────────────────────────────────────────────────
const PLANS: Plan[] = [
  {
    id:"solo", name:"Solo", monthly:29, yearly:23,
    color:"#6B7280", grad:"linear-gradient(135deg,#6B7280,#9CA3AF)",
    features:[
      {yes:true,  txt:"365 AI posts / year",  icon:"fa-calendar-check"},
      {yes:false, txt:"No reels included",    icon:"fa-film"},
      {yes:true,  txt:"1 brand",              icon:"fa-tag"},
      {yes:false, txt:"ShoutlyAI watermark",  icon:"fa-copyright"},
      {yes:true,  txt:"AI caption writing",   icon:"fa-pen-nib"},
      {yes:true,  txt:"Festival creatives",   icon:"fa-star"},
      {yes:false, txt:"No custom fonts",      icon:"fa-font"},
      {yes:true,  txt:"Email support",        icon:"fa-envelope"},
    ],
  },
  {
    id:"creator", name:"Creator", monthly:79, yearly:63,
    color:"#3B82F6", grad:"linear-gradient(135deg,#3B82F6,#6366F1)",
    features:[
      {yes:true,  txt:"Unlimited posts",      icon:"fa-infinity"},
      {yes:true,  txt:"12 reels / month",     icon:"fa-film"},
      {yes:true,  txt:"1 brand",              icon:"fa-tag"},
      {yes:true,  txt:"No watermark",         icon:"fa-eye-slash"},
      {yes:true,  txt:"AI caption writing",   icon:"fa-pen-nib"},
      {yes:true,  txt:"Festival creatives",   icon:"fa-star"},
      {yes:false, txt:"No brand kits",        icon:"fa-palette"},
      {yes:true,  txt:"Priority support",     icon:"fa-headset"},
    ],
  },
  {
    id:"business", name:"Business", monthly:197, yearly:158, popular:true,
    color:"#5B5BD6", grad:"linear-gradient(135deg,#5B5BD6,#7C3AED)",
    features:[
      {yes:true, txt:"Unlimited posts",       icon:"fa-infinity"},
      {yes:true, txt:"Unlimited reels",       icon:"fa-film"},
      {yes:true, txt:"3 brands",              icon:"fa-tags"},
      {yes:true, txt:"Premium branding",      icon:"fa-palette"},
      {yes:true, txt:"Brand voice AI",        icon:"fa-microphone"},
      {yes:true, txt:"Festival creatives",    icon:"fa-star"},
      {yes:true, txt:"Custom fonts & logos",  icon:"fa-font"},
      {yes:true, txt:"Priority support",      icon:"fa-headset"},
    ],
  },
  {
    id:"growth", name:"Growth", monthly:497, yearly:398,
    color:"#F97316", grad:"linear-gradient(135deg,#F97316,#EF4444)",
    features:[
      {yes:true, txt:"Unlimited posts",       icon:"fa-infinity"},
      {yes:true, txt:"Unlimited reels",       icon:"fa-film"},
      {yes:true, txt:"Up to 10 brands",       icon:"fa-tags"},
      {yes:true, txt:"White-label branding",  icon:"fa-wand-magic-sparkles"},
      {yes:true, txt:"Full API access",       icon:"fa-code"},
      {yes:true, txt:"Brand voice AI × 10",   icon:"fa-microphone"},
      {yes:true, txt:"Custom AI training",    icon:"fa-brain"},
      {yes:true, txt:"Dedicated manager",     icon:"fa-headset"},
    ],
  },
];

const ORDER = ["solo","creator","business","growth"];

const INIT_ADDONS: Addon[] = [
  { id:"extra-brand", name:"Extra Brand", desc:"Add one more brand slot to your plan. Perfect for agencies managing multiple clients.", price:"$29", period:"/month", icon:"fa-solid fa-tag", grad:"linear-gradient(135deg,#3B82F6,#6366F1)", badge:"Popular", badgeClr:"#3B82F6", active:false },
  { id:"white-label", name:"White-Label", desc:"Remove Shoutly AI branding entirely. Deliver content under your own brand.", price:"$197", period:"/month", icon:"fa-solid fa-wand-magic-sparkles", grad:"linear-gradient(135deg,#5B5BD6,#7C3AED)", badge:"Pro", badgeClr:"#5B5BD6", active:false },
  { id:"api", name:"API Access", desc:"Full developer API with webhooks. Build custom integrations and automate at scale.", price:"$497", period:"/month", icon:"fa-solid fa-code", grad:"linear-gradient(135deg,#0F1117,#2D2F4A)", badge:"Dev", badgeClr:"#8486AB", active:false },
  { id:"ai-train", name:"Custom AI Training", desc:"Train ShoutlyAI on your exact brand voice, tone, and visual style.", price:"$997", period:"one-time", icon:"fa-solid fa-brain", grad:"linear-gradient(135deg,#EC4899,#F97316)", badge:"Enterprise", badgeClr:"#F97316", active:false },
];

const HISTORY_ROWS: HistoryRow[] = [
  { date:"Mar 8, 2026",  plan:"Business Plan", desc:"Monthly subscription",       amt:"$197.00", status:"paid" },
  { date:"Feb 8, 2026",  plan:"Business Plan", desc:"Monthly subscription",       amt:"$197.00", status:"paid" },
  { date:"Jan 8, 2026",  plan:"Business Plan", desc:"Monthly subscription",       amt:"$197.00", status:"paid" },
  { date:"Dec 8, 2025",  plan:"Business Plan", desc:"Monthly subscription",       amt:"$197.00", status:"paid" },
  { date:"Nov 8, 2025",  plan:"Creator Plan",  desc:"Plan upgrade · pro-rated",   amt:"$118.00", status:"paid" },
  { date:"Nov 1, 2025",  plan:"Creator Plan",  desc:"Monthly subscription",       amt:"$79.00",  status:"paid" },
];
const HISTORY_EXTRA: HistoryRow[] = [
  { date:"Oct 1, 2025", plan:"Creator Plan", desc:"Monthly subscription",         amt:"$79.00",  status:"paid" },
  { date:"Sep 1, 2025", plan:"Solo Plan",    desc:"Monthly subscription",         amt:"$29.00",  status:"paid" },
  { date:"Aug 1, 2025", plan:"Solo Plan",    desc:"Monthly subscription",         amt:"$29.00",  status:"paid" },
];

// ── Toast hook ─────────────────────────────────────────────────────────────
interface ToastItem { id: number; msg: string; type: string }
function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const show = (msg: string, type = "default") => {
    const id = ++counter.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, show, remove };
}

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ position:"relative", width:36, height:20, flexShrink:0, cursor:"pointer" }}>
      <div style={{ position:"absolute", inset:0, borderRadius:10, background:checked?"#5B5BD6":"#E2E4F0", border:`1px solid ${checked?"#5B5BD6":"#E2E4F0"}`, transition:"all .2s" }} />
      <div style={{ position:"absolute", top:3, left:checked?19:3, width:12, height:12, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.25)" }} />
    </div>
  );
}

// ── Plan Card ──────────────────────────────────────────────────────────────
function PlanCard({ p, currentPlan, cycle, onSwitch }: { p: Plan; currentPlan: string; cycle: CycleType; onSwitch: (id: string, isUp: boolean) => void }) {
  const price = cycle === "yearly" ? p.yearly : p.monthly;
  const origP = cycle === "yearly" ? p.monthly : null;
  const isCur = p.id === currentPlan;
  const isSales = p.id === "growth";
  const curIdx = ORDER.indexOf(currentPlan);
  const pIdx   = ORDER.indexOf(p.id);
  const isUp   = pIdx > curIdx;

  let btnStyle: React.CSSProperties;
  let btnLabel: React.ReactNode;
  let btnClick: (() => void) | undefined;

  if (isCur) {
    btnStyle = { background:"#ECFDF5", border:"1.5px solid rgba(16,185,129,.3)", color:"#059669" };
    btnLabel = <><i className="fa-solid fa-check" style={{ fontSize:10 }} /> Current Plan</>;
    btnClick = undefined;
  } else if (isSales) {
    btnStyle = { background:"#0F1117", border:"none", color:"#F0F1FF" };
    btnLabel = <><i className="fa-solid fa-phone" style={{ fontSize:10 }} /> Contact Sales</>;
    btnClick = undefined;
  } else if (isUp) {
    btnStyle = { background:p.grad, border:"none", color:"#fff", boxShadow:"0 4px 20px rgba(91,91,214,.32)" };
    btnLabel = <><i className="fa-solid fa-bolt" style={{ fontSize:10 }} /> Upgrade</>;
    btnClick = () => onSwitch(p.id, true);
  } else {
    btnStyle = { background:"#F0F1F9", border:"1.5px solid #E2E4F0", color:"#3D3F60" };
    btnLabel = <><i className="fa-solid fa-arrow-down" style={{ fontSize:10 }} /> Downgrade</>;
    btnClick = () => onSwitch(p.id, false);
  }

  return (
    <div style={{ borderRadius:14, border:`1.5px solid ${isCur?"#10B981":p.popular?"#5B5BD6":"#E2E4F0"}`, background:"#fff", overflow:"hidden", display:"flex", flexDirection:"column", transition:"all .22s", position:"relative", boxShadow:isCur?"0 0 0 3px rgba(16,185,129,.1)":undefined }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 10px 32px rgba(11,12,26,.11)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-5px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow=isCur?"0 0 0 3px rgba(16,185,129,.1)":""; (e.currentTarget as HTMLDivElement).style.transform=""; }}>
      {isCur && <div style={{ position:"absolute", top:0, right:0, padding:"4px 11px", fontSize:9.5, fontWeight:900, color:"#fff", fontFamily:"Sora,sans-serif", background:"#10B981", borderRadius:"0 14px 0 14px" }}>CURRENT</div>}
      {!isCur && p.popular && <div style={{ position:"absolute", top:0, right:0, padding:"4px 11px", fontSize:9.5, fontWeight:900, color:"#fff", fontFamily:"Sora,sans-serif", background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", borderRadius:"0 14px 0 14px" }}>POPULAR</div>}
      <div style={{ height:3, background:p.grad }} />
      <div style={{ padding:"17px 17px 13px", flex:1 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:10 }}>{p.name}</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:4 }}>
          <div style={{ fontSize:27, fontWeight:900, fontFamily:"Sora,sans-serif", letterSpacing:-1, color:p.color, transition:"all .25s" }}>${price}</div>
          <div style={{ fontSize:11.5, color:"#8486AB", fontWeight:600 }}>&nbsp;/mo</div>
          {origP && <div style={{ fontSize:11.5, color:"#BFC1D9", textDecoration:"line-through", marginLeft:5 }}>${origP}</div>}
        </div>
        <div style={{ fontSize:10, color:"#059669", fontWeight:700, marginBottom:10, fontFamily:"JetBrains Mono,monospace", minHeight:15 }}>
          {cycle === "yearly" ? "billed annually · save 20%" : ""}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {p.features.map(f => (
            <div key={f.txt} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:f.yes?"#3D3F60":"#BFC1D9" }}>
              <i className={`fa-solid ${f.yes?(f.icon||"fa-check"):"fa-xmark"}`} style={{ fontSize:10, color:f.yes?"#10B981":"#BFC1D9" }} />{f.txt}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"0 17px 16px" }}>
        <button onClick={btnClick} disabled={isCur} style={{ width:"100%", padding:"9px 13px", borderRadius:9, fontSize:12, fontWeight:700, cursor:isCur?"default":"pointer", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .17s", ...btnStyle }}>
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

// ── Confirm Switch Modal ───────────────────────────────────────────────────
function ConfirmSwitchModal({ planId, isUp, currentPlan, cycle, onConfirm, onClose }: {
  planId: string; isUp: boolean; currentPlan: string; cycle: CycleType;
  onConfirm: () => void; onClose: () => void;
}) {
  const p   = PLANS.find(x => x.id === planId)!;
  const cur = PLANS.find(x => x.id === currentPlan)!;
  const price   = cycle === "yearly" ? p.yearly : p.monthly;
  const curP    = cycle === "yearly" ? cur.yearly : cur.monthly;
  return (
    <>
      <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:isUp?"#EEEEFF":"#FFFBEB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className={`fa-solid fa-${isUp?"bolt":"arrow-down"}`} style={{ color:isUp?"#5B5BD6":"#F59E0B" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{isUp?"Upgrade to":"Downgrade to"} {p.name}</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>{isUp?"New features activate immediately":"Change takes effect at next billing cycle"}</div>
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div style={{ padding:14, borderRadius:10, background:"#F0F1F9", border:"1px solid #ECEDF8" }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:5, fontFamily:"Sora,sans-serif" }}>Current Plan</div>
            <div style={{ fontSize:15, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{cur.name}</div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:"Sora,sans-serif", color:"#8486AB", marginTop:3 }}>${curP}/mo</div>
          </div>
          <div style={{ padding:14, borderRadius:10, border:`1.5px solid ${isUp?"#DDDDFB":"rgba(245,158,11,.2)"}`, background:isUp?"#EEEEFF":"#FFFBEB" }}>
            <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:isUp?"#5B5BD6":"#D97706", marginBottom:5, fontFamily:"Sora,sans-serif" }}>New Plan</div>
            <div style={{ fontSize:15, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{p.name}</div>
            <div style={{ fontSize:20, fontWeight:900, fontFamily:"Sora,sans-serif", color:isUp?"#5B5BD6":"#F59E0B", marginTop:3 }}>${price}/mo</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"11px 13px", borderRadius:9, background:isUp?"#ECFDF5":"#FFFBEB", border:`1px solid ${isUp?"rgba(16,185,129,.15)":"rgba(245,158,11,.18)"}` }}>
          <i className={`fa-solid fa-${isUp?"circle-check":"triangle-exclamation"}`} style={{ color:isUp?"#10B981":"#F59E0B", fontSize:14, flexShrink:0, marginTop:1 }} />
          <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }}>
            {isUp
              ? <span>You will be charged <strong>${price}</strong> today. {p.name} features activate immediately.</span>
              : <span>Downgrade takes effect on <strong>April 8, 2026</strong>. You keep {cur.name} features until then.</span>}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"15px 24px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:isUp?"linear-gradient(135deg,#5B5BD6,#7C3AED)":"#F59E0B", color:"#fff", border:"none" }}>
          <i className={`fa-solid fa-${isUp?"bolt":"check"}`} style={{ marginRight:6 }} /> Confirm {isUp?"Upgrade":"Downgrade"}
        </button>
      </div>
    </>
  );
}

// ── Upgrade Modal ──────────────────────────────────────────────────────────
function UpgradeModal({ currentPlan, onProceed, onClose }: { currentPlan: string; onProceed: (id: string, isUp: boolean) => void; onClose: () => void }) {
  const [upgCycle, setUpgCycle] = useState<CycleType>("monthly");
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#EEEEFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-bolt" style={{ color:"#5B5BD6" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Choose Your Plan</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>Upgrade or switch — changes take effect immediately</div>
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ display:"flex", gap:3, padding:3, borderRadius:8, background:"#F0F1F9", border:"1px solid #E2E4F0", marginBottom:14, width:"fit-content" }}>
          {(["monthly","yearly"] as CycleType[]).map(c => (
            <div key={c} onClick={() => setUpgCycle(c)} style={{ padding:"4px 13px", borderRadius:6, fontSize:11.5, fontWeight:700, cursor:"pointer", color:upgCycle===c?"#0B0C1A":"#8486AB", background:upgCycle===c?"#fff":undefined, boxShadow:upgCycle===c?"0 1px 3px rgba(11,12,26,.06)":undefined, fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:5 }}>
              {c.charAt(0).toUpperCase()+c.slice(1)}
              {c==="yearly" && <span style={{ padding:"2px 7px", borderRadius:5, background:"#ECFDF5", color:"#059669", fontSize:9.5, fontWeight:800, fontFamily:"JetBrains Mono,monospace" }}>–20%</span>}
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {PLANS.map(p => {
            const price = upgCycle==="yearly"?p.yearly:p.monthly;
            const isCur = p.id===currentPlan;
            const isSel = selected===p.id;
            return (
              <div key={p.id} onClick={() => !isCur && setSelected(p.id)} style={{ border:`1.5px solid ${isSel?"#5B5BD6":isCur?"#10B981":"#E2E4F0"}`, borderRadius:11, padding:14, cursor:isCur?"default":"pointer", background:isSel?"#EEEEFF":"#F0F1F9", position:"relative", boxShadow:isSel?"0 0 0 2px rgba(91,91,214,.12)":undefined, transition:"all .16s" }}>
                <div style={{ position:"absolute", top:11, right:11, width:19, height:19, borderRadius:"50%", border:`2px solid ${isSel?"#5B5BD6":"#E2E4F0"}`, display:"flex", alignItems:"center", justifyContent:"center", background:isSel?"#5B5BD6":"transparent" }}>
                  {isSel && <i className="fa-solid fa-check" style={{ fontSize:9, color:"#fff" }} />}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:p.grad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <i className="fa-solid fa-bolt" style={{ color:"#fff", fontSize:11 }} />
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{p.name}</div>
                  {isCur && <span style={{ padding:"2px 7px", borderRadius:4, background:"#ECFDF5", color:"#059669", fontSize:9, fontWeight:800 }}>Current</span>}
                </div>
                <div style={{ fontSize:19, fontWeight:900, fontFamily:"Sora,sans-serif", color:p.color }}>${price}<span style={{ fontSize:11, color:"#8486AB", fontWeight:600 }}>/mo</span></div>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"11px 13px", borderRadius:9, background:"#EEEEFF", border:"1px solid #DDDDFB" }}>
          <i className="fa-solid fa-shield-halved" style={{ color:"#5B5BD6", fontSize:14, flexShrink:0, marginTop:1 }} />
          <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }}>Secured by Stripe · Cancel anytime · Instant access · No hidden fees</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"15px 24px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button disabled={!selected} onClick={() => { if (selected) onProceed(selected, ORDER.indexOf(selected)>=ORDER.indexOf(currentPlan)); }} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:selected?"pointer":"default", fontFamily:"Sora,sans-serif", background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", color:"#fff", border:"none", opacity:selected?1:.45 }}>
          <i className="fa-solid fa-bolt" style={{ marginRight:6 }} /> Continue to Checkout
        </button>
      </div>
    </>
  );
}

// ── Cycle Modal ────────────────────────────────────────────────────────────
function CycleModal({ currentPlan, globalCycle, onApply, onClose }: { currentPlan: string; globalCycle: CycleType; onApply: (c: CycleType) => void; onClose: () => void }) {
  const [pending, setPending] = useState<CycleType>(globalCycle);
  const p = PLANS.find(x => x.id===currentPlan)!;
  return (
    <>
      <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#FFFBEB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-rotate" style={{ color:"#F59E0B" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Change Billing Cycle</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>Switch between monthly and annual billing</div>
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {(["monthly","yearly"] as CycleType[]).map(c => (
            <div key={c} onClick={() => setPending(c)} style={{ padding:"16px 12px", borderRadius:11, border:`2px solid ${pending===c?"#5B5BD6":"#E2E4F0"}`, background:pending===c?"#EEEEFF":"#F0F1F9", cursor:"pointer", textAlign:"center", position:"relative", boxShadow:pending===c?"0 0 0 2px rgba(91,91,214,.1)":undefined, transition:"all .16s" }}>
              {c==="yearly" && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", padding:"3px 9px", borderRadius:20, background:"#10B981", color:"#fff", fontSize:9.5, fontWeight:800, whiteSpace:"nowrap", fontFamily:"Sora,sans-serif" }}>SAVE ${(p.monthly-p.yearly)*12}/yr</div>}
              <span style={{ fontSize:22, display:"block", marginBottom:7 }}>{c==="monthly"?"📅":"🗓️"}</span>
              <div style={{ fontSize:13, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{c.charAt(0).toUpperCase()+c.slice(1)}</div>
              <div style={{ fontSize:20, fontWeight:900, fontFamily:"Sora,sans-serif", color:"#5B5BD6", marginTop:3 }}>${c==="yearly"?p.yearly:p.monthly}</div>
              <div style={{ fontSize:10.5, color:"#8486AB", marginTop:2 }}>per month</div>
              {c==="yearly" && <span style={{ display:"inline-block", marginTop:5, padding:"2px 7px", borderRadius:5, background:"#ECFDF5", color:"#059669", fontSize:9.5, fontWeight:800, fontFamily:"JetBrains Mono,monospace" }}>–20%</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"15px 24px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={() => onApply(pending)} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", color:"#fff", border:"none" }}>
          <i className="fa-solid fa-check" style={{ marginRight:6 }} /> Apply Change
        </button>
      </div>
    </>
  );
}

// ── Add Card Modal ─────────────────────────────────────────────────────────
function AddCardModal({ onClose, showToast }: { onClose: () => void; showToast: (m: string, t?: string) => void }) {
  return (
    <>
      <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-credit-card" style={{ color:"#10B981" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Add Payment Method</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>Secured by Stripe · We never store card numbers</div>
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ borderRadius:13, padding:18, background:"linear-gradient(135deg,#0F1117,#1E1F2E 60%,#2D2F50)", color:"#fff", marginBottom:18, position:"relative", overflow:"hidden" }}>
          <div style={{ width:34, height:24, borderRadius:5, background:"linear-gradient(135deg,#F0C040,#C9960A)", marginBottom:14 }} />
          <div style={{ fontSize:16, fontWeight:600, letterSpacing:3, fontFamily:"JetBrains Mono,monospace", marginBottom:14, opacity:.9 }}>•••• •••• •••• ••••</div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, opacity:.55, fontFamily:"JetBrains Mono,monospace" }}>
            <span>CARDHOLDER NAME</span><span>MM / YY</span>
          </div>
        </div>
        {[
          { label:"Card Number", placeholder:"1234  5678  9012  3456", type:"text", maxLength:19 },
          { label:"Cardholder Name", placeholder:"Jordan Davis", type:"text" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom:14 }}>
            <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:6, display:"block", fontFamily:"Sora,sans-serif" }}>{f.label}</div>
            <input placeholder={f.placeholder} type={f.type} maxLength={f.maxLength} style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:"1.5px solid #E2E4F0", background:"#F0F1F9", color:"#0B0C1A", fontSize:13.5, outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif" }} />
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:6, fontFamily:"Sora,sans-serif" }}>Expiry Date</div>
            <input placeholder="MM / YY" maxLength={7} style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:"1.5px solid #E2E4F0", background:"#F0F1F9", color:"#0B0C1A", fontSize:13.5, outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif" }} />
          </div>
          <div>
            <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:6, fontFamily:"Sora,sans-serif" }}>CVV</div>
            <input placeholder="•••" type="password" maxLength={4} style={{ width:"100%", padding:"10px 13px", borderRadius:8, border:"1.5px solid #E2E4F0", background:"#F0F1F9", color:"#0B0C1A", fontSize:13.5, outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif" }} />
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"11px 13px", borderRadius:9, background:"#ECFDF5", border:"1px solid rgba(16,185,129,.15)" }}>
          <i className="fa-solid fa-lock" style={{ color:"#10B981", fontSize:14, flexShrink:0, marginTop:1 }} />
          <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }}>256-bit encrypted · PCI DSS Level 1 · Powered by Stripe Vault — we never store raw card numbers.</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"15px 24px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={() => { onClose(); showToast("Card added successfully!","green"); }} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", color:"#fff", border:"none" }}>
          <i className="fa-solid fa-plus" style={{ marginRight:6 }} /> Add Card
        </button>
      </div>
    </>
  );
}

// ── Cancel Modal ───────────────────────────────────────────────────────────
function CancelModal({ onClose, showToast }: { onClose: () => void; showToast: (m: string, t?: string) => void }) {
  const items = [
    { ok:true,  txt:"Access continues until April 8, 2026" },
    { ok:true,  txt:"Your content and settings are preserved" },
    { ok:true,  txt:"Reactivate anytime with one click" },
    { ok:false, txt:"AI auto-posting stops on April 8" },
    { ok:false, txt:"Scheduled posts will be paused" },
  ];
  return (
    <>
      <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-circle-xmark" style={{ color:"#EF4444" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Cancel Subscription?</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>We hate to see you go — here is what happens</div>
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
          {items.map(r => (
            <div key={r.txt} style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:8, background:r.ok?"#F0F1F9":"#FEF2F2", border:`1px solid ${r.ok?"#ECEDF8":"rgba(239,68,68,.15)"}`, fontSize:12.5, color:"#3D3F60" }}>
              <i className={`fa-solid fa-${r.ok?"check":"xmark"}`} style={{ color:r.ok?"#10B981":"#EF4444", flexShrink:0, fontSize:11 }} />{r.txt}
            </div>
          ))}
        </div>
        <div style={{ padding:14, borderRadius:11, background:"#EEEEFF", border:"1px solid #DDDDFB", textAlign:"center" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0B0C1A", marginBottom:4 }}>Want to pause instead?</div>
          <div style={{ fontSize:12, color:"#8486AB", marginBottom:10 }}>Pause for up to 3 months — keep all your data safe.</div>
          <button onClick={() => { onClose(); showToast("Subscription paused for 1 month.","amber"); }} style={{ padding:"8px 20px", borderRadius:8, background:"#5B5BD6", color:"#fff", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:"none", boxShadow:"0 4px 20px rgba(91,91,214,.32)" }}>
            ⏸️ Pause for 1 Month
          </button>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"15px 24px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Keep My Plan</button>
        <button onClick={() => { onClose(); showToast("Subscription cancelled. Access until April 8.","red"); }} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#EF4444", color:"#fff", border:"none" }}>
          <i className="fa-solid fa-circle-xmark" style={{ marginRight:6 }} /> Cancel Subscription
        </button>
      </div>
    </>
  );
}

// ── Delete Card Modal ──────────────────────────────────────────────────────
function DeleteCardModal({ cardName, onClose, showToast }: { cardName: string; onClose: () => void; showToast: (m: string, t?: string) => void }) {
  return (
    <>
      <div style={{ padding:"20px 24px 18px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-trash" style={{ color:"#EF4444" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Remove Card?</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>This cannot be undone</div>
        </div>
      </div>
      <div style={{ padding:"20px 24px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"11px 13px", borderRadius:9, background:"#FEF2F2", border:"1px solid rgba(239,68,68,.18)" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color:"#EF4444", fontSize:14, flexShrink:0, marginTop:1 }} />
          <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }}>Removing <strong>{cardName}</strong> will cancel any scheduled payments using this card. Please ensure you have another active payment method.</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"15px 24px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={() => { onClose(); showToast("Card removed.","red"); }} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#EF4444", color:"#fff", border:"none" }}>
          <i className="fa-solid fa-trash" style={{ marginRight:6 }} /> Remove Card
        </button>
      </div>
    </>
  );
}

// ── Success Overlay ────────────────────────────────────────────────────────
function SuccessOverlay({ name }: { name: string }) {
  return (
    <div style={{ position:"absolute", inset:0, background:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:24, animation:"fadeIn .3s ease", borderRadius:20, textAlign:"center", zIndex:10 }}>
      <div style={{ width:76, height:76, borderRadius:"50%", background:"#ECFDF5", border:"3px solid #10B981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:"#10B981", animation:"successBounce .5s cubic-bezier(.34,1.56,.64,1)" }}>
        <i className="fa-solid fa-check" />
      </div>
      <div style={{ fontSize:18, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Plan Updated!</div>
      <div style={{ fontSize:13, color:"#8486AB", lineHeight:1.55 }}>Welcome to <strong>{name}</strong>. Your new features are live.</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { sidebarSlim, setSidebarSlim } = useSidebarState();
  const [currentPlan, setCurrentPlan] = useState("business");
  const [globalCycle, setGlobalCycle] = useState<CycleType>("monthly");
  const [planCycle, setPlanCycle] = useState<CycleType>("monthly");
  const [addons, setAddons] = useState<Addon[]>(INIT_ADDONS);
  const [history, setHistory] = useState<HistoryRow[]>(HISTORY_ROWS);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [defaultCard, setDefaultCard] = useState<"visa" | "mc">("visa");
  const [modal, setModal] = useState<{ type: ModalType; planId?: string; isUp?: boolean; cardName?: string }>({ type: null });
  const [showSuccess, setShowSuccess] = useState(false);
  const { toasts, show: showToast, remove: removeToast } = useToasts();

  const p = PLANS.find(x => x.id === currentPlan)!;
  const price = globalCycle === "yearly" ? p.yearly : p.monthly;
  const period = globalCycle === "yearly" ? "/ mo (annual)" : "/ month";
  const cycleLabel = globalCycle === "yearly" ? "Annual billing · 20% off" : "Monthly billing";

  const closeModal = () => { setModal({ type: null }); setShowSuccess(false); };

  const applyPlanChange = (planId: string) => {
    setShowSuccess(true);
    setCurrentPlan(planId);
    setTimeout(() => { closeModal(); showToast(`Plan changed to ${PLANS.find(x=>x.id===planId)?.name}!`, "green"); }, 1800);
  };

  const toastColors: Record<string, string> = { default:"#0F1117", green:"#059669", red:"#EF4444", brand:"#5B5BD6", amber:"#D97706" };
  const toastIcons: Record<string, string> = { default:"🔔", green:"✅", red:"🗑️", brand:"✦", amber:"⚠️" };

  const s = (val: React.CSSProperties): React.CSSProperties => val;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px; background: #F4F5FB; color: #0B0C1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)} }
        @keyframes toastSlide { from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.45} }
        @keyframes gradientMove { 0%{background-position:0%}50%{background-position:100%}100%{background-position:0%} }
        @keyframes cardReveal { from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes successBounce { 0%{transform:scale(.7);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1} }
        @keyframes barGrow { from{width:0}to{width:var(--bar-w)} }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
        .tb-btn-hover:hover { border-color: #5B5BD6 !important; color: #5B5BD6 !important; background: #EEEEFF !important; }
        .qa-item:hover { border-color: #5B5BD6; background: #EEEEFF; }
        .qa-item.danger:hover { border-color: #EF4444 !important; background: #FEF2F2 !important; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        {/* ── Sidebar ── */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim(s => !s)} activePath="/settings/billing" />

        {/* ── Main ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>

          {/* Topbar */}
          <AdminHeader
            pageTitle="Subscription & Billing"
            slim={sidebarSlim}
            onToggle={() => setSidebarSlim(s => !s)}
            searchPlaceholder="Search billing…"
            actionButton={
              <button onClick={() => setModal({ type:"upgrade" })} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:7, background:"#5B5BD6", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", border:"none", fontFamily:"Sora,sans-serif", boxShadow:"0 4px 20px rgba(91,91,214,.28)" }}>
                <i className="fa-solid fa-bolt" style={{ fontSize:11 }} /> Upgrade Plan
              </button>
            }
          />

          {/* Content */}
          <div style={{ flex:1, overflowY:"auto" }}>

            {/* Page Hero */}
            <div style={{ background:"#fff", borderBottom:"1px solid #E2E4F0", padding:"26px 28px 24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-100, right:-60, width:360, height:360, background:"radial-gradient(circle,rgba(91,91,214,.07) 0%,transparent 70%)", pointerEvents:"none" }} />
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
                <div>
                  <div style={{ width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#fff", marginBottom:12, boxShadow:"0 4px 20px rgba(91,91,214,.32)" }}>
                    <i className="fa-solid fa-credit-card" />
                  </div>
                  <div style={{ fontSize:22, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif", letterSpacing:"-.5px", marginBottom:4 }}>Subscription &amp; Billing</div>
                  <div style={{ fontSize:13, color:"#8486AB", lineHeight:1.55, maxWidth:520 }}>Control your Shoutly AI subscription, manage billing, and upgrade your automation power anytime.</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10, flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:3, padding:4, borderRadius:11, background:"#F0F1F9", border:"1px solid #E2E4F0", boxShadow:"0 1px 3px rgba(11,12,26,.06)" }}>
                    {(["monthly","yearly"] as CycleType[]).map(c => (
                      <div key={c} onClick={() => { setGlobalCycle(c); showToast(c==="yearly"?"🎉 Annual plan — you save 20%!":c+` billing`, "brand"); }} style={{ padding:"6px 16px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", color:globalCycle===c?"#0B0C1A":"#8486AB", background:globalCycle===c?"#fff":undefined, boxShadow:globalCycle===c?"0 1px 3px rgba(11,12,26,.06)":undefined, fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:5, transition:"all .16s" }}>
                        {c.charAt(0).toUpperCase()+c.slice(1)}
                        {c==="yearly" && <span style={{ padding:"2px 7px", borderRadius:5, background:"#ECFDF5", color:"#059669", fontSize:9.5, fontWeight:800, fontFamily:"JetBrains Mono,monospace" }}>–20%</span>}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {[{dot:"#10B981",val:"$"+price,lbl:"Current plan"},{dot:"#F59E0B",val:"31 days",lbl:"Until renewal"},{dot:"#5B5BD6",val:"$591",lbl:"YTD spend"}].map(hs => (
                      <div key={hs.lbl} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:9, background:"#F0F1F9", border:"1px solid #ECEDF8" }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:hs.dot, flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:15, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{hs.val}</div>
                          <div style={{ fontSize:11, color:"#8486AB", fontWeight:600, marginTop:1 }}>{hs.lbl}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:22, padding:"24px 28px 36px", alignItems:"start" }}>

              {/* ── Main Column ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Current Plan Hero */}
                <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #DDDDFB", boxShadow:"0 4px 16px rgba(11,12,26,.08)", overflow:"hidden", position:"relative", animation:"cardReveal .3s ease both" }}>
                  <div style={{ height:4, background:"linear-gradient(90deg,#5B5BD6,#7C3AED,#818CF8,#EC4899,#5B5BD6)", backgroundSize:"300%", animation:"gradientMove 5s ease infinite" }} />
                  <div style={{ padding:"24px 26px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:22 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20, background:"#ECFDF5", border:"1px solid rgba(16,185,129,.2)", fontSize:11, fontWeight:800, color:"#059669", fontFamily:"Sora,sans-serif", marginBottom:10 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", animation:"pulse 2s infinite" }} />
                          Active Subscription
                        </div>
                        <div style={{ fontSize:26, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif", letterSpacing:"-.6px", marginBottom:6 }}>{p.name} Plan</div>
                        <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:10 }}>
                          <div style={{ fontSize:44, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif", letterSpacing:-2, lineHeight:1, transition:"all .3s" }}>${price}</div>
                          <div style={{ fontSize:15, color:"#8486AB", fontWeight:600, marginBottom:4 }}>&nbsp;{period}</div>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:7, fontSize:11, fontWeight:700, background:"#FFFBEB", border:"1px solid rgba(245,158,11,.2)", color:"#D97706" }}>
                            <i className="fa-solid fa-rotate" style={{ fontSize:9 }} />{cycleLabel}
                          </div>
                          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:7, fontSize:11, fontWeight:700, background:"#EEEEFF", border:"1px solid #DDDDFB", color:"#5B5BD6" }}>
                            <i className="fa-solid fa-calendar-check" style={{ fontSize:9 }} />Renews Apr 8, 2026
                          </div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:10, fontFamily:"Sora,sans-serif" }}>Included Features</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                          {p.features.filter(f=>f.yes).slice(0,5).map(f => (
                            <div key={f.txt} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12.5, color:"#3D3F60" }}>
                              <i className="fa-solid fa-circle-check" style={{ fontSize:11, color:"#10B981" }} />{f.txt}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ height:1, background:"#ECEDF8", margin:"18px 0" }} />
                    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:12, fontFamily:"Sora,sans-serif" }}>This Month's Usage</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                      {[
                        { lbl:"Posts",      val:"192 / ∞",     w:"65%", bg:"linear-gradient(90deg,#5B5BD6,#818CF8)" },
                        { lbl:"Reels",      val:"11 / ∞",      w:"38%", bg:"linear-gradient(90deg,#EC4899,#F97316)" },
                        { lbl:"Brands",     val:"2 / 3",       w:"67%", bg:"linear-gradient(90deg,#10B981,#34D399)" },
                        { lbl:"AI Credits", val:"220 / 1000",  w:"22%", bg:"linear-gradient(90deg,#F59E0B,#FCD34D)" },
                      ].map(u => (
                        <div key={u.lbl} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <div style={{ fontSize:12, fontWeight:600, color:"#3D3F60" }}>{u.lbl}</div>
                            <div style={{ fontSize:11.5, fontWeight:700, color:"#0B0C1A", fontFamily:"JetBrains Mono,monospace" }}>{u.val}</div>
                          </div>
                          <div style={{ height:5, background:"#E2E4F0", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ height:"100%", borderRadius:3, background:u.bg, width:u.w, animation:"barGrow .8s cubic-bezier(.34,1.56,.64,1) .4s both" } as React.CSSProperties} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:10, background:"#EEEEFF", border:"1px solid #DDDDFB", marginBottom:18 }}>
                      <i className="fa-solid fa-calendar-check" style={{ color:"#5B5BD6", fontSize:14, flexShrink:0 }} />
                      <div style={{ fontSize:12.5, color:"#3D3F60", flex:1, lineHeight:1.4 }}>Plan auto-renews on <strong>April 8, 2026</strong> · Visa **** 4242 will be charged</div>
                      <div style={{ padding:"3px 10px", borderRadius:20, background:"#5B5BD6", color:"#fff", fontSize:10.5, fontWeight:800, fontFamily:"JetBrains Mono,monospace", flexShrink:0 }}>31d left</div>
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <button onClick={() => setModal({ type:"upgrade" })} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 18px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:"none", background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", color:"#fff", boxShadow:"0 4px 20px rgba(91,91,214,.32)" }}>
                        <i className="fa-solid fa-bolt" style={{ fontSize:12 }} /> Upgrade Plan
                      </button>
                      <button onClick={() => setModal({ type:"cycle" })} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#F0F1F9", border:"1.5px solid #E2E4F0", color:"#3D3F60", transition:"all .17s" }}>
                        <i className="fa-solid fa-rotate" style={{ fontSize:11 }} /> Change Cycle
                      </button>
                      <button onClick={() => setModal({ type:"cancel" })} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#F0F1F9", border:"1.5px solid #E2E4F0", color:"#8486AB", transition:"all .17s" }}>
                        <i className="fa-solid fa-xmark" style={{ fontSize:11 }} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Plan Options */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .09s both" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"17px 22px", borderBottom:"1px solid #ECEDF8" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                      <i className="fa-solid fa-layer-group" style={{ fontSize:13, color:"#5B5BD6" }} /> Choose a Plan
                    </div>
                    <div style={{ display:"flex", gap:3, padding:3, borderRadius:8, background:"#F0F1F9", border:"1px solid #E2E4F0" }}>
                      {(["monthly","yearly"] as CycleType[]).map(c => (
                        <div key={c} onClick={() => setPlanCycle(c)} style={{ padding:"4px 13px", borderRadius:6, fontSize:11.5, fontWeight:700, cursor:"pointer", color:planCycle===c?"#0B0C1A":"#8486AB", background:planCycle===c?"#fff":undefined, boxShadow:planCycle===c?"0 1px 3px rgba(11,12,26,.06)":undefined, fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                          {c.charAt(0).toUpperCase()+c.slice(1)}
                          {c==="yearly" && <span style={{ padding:"2px 7px", borderRadius:5, background:"#ECFDF5", color:"#059669", fontSize:9.5, fontWeight:800, fontFamily:"JetBrains Mono,monospace" }}>–20%</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding:"20px 22px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                      {PLANS.map(plan => (
                        <PlanCard key={plan.id} p={plan} currentPlan={currentPlan} cycle={planCycle} onSwitch={(id, isUp) => setModal({ type:"confirmSwitch", planId:id, isUp })} />
                      ))}
                    </div>
                    <div style={{ textAlign:"center", padding:"16px 0 8px", borderTop:"1px solid #ECEDF8", marginTop:12 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:".5px", marginBottom:8 }}>All plans include all 7 platforms</div>
                      <div style={{ display:"flex", justifyContent:"center", gap:10, fontSize:18 }}>
                        {[["fa-instagram","#E1306C"],["fa-facebook","#1877F2"],["fa-linkedin","#0A66C2"],["fa-x-twitter","#000"],["fa-threads","#000"],["fa-tiktok","#111"],["fa-youtube","#FF0000"]].map(([ic,col]) => (
                          <i key={ic} className={`fa-brands ${ic}`} style={{ color:col }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .14s both" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"17px 22px", borderBottom:"1px solid #ECEDF8" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                      <i className="fa-solid fa-wallet" style={{ fontSize:13, color:"#5B5BD6" }} /> Payment Methods
                    </div>
                    <button onClick={() => setModal({ type:"addCard" })} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#5B5BD6", color:"#fff", border:"none", boxShadow:"0 4px 20px rgba(91,91,214,.32)" }}>
                      <i className="fa-solid fa-plus" style={{ fontSize:11 }} /> Add Card
                    </button>
                  </div>
                  <div style={{ padding:"20px 22px" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:12 }}>
                      {/* Visa */}
                      <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 15px", borderRadius:11, background:"#F0F1F9", border:`1.5px solid ${defaultCard==="visa"?"rgba(91,91,214,.3)":"#ECEDF8"}`, transition:"all .15s", cursor:"pointer", position:"relative", overflow:"hidden" }}>
                        {defaultCard==="visa" && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"#5B5BD6", borderRadius:"11px 0 0 11px" }} />}
                        <div style={{ width:50, height:34, borderRadius:7, background:"#fff", border:"1px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 1px 3px rgba(11,12,26,.06)", overflow:"hidden" }}>
                          <svg viewBox="0 0 60 38" width="44" fill="none"><rect width="60" height="38" rx="5" fill="#1A1F71"/><text x="8" y="27" fontFamily="serif" fontSize="17" fontWeight="900" fill="#F7F7F7">VISA</text></svg>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"#0B0C1A" }}>Visa <span style={{ color:"#8486AB", fontWeight:400 }}>ending in</span> 4242</div>
                          <div style={{ fontSize:11.5, color:"#8486AB", fontFamily:"JetBrains Mono,monospace", marginTop:1 }}>•••• •••• •••• 4242</div>
                          <div style={{ fontSize:11, color:"#BFC1D9", marginTop:1 }}>Expires 08 / 2027</div>
                        </div>
                        {defaultCard==="visa" && <div style={{ padding:"2px 8px", borderRadius:5, background:"#EEEEFF", color:"#5B5BD6", fontSize:10, fontWeight:800 }}>DEFAULT</div>}
                        <div style={{ display:"flex", gap:5 }}>
                          <div onClick={() => showToast("Opening card editor…","brand")} style={{ width:28, height:28, borderRadius:7, background:"#fff", border:"1px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", color:"#8486AB", fontSize:10, cursor:"pointer" }}>
                            <i className="fa-solid fa-pen" style={{ fontSize:9 }} />
                          </div>
                          <div onClick={() => setModal({ type:"deleteCard", cardName:"Visa **** 4242" })} style={{ width:28, height:28, borderRadius:7, background:"#fff", border:"1px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", color:"#8486AB", fontSize:10, cursor:"pointer" }}>
                            <i className="fa-solid fa-trash" style={{ fontSize:9 }} />
                          </div>
                        </div>
                      </div>
                      {/* Mastercard */}
                      <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 15px", borderRadius:11, background:"#F0F1F9", border:`1.5px solid ${defaultCard==="mc"?"rgba(91,91,214,.3)":"#ECEDF8"}`, transition:"all .15s", cursor:"pointer", position:"relative", overflow:"hidden" }}>
                        {defaultCard==="mc" && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"#5B5BD6", borderRadius:"11px 0 0 11px" }} />}
                        <div style={{ width:50, height:34, borderRadius:7, background:"#fff", border:"1px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                          <svg viewBox="0 0 60 38" width="44" fill="none"><rect width="60" height="38" rx="5" fill="#1C1C1C"/><circle cx="22" cy="19" r="12" fill="#EB001B"/><circle cx="38" cy="19" r="12" fill="#F79E1B"/><path d="M30 10.5a12 12 0 010 17A12 12 0 0130 10.5z" fill="#FF5F00"/></svg>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"#0B0C1A" }}>Mastercard <span style={{ color:"#8486AB", fontWeight:400 }}>ending in</span> 8834</div>
                          <div style={{ fontSize:11.5, color:"#8486AB", fontFamily:"JetBrains Mono,monospace", marginTop:1 }}>•••• •••• •••• 8834</div>
                          <div style={{ fontSize:11, color:"#BFC1D9", marginTop:1 }}>Expires 12 / 2026</div>
                        </div>
                        {defaultCard==="mc" && <div style={{ padding:"2px 8px", borderRadius:5, background:"#EEEEFF", color:"#5B5BD6", fontSize:10, fontWeight:800 }}>DEFAULT</div>}
                        <div style={{ display:"flex", gap:5 }}>
                          <div onClick={() => { setDefaultCard("mc"); showToast("Default payment method updated","green"); }} style={{ width:28, height:28, borderRadius:7, background:"#fff", border:"1px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", color:"#8486AB", fontSize:10, cursor:"pointer" }}>
                            <i className="fa-solid fa-star" style={{ fontSize:9 }} />
                          </div>
                          <div onClick={() => setModal({ type:"deleteCard", cardName:"Mastercard **** 8834" })} style={{ width:28, height:28, borderRadius:7, background:"#fff", border:"1px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", color:"#8486AB", fontSize:10, cursor:"pointer" }}>
                            <i className="fa-solid fa-trash" style={{ fontSize:9 }} />
                          </div>
                        </div>
                      </div>
                      <div onClick={() => setModal({ type:"addCard" })} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:12, borderRadius:11, border:"1.5px dashed #E2E4F0", background:"#fff", color:"#8486AB", fontSize:12.5, fontWeight:700, cursor:"pointer", transition:"all .16s", fontFamily:"Sora,sans-serif" }}>
                        <i className="fa-solid fa-plus" style={{ fontSize:11 }} /> Add New Payment Method
                      </div>
                    </div>
                    <div style={{ padding:"14px 16px", borderRadius:11, background:"#F0F1F9", border:"1px solid #ECEDF8", marginTop:10 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:6, fontFamily:"Sora,sans-serif" }}>Billing Address</div>
                          <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.65 }}>Jordan Davis<br/>42 Brand Street, Suite 800<br/>San Francisco, CA 94102<br/>United States</div>
                        </div>
                        <div onClick={() => showToast("Opening address editor…","brand")} style={{ fontSize:11.5, color:"#5B5BD6", fontWeight:700, cursor:"pointer", padding:"3px 8px", borderRadius:6, flexShrink:0 }}>Edit</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .19s both" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"17px 22px", borderBottom:"1px solid #ECEDF8" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                      <i className="fa-solid fa-clock-rotate-left" style={{ fontSize:13, color:"#5B5BD6" }} /> Billing History
                    </div>
                    <button onClick={() => showToast("Exporting all invoices as PDF…","brand")} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#F0F1F9", border:"1px solid #E2E4F0", color:"#3D3F60" }}>
                      <i className="fa-solid fa-file-arrow-down" style={{ fontSize:11 }} /> Export All
                    </button>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr>
                          {["Date","Plan","Description","Amount","Status","Invoice"].map(h => (
                            <th key={h} style={{ padding:"10px 14px", fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:".6px", color:"#8486AB", textAlign:"left", borderBottom:"2px solid #E2E4F0", fontFamily:"Sora,sans-serif", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((r, i) => (
                          <tr key={i} style={{ transition:"background .12s" }} onMouseEnter={e => { Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(td => { (td as HTMLTableCellElement).style.background="#F0F1F9"; }); }} onMouseLeave={e => { Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(td => { (td as HTMLTableCellElement).style.background=""; }); }}>
                            <td style={{ padding:"12px 14px", fontSize:12.5, fontWeight:600, color:"#0B0C1A", whiteSpace:"nowrap", borderBottom:"1px solid #ECEDF8" }}>{r.date}</td>
                            <td style={{ padding:"12px 14px", borderBottom:"1px solid #ECEDF8" }}>
                              <span style={{ padding:"2px 9px", borderRadius:5, fontSize:11, fontWeight:700, background:"#EEEEFF", color:"#5B5BD6" }}>{r.plan}</span>
                            </td>
                            <td style={{ padding:"12px 14px", fontSize:12.5, color:"#8486AB", borderBottom:"1px solid #ECEDF8" }}>{r.desc}</td>
                            <td style={{ padding:"12px 14px", borderBottom:"1px solid #ECEDF8" }}>
                              <span style={{ fontWeight:800, color:"#0B0C1A", fontFamily:"JetBrains Mono,monospace" }}>{r.amt}</span>
                            </td>
                            <td style={{ padding:"12px 14px", borderBottom:"1px solid #ECEDF8" }}>
                              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:700, background:r.status==="paid"?"#ECFDF5":r.status==="pending"?"#FFFBEB":"#FEF2F2", color:r.status==="paid"?"#059669":r.status==="pending"?"#D97706":"#DC2626" }}>
                                <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor" }} />
                                {r.status.charAt(0).toUpperCase()+r.status.slice(1)}
                              </span>
                            </td>
                            <td style={{ padding:"12px 14px", borderBottom:"1px solid #ECEDF8" }}>
                              <button onClick={() => showToast("Downloading invoice…","brand")} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6, border:"1px solid #E2E4F0", background:"#F0F1F9", color:"#3D3F60", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", whiteSpace:"nowrap" }}>
                                <i className="fa-solid fa-file-arrow-down" style={{ fontSize:10 }} /> Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding:"12px 20px" }}>
                    <button onClick={() => { if (!historyLoaded) { setHistory([...history, ...HISTORY_EXTRA]); setHistoryLoaded(true); showToast("Earlier invoices loaded","brand"); } else { showToast("All invoices loaded","brand"); } }} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:11, borderRadius:9, border:"1px solid #E2E4F0", background:"#F0F1F9", color:"#3D3F60", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", width:"100%", transition:"all .14s" }}>
                      <i className="fa-solid fa-chevron-down" style={{ fontSize:11 }} /> Load Earlier Invoices
                    </button>
                  </div>
                </div>

                {/* Add-Ons */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .24s both" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"17px 22px", borderBottom:"1px solid #ECEDF8" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                      <i className="fa-solid fa-puzzle-piece" style={{ fontSize:13, color:"#5B5BD6" }} /> Add-Ons
                    </div>
                    <span style={{ fontSize:12, color:"#8486AB", fontWeight:500 }}>Extend your plan capabilities</span>
                  </div>
                  <div style={{ padding:"20px 22px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      {addons.map(a => (
                        <div key={a.id} style={{ border:`1.5px solid ${a.active?"#10B981":"#E2E4F0"}`, borderRadius:13, padding:17, background:a.active?"rgba(16,185,129,.03)":"#F0F1F9", transition:"all .2s", cursor:"pointer", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor=a.active?"#10B981":"rgba(91,91,214,.3)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 16px rgba(11,12,26,.08)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor=a.active?"#10B981":"#E2E4F0"; (e.currentTarget as HTMLDivElement).style.boxShadow=""; (e.currentTarget as HTMLDivElement).style.transform=""; }}>
                          <div style={{ position:"absolute", top:11, right:11, padding:"2px 7px", borderRadius:5, fontSize:9, fontWeight:900, fontFamily:"Sora,sans-serif", background:`${a.badgeClr}22`, color:a.badgeClr }}>{a.badge}</div>
                          <div style={{ width:40, height:40, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, color:"#fff", marginBottom:11, flexShrink:0, background:a.grad }}>
                            <i className={a.icon} />
                          </div>
                          <div style={{ fontSize:13, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:4 }}>{a.name}</div>
                          <div style={{ fontSize:11.5, color:"#8486AB", lineHeight:1.45, flex:1, marginBottom:12 }}>{a.desc}</div>
                          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:8 }}>
                            <div>
                              <div style={{ fontSize:17, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{a.price}</div>
                              <div style={{ fontSize:10.5, color:"#8486AB", fontWeight:600, marginTop:1 }}>{a.period}</div>
                            </div>
                            <button onClick={() => {
                              const updated = addons.map(x => x.id===a.id?{...x,active:!x.active}:x);
                              setAddons(updated);
                              showToast(!a.active?`${a.name} add-on activated!`:`${a.name} removed`, !a.active?"green":"brand");
                            }} style={{ padding:"6px 13px", borderRadius:7, fontSize:11.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:`1.5px solid ${a.active?"rgba(16,185,129,.3)":"#E2E4F0"}`, background:a.active?"#ECFDF5":"#fff", color:a.active?"#059669":"#3D3F60", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", flexShrink:0 }}>
                              {a.active ? <><i className="fa-solid fa-check" style={{ fontSize:9 }} /> Added</> : <><i className="fa-solid fa-plus" style={{ fontSize:9 }} /> Add</>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Side Column ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Next Billing */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .07s both" }}>
                  <div style={{ padding:"14px 17px", borderBottom:"1px solid #ECEDF8", display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:13.5, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                      <i className="fa-solid fa-calendar-days" style={{ fontSize:12, color:"#5B5BD6" }} /> Next Billing
                    </div>
                  </div>
                  <div style={{ padding:"15px 17px" }}>
                    <div style={{ padding:13, borderRadius:10, background:"linear-gradient(135deg,#EEEEFF,#DDDDFB)", border:"1px solid #DDDDFB", marginBottom:13 }}>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#5B5BD6", fontFamily:"Sora,sans-serif", marginBottom:3 }}>Next Charge</div>
                      <div style={{ fontSize:17, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>April 8, 2026</div>
                      <div style={{ fontSize:12.5, fontWeight:700, color:"#3D3F60", marginTop:2 }}>${price}.00 · {p.name} Plan</div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10.5, fontWeight:700, color:"#5B5BD6", marginTop:7, fontFamily:"JetBrains Mono,monospace" }}>
                        <i className="fa-solid fa-hourglass-half" style={{ fontSize:9 }} /> 31 days remaining
                      </div>
                    </div>
                    {[{l:"This month",v:`$${price}.00`},{l:"Last month",v:`$${price}.00`},{l:"YTD 2026",v:"$591.00"},{l:"Agency savings",v:"$4,803/mo",green:true}].map(r => (
                      <div key={r.l} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:r.green?undefined:"1px solid #ECEDF8" }}>
                        <div style={{ fontSize:12, color:r.green?"#10B981":"#8486AB", fontWeight:600 }}>{r.l}</div>
                        <div style={{ fontSize:12, fontWeight:800, color:r.green?"#10B981":"#0B0C1A", fontFamily:"JetBrains Mono,monospace" }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .12s both" }}>
                  <div style={{ padding:"14px 17px", borderBottom:"1px solid #ECEDF8" }}>
                    <div style={{ fontSize:13.5, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                      <i className="fa-solid fa-shield-halved" style={{ fontSize:12, color:"#5B5BD6" }} /> Security
                    </div>
                  </div>
                  <div style={{ padding:"15px 17px" }}>
                    {[
                      { icon:"fa-lock",         title:"256-bit SSL Encryption", sub:"All payment data encrypted in transit" },
                      { icon:"fa-shield-check",  title:"PCI DSS Level 1",       sub:"Highest card data security standard" },
                      { icon:"fa-eye-slash",     title:"Zero Card Storage",     sub:"Numbers tokenized via Stripe Vault" },
                    ].map(t => (
                      <div key={t.title} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:9, background:"#F0F1F9", border:"1px solid #ECEDF8", marginBottom:7 }}>
                        <i className={`fa-solid ${t.icon}`} style={{ fontSize:14, color:"#10B981", flexShrink:0, marginTop:1 }} />
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:"#3D3F60", lineHeight:1.3 }}>{t.title}</div>
                          <div style={{ fontSize:11, color:"#8486AB", fontWeight:400, marginTop:1 }}>{t.sub}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:9, background:"#F0F1F9", border:"1px solid #ECEDF8", marginTop:10 }}>
                      <i className="fa-brands fa-stripe" style={{ fontSize:20, color:"#635BFF" }} />
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#0B0C1A" }}>Powered by Stripe</div>
                        <div style={{ fontSize:11, color:"#8486AB", marginTop:1 }}>Trusted by 500K+ businesses globally</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(11,12,26,.06)", animation:"cardReveal .35s ease .17s both" }}>
                  <div style={{ padding:"14px 17px", borderBottom:"1px solid #ECEDF8" }}>
                    <div style={{ fontSize:13.5, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", display:"flex", alignItems:"center", gap:7 }}>
                      <i className="fa-solid fa-bolt" style={{ fontSize:12, color:"#5B5BD6" }} /> Quick Actions
                    </div>
                  </div>
                  <div style={{ padding:12 }}>
                    {[
                      { icon:"fa-bolt", col:"#5B5BD6", label:"Upgrade Plan", danger:false, action:() => setModal({ type:"upgrade" }) },
                      { icon:"fa-rotate", col:"#F59E0B", label:"Switch Billing Cycle", danger:false, action:() => setModal({ type:"cycle" }) },
                      { icon:"fa-credit-card", col:"#10B981", label:"Update Payment Method", danger:false, action:() => setModal({ type:"addCard" }) },
                      { icon:"fa-file-invoice", col:"#3B82F6", label:"Download Latest Invoice", danger:false, action:() => showToast("Latest invoice downloaded!","green") },
                      { icon:"fa-circle-xmark", col:"#EF4444", label:"Cancel Subscription", danger:true, action:() => setModal({ type:"cancel" }) },
                    ].map(qa => (
                      <div key={qa.label} onClick={qa.action} className={`qa-item${qa.danger?" danger":""}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:9, border:"1px solid #E2E4F0", background:"#F0F1F9", cursor:"pointer", transition:"all .13s", marginBottom:5 }}>
                        <i className={`fa-solid ${qa.icon}`} style={{ fontSize:13, width:16, textAlign:"center", flexShrink:0, color:qa.col }} />
                        <span style={{ fontSize:13, fontWeight:600, color:qa.danger?"#EF4444":"#0B0C1A", flex:1 }}>{qa.label}</span>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize:10, color:"#BFC1D9" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modal.type && (
        <div onClick={e => { if ((e.target as HTMLElement).id==="modal-bg") closeModal(); }} id="modal-bg"
          style={{ position:"fixed", inset:0, background:"rgba(11,12,26,.55)", backdropFilter:"blur(10px)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .18s ease" }}>
          <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:20, width:"100%", maxWidth:modal.type==="upgrade"?"640px":"500px", overflow:"hidden", boxShadow:"0 32px 80px rgba(11,12,26,.22)", animation:"scaleIn .22s cubic-bezier(.34,1.56,.64,1)", position:"relative" }}>
            {showSuccess && modal.planId && <SuccessOverlay name={PLANS.find(x=>x.id===modal.planId)?.name||""} />}
            {modal.type==="confirmSwitch" && modal.planId && (
              <ConfirmSwitchModal planId={modal.planId} isUp={!!modal.isUp} currentPlan={currentPlan} cycle={planCycle} onConfirm={() => applyPlanChange(modal.planId!)} onClose={closeModal} />
            )}
            {modal.type==="upgrade" && (
              <UpgradeModal currentPlan={currentPlan} onProceed={(id, isUp) => { closeModal(); setTimeout(() => setModal({ type:"confirmSwitch", planId:id, isUp }), 50); }} onClose={closeModal} />
            )}
            {modal.type==="cycle" && (
              <CycleModal currentPlan={currentPlan} globalCycle={globalCycle} onApply={c => { setGlobalCycle(c); closeModal(); showToast(c==="yearly"?"🎉 Annual plan — you save 20%!":"Switched to monthly billing","brand"); }} onClose={closeModal} />
            )}
            {modal.type==="addCard" && <AddCardModal onClose={closeModal} showToast={showToast} />}
            {modal.type==="cancel" && <CancelModal onClose={closeModal} showToast={showToast} />}
            {modal.type==="deleteCard" && modal.cardName && <DeleteCardModal cardName={modal.cardName} onClose={closeModal} showToast={showToast} />}
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:8, zIndex:900, pointerEvents:"none" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:toastColors[t.type]||"#0F1117", color:"#fff", fontSize:13, fontWeight:600, boxShadow:"0 32px 80px rgba(11,12,26,.22)", animation:"toastSlide .3s cubic-bezier(.34,1.56,.64,1)", pointerEvents:"all", maxWidth:340, border:"1px solid rgba(255,255,255,.08)" }}>
            <span style={{ fontSize:15, flexShrink:0 }}>{toastIcons[t.type]||"🔔"}</span>
            <span style={{ flex:1 }}>{t.msg}</span>
            <span onClick={() => removeToast(t.id)} style={{ opacity:.6, cursor:"pointer", padding:"2px 4px", marginLeft:"auto", flexShrink:0 }}>✕</span>
          </div>
        ))}
      </div>
    </>
  );
}