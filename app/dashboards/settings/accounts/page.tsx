"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "../../Sidebar";
import AdminHeader from "../../AdminHeader";
import { useSidebarState } from "@/hooks/useSidebarState";
import { getFacebookAuthUrl, getFacebookPages } from "@/api/facebookApi";

// ── Types ──────────────────────────────────────────────────────────────────
type PlatStatus = "connected" | "disconnected" | "error" | "syncing";
type FilterType = "all" | "connected" | "disconnected" | "attention";
type ModalType = "connect" | "disconnect" | "accMenu" | "picker" | "oauthLoading" | "success" | null;

interface Account {
  id: string;
  name: string;
  handle: string;
  ava: string;
  col: string;
  followers: string;
  lastSync: string;
  health: "active" | "syncing" | "error";
}

interface PlatStats { f: string; p: string; e: string }

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  grad: string;
  desc: string;
  perms: string[];
  accounts: Account[];
  status: PlatStatus;
  stats?: PlatStats;
  errorMsg?: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
const INIT_PLATS: Platform[] = [
  {
    id: "ig", name: "Instagram", icon: "fa-brands fa-instagram",
    color: "#E1306C", grad: "linear-gradient(135deg,#F77737,#E1306C,#C13584,#833AB4)",
    desc: "Share photos, Reels & Stories with 2B+ active users",
    perms: ["Publish photos & videos","Read post insights","Manage comments","Access follower data"],
    accounts: [], status: "disconnected",
  },
  {
    id: "fb", name: "Facebook", icon: "fa-brands fa-facebook",
    color: "#1877F2", grad: "linear-gradient(135deg,#1877F2,#0C52C5)",
    desc: "Reach billions via Pages, Groups & Reels",
    perms: ["Manage Facebook Pages","Publish posts & reels","Access Page analytics","Moderate comments"],
    accounts: [], status: "disconnected",
  },
  {
    id: "tw", name: "Twitter / X", icon: "fa-brands fa-x-twitter",
    color: "#1A1A1A", grad: "linear-gradient(135deg,#1A1A1A,#444)",
    desc: "Real-time conversations, threads & viral reach",
    perms: ["Post & schedule tweets","Read account timeline","Access engagement metrics","Manage replies"],
    accounts: [], status: "disconnected",
  },
  {
    id: "li", name: "LinkedIn", icon: "fa-brands fa-linkedin",
    color: "#0A66C2", grad: "linear-gradient(135deg,#0A66C2,#0853A0)",
    desc: "Professional network for B2B growth & thought leadership",
    perms: ["Share posts & articles","Manage Company Page","View follower analytics","Post on behalf of company"],
    accounts: [], status: "disconnected",
  },
  {
    id: "th", name: "Threads", icon: "fa-brands fa-threads",
    color: "#333333", grad: "linear-gradient(135deg,#111,#444)",
    desc: "Text-first social conversations powered by Meta",
    perms: ["Publish threads & replies","Read engagement data","Access follower count"],
    accounts: [], status: "disconnected",
  },
  {
    id: "yt", name: "YouTube", icon: "fa-brands fa-youtube",
    color: "#FF0000", grad: "linear-gradient(135deg,#FF0000,#CC0000)",
    desc: "World's largest video platform — 2B+ monthly users",
    perms: ["Upload & schedule videos","Manage channel","Post community updates","Read analytics"],
    accounts: [], status: "disconnected",
  },
  {
    id: "tk", name: "TikTok", icon: "fa-brands fa-tiktok",
    color: "#EE1D52", grad: "linear-gradient(135deg,#010101,#EE1D52,#69C9D0)",
    desc: "Short-form video — highest organic reach for Gen-Z",
    perms: ["Upload short videos","Read profile & followers","Access video analytics"],
    accounts: [], status: "disconnected",
  },
];

// ── Toast hook ─────────────────────────────────────────────────────────────
interface ToastItem { id: number; msg: string; type: string }
function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const show = (msg: string, type = "default") => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3800);
  };
  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));
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

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PlatStatus }) {
  const cfg: Record<PlatStatus, { cls: string; label: string; dotPulse?: boolean }> = {
    connected:    { cls:"#ECFDF5", label:"Connected", dotPulse:true },
    disconnected: { cls:"#F0F1F9", label:"Not Connected" },
    error:        { cls:"#FFFBEB", label:"Token Expired" },
    syncing:      { cls:"#EFF6FF", label:"Syncing" },
  };
  const colors: Record<PlatStatus, string> = { connected:"#059669", disconnected:"#8486AB", error:"#F59E0B", syncing:"#3B82F6" };
  const c = cfg[status];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:c.cls, fontSize:11, fontWeight:700, flexShrink:0, whiteSpace:"nowrap", color:colors[status], border:`1px solid ${c.cls}` }}>
      <div style={{ width:7, height:7, borderRadius:"50%", background:colors[status], flexShrink:0, animation:c.dotPulse?"connectedGlow 2s infinite":undefined }} />
      {c.label}
    </div>
  );
}

// ── Platform Card ──────────────────────────────────────────────────────────
function PlatCard({ p, idx, onConnect, onDisconnect, onAccMenu, showToast }: {
  p: Platform; idx: number;
  onConnect: (id: string, mode?: string) => void;
  onDisconnect: (id: string) => void;
  onAccMenu: (platId: string, accId: string) => void;
  showToast: (msg: string, type?: string) => void;
}) {
  const isConnected = ["connected","syncing"].includes(p.status);
  return (
    <div style={{ background:"#fff", border:`1.5px solid ${p.status==="connected"?"rgba(16,185,129,.2)":p.status==="error"?"rgba(245,158,11,.25)":p.status==="syncing"?"rgba(59,130,246,.2)":"#E2E4F0"}`, borderRadius:16, overflow:"hidden", boxShadow:"0 1px 4px rgba(11,12,26,.06)", display:"flex", flexDirection:"column", animation:`cardReveal .35s ease ${idx*0.07}s both`, transition:"all .22s cubic-bezier(.34,1.56,.64,1)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 10px 28px rgba(11,12,26,.10)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 1px 4px rgba(11,12,26,.06)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; }}>
      {/* Stripe */}
      <div style={{ height:4, background:p.grad }} />
      {/* Body */}
      <div style={{ padding:"18px 20px 14px", flex:1 }}>
        {/* Top row */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:13, marginBottom:14 }}>
          <div style={{ width:50, height:50, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:23, flexShrink:0, background:p.grad, boxShadow:"0 4px 14px rgba(11,12,26,.08)" }}>
            <i className={p.icon} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15.5, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:3 }}>{p.name}</div>
            <div style={{ fontSize:11.5, color:"#8486AB", lineHeight:1.4 }}>{p.desc}</div>
          </div>
          <StatusBadge status={p.status} />
        </div>

        {/* Accounts list */}
        {p.accounts.length > 0 ? (
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:12 }}>
            {p.accounts.map(acc => (
              <div key={acc.id} onClick={() => onAccMenu(p.id, acc.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:10, background:"#F0F1F9", border:"1px solid #ECEDF8", cursor:"pointer", position:"relative", overflow:"hidden", transition:"all .14s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="rgba(91,91,214,.22)"; (e.currentTarget as HTMLDivElement).style.background="#EEEEFF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#ECEDF8"; (e.currentTarget as HTMLDivElement).style.background="#F0F1F9"; }}>
                <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:acc.col, background:`${acc.col}22` }}>{acc.ava}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:"#0B0C1A", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{acc.name}</div>
                  <div style={{ fontSize:11, color:"#8486AB", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1 }}>{acc.handle}</div>
                  <div style={{ fontSize:9.5, color:"#BFC1D9", marginTop:1, fontFamily:"JetBrains Mono,monospace" }}>Last sync: {acc.lastSync}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:3, padding:"2px 7px", borderRadius:8, fontSize:10, fontWeight:700, background:acc.health==="active"?"#ECFDF5":acc.health==="syncing"?"#EFF6FF":"#FEF2F2", color:acc.health==="active"?"#059669":acc.health==="syncing"?"#3B82F6":"#EF4444" }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:"currentColor" }} />
                  {acc.health.charAt(0).toUpperCase()+acc.health.slice(1)}
                </div>
                <div onClick={e => { e.stopPropagation(); onAccMenu(p.id, acc.id); }} style={{ width:22, height:22, borderRadius:5, color:"#BFC1D9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, cursor:"pointer" }}>
                  <i className="fa-solid fa-ellipsis" />
                </div>
              </div>
            ))}
          </div>
        ) : p.status === "disconnected" ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"18px 16px 10px", gap:5, textAlign:"center", marginBottom:12 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"#F0F1F9", border:"2px dashed #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#BFC1D9", marginBottom:4 }}>
              <i className={p.icon} />
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:"#3D3F60" }}>No account connected</div>
            <div style={{ fontSize:11.5, color:"#8486AB", lineHeight:1.4 }}>Connect your {p.name} account to enable AI posting</div>
          </div>
        ) : p.status === "error" ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"18px 16px 10px", gap:5, textAlign:"center", marginBottom:12 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:"#FFFBEB", border:"2px dashed rgba(245,158,11,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#F59E0B", marginBottom:4 }}>
              <i className={p.icon} />
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:"#F59E0B" }}>Token Expired</div>
            <div style={{ fontSize:11.5, color:"#8486AB", lineHeight:1.4 }}>{p.errorMsg}</div>
          </div>
        ) : null}

        {/* Sync bar */}
        {p.status === "syncing" && (
          <div style={{ paddingBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:11, color:"#8486AB", fontWeight:600 }}>
              <span><i className="fa-solid fa-rotate" style={{ fontSize:10, marginRight:3, animation:"spin .8s linear infinite" }} />Syncing account data</span>
              <span style={{ fontWeight:700, color:"#3B82F6", fontFamily:"JetBrains Mono,monospace" }}>68%</span>
            </div>
            <div style={{ height:5, background:"#E2E4F0", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:3, background:"linear-gradient(90deg,#3B82F6,#60A5FA)", width:"68%", backgroundSize:"600px", animation:"shimmer 1.5s infinite" }} />
            </div>
          </div>
        )}

        {/* Stats */}
        {p.stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, marginBottom:12 }}>
            {[{v:p.stats.f,l:"Followers"},{v:p.stats.p,l:"Posts"},{v:p.stats.e,l:"Eng Rate",green:true}].map(s => (
              <div key={s.l} style={{ background:"#F0F1F9", border:"1px solid #ECEDF8", borderRadius:9, padding:"8px 10px", textAlign:"center" }}>
                <div style={{ fontSize:14, fontWeight:900, color:s.green?"#10B981":"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{s.v}</div>
                <div style={{ fontSize:9.5, color:"#8486AB", marginTop:2, textTransform:"uppercase", letterSpacing:".4px" }}>{s.l}</div>
                {s.green && <div style={{ fontSize:9.5, fontWeight:700, color:"#10B981", marginTop:1, fontFamily:"JetBrains Mono,monospace" }}>↑ +0.3%</div>}
              </div>
            ))}
          </div>
        )}

        {/* Permissions */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {p.perms.map(pr => (
            <div key={pr} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:5, background:"#F0F1F9", border:"1px solid #ECEDF8", fontSize:10.5, fontWeight:600, color:"#8486AB" }}>
              <i className="fa-solid fa-check" style={{ fontSize:9, color:"#10B981" }} />{pr}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display:"flex", gap:7, padding:"13px 18px", borderTop:"1px solid #ECEDF8", background:"#F0F1F9" }}>
        {isConnected ? (
          <>
            <button onClick={() => onConnect(p.id)} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 12px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:"1.5px solid #DDDDFB", background:"#EEEEFF", color:"#5B5BD6", flex:1, transition:"all .16s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="#5B5BD6"; (e.currentTarget as HTMLButtonElement).style.color="#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="#EEEEFF"; (e.currentTarget as HTMLButtonElement).style.color="#5B5BD6"; }}>
              <i className="fa-solid fa-plus" style={{ fontSize:10 }} /> Add Account
            </button>
            <button onClick={() => showToast(`📊 Opening ${p.name} analytics…`, "brand")} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 12px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:"1.5px solid rgba(59,130,246,.15)", background:"#EFF6FF", color:"#3B82F6", flex:1, transition:"all .16s" }}>
              <i className="fa-solid fa-chart-simple" style={{ fontSize:10 }} /> Analytics
            </button>
            <button onClick={() => onDisconnect(p.id)} title="Disconnect" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 11px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:"1.5px solid #E2E4F0", background:"#fff", color:"#3D3F60", transition:"all .16s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#EF4444"; (e.currentTarget as HTMLButtonElement).style.color="#EF4444"; (e.currentTarget as HTMLButtonElement).style.background="#FEF2F2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#E2E4F0"; (e.currentTarget as HTMLButtonElement).style.color="#3D3F60"; (e.currentTarget as HTMLButtonElement).style.background="#fff"; }}>
              <i className="fa-solid fa-unlink" style={{ fontSize:11 }} />
            </button>
          </>
        ) : p.status === "error" ? (
          <>
            <button onClick={() => onConnect(p.id, "reconnect")} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 12px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:"1.5px solid rgba(245,158,11,.2)", background:"#FFFBEB", color:"#F59E0B", flex:2, transition:"all .16s" }}>
              <i className="fa-solid fa-plug" style={{ fontSize:10 }} /> Reconnect Account
            </button>
            <button onClick={() => onDisconnect(p.id)} title="Remove" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 11px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", border:"1.5px solid #E2E4F0", background:"#fff", color:"#3D3F60", transition:"all .16s" }}>
              <i className="fa-solid fa-trash" style={{ fontSize:11 }} />
            </button>
          </>
        ) : (
          <button onClick={() => onConnect(p.id)} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px 12px", borderRadius:9, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", border:"none", background:p.grad, color:"#fff", flex:1, boxShadow:"0 1px 4px rgba(11,12,26,.06)", transition:"all .16s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter="brightness(1.1)"; (e.currentTarget as HTMLButtonElement).style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter=""; (e.currentTarget as HTMLButtonElement).style.transform=""; }}>
            <i className="fa-solid fa-plug" style={{ fontSize:11 }} /> Connect {p.name}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Connect Modal ──────────────────────────────────────────────────────────
function ConnectModal({ p, mode, onAuthorize, onClose }: { p: Platform; mode: string; onAuthorize: () => void; onClose: () => void }) {
  const isReconn = mode === "reconnect";
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 22px", borderBottom:"1px solid #E2E4F0" }}>
        <div style={{ width:54, height:54, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:25, color:"#fff", flexShrink:0, background:p.grad, boxShadow:"0 4px 14px rgba(11,12,26,.08)" }}>
          <i className={p.icon} />
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{isReconn?"Reconnect":"Connect"} {p.name}</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>{isReconn?"Your token expired. Re-authorise to resume auto-posting.":"Secure OAuth 2.0 · We never store your password"}</div>
        </div>
      </div>
      <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:0 }}>
        {["Click Authorize — you'll be securely redirected to "+p.name,"Log in to "+p.name+" if prompted and approve Shoutly AI","Grant the required permissions below for AI posting to work","Redirected back automatically — your account goes live instantly ✅"].map((step, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:i<3?"1px solid #ECEDF8":undefined, animation:`fadeUp .3s ease ${i*0.04+0.04}s both` }}>
            <div style={{ width:26, height:26, borderRadius:8, background:"#EEEEFF", color:"#5B5BD6", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"Sora,sans-serif", marginTop:1 }}>{i+1}</div>
            <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }} dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/(Click Authorize|Log in|required permissions|Redirected back)/g,"<strong>$1</strong>") }} />
          </div>
        ))}
      </div>
      <div style={{ padding:"0 22px 14px" }}>
        <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:7, fontFamily:"Sora,sans-serif" }}>Permissions Requested</div>
        {p.perms.map(pr => (
          <div key={pr} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", fontSize:12.5, color:"#3D3F60" }}>
            <i className="fa-solid fa-circle-check" style={{ color:"#10B981", fontSize:11, flexShrink:0 }} />{pr}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 14px", background:"#ECFDF5", borderRadius:9, margin:"0 22px 14px", fontSize:11.5, color:"#059669", fontWeight:600 }}>
        <i className="fa-solid fa-shield-halved" style={{ flexShrink:0 }} />
        Secured by OAuth 2.0 · Revoke anytime from {p.name} settings · No password stored
      </div>
      <div style={{ display:"flex", gap:8, padding:"14px 22px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={onAuthorize} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:p.grad, color:"#fff", border:"none" }}>
          <i className="fa-solid fa-lock" style={{ marginRight:6 }} /> Authorize {p.name}
        </button>
      </div>
    </>
  );
}

// ── OAuth Loading Modal ────────────────────────────────────────────────────
function OAuthLoadingModal({ p, step }: { p: Platform; step: number }) {
  const steps = ["Opening secure OAuth window","Awaiting user authorization","Exchanging access tokens","Syncing account profile & data"];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 22px", gap:16 }}>
      <div style={{ width:54, height:54, borderRadius:"50%", border:"3px solid #E2E4F0", borderTopColor:"#5B5BD6", animation:"spin .8s linear infinite" }} />
      <div style={{ fontSize:15, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Connecting to {p.name}</div>
      <div style={{ fontSize:12, color:"#8486AB", textAlign:"center", lineHeight:1.5 }}>Complete authorization in the popup window. This usually takes a few seconds.</div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, width:"100%" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:i<step?"#10B981":i===step?"#0B0C1A":"#8486AB", fontWeight:i===step?700:400, padding:"4px 0", transition:"color .2s" }}>
            <i className={i < step ? "fa-solid fa-check" : i === step ? "fa-solid fa-circle-notch" : "fa-regular fa-circle"} style={{ fontSize:11, flexShrink:0, width:14, textAlign:"center", animation:i===step?"spin .8s linear infinite":undefined, color:i<step?"#10B981":i===step?"#5B5BD6":"#BFC1D9" }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Disconnect Modal ───────────────────────────────────────────────────────
function DisconnectModal({ p, onConfirm, onClose }: { p: Platform; onConfirm: () => void; onClose: () => void }) {
  return (
    <>
      <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-unlink" style={{ color:"#EF4444" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Disconnect {p.name}?</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>All automation for this account will stop immediately</div>
        </div>
      </div>
      <div style={{ padding:"18px 22px" }}>
        <div style={{ display:"flex", gap:10, padding:"12px 14px", borderRadius:10, background:"#FEF2F2", border:"1px solid rgba(239,68,68,.15)", marginBottom:14 }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color:"#EF4444", flexShrink:0, marginTop:2, fontSize:14 }} />
          <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }}>This will <strong style={{ color:"#EF4444" }}>immediately stop all scheduled posts</strong> for {p.name} and revoke Shoutly AI's publishing access.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {[
            { icon:"fa-xmark", col:"#EF4444", txt:`All queued posts for ${p.name} will be paused` },
            { icon:"fa-xmark", col:"#EF4444", txt:"API token & access revoked immediately" },
            { icon:"fa-xmark", col:"#EF4444", txt:"Analytics sync will stop" },
            { icon:"fa-check", col:"#10B981", txt:"Post history & content drafts are preserved" },
            { icon:"fa-check", col:"#10B981", txt:"Reconnect anytime with one click" },
          ].map(r => (
            <div key={r.txt} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 11px", borderRadius:8, background:"#F0F1F9", border:"1px solid #ECEDF8", fontSize:12.5, color:"#3D3F60" }}>
              <i className={`fa-solid ${r.icon}`} style={{ fontSize:11, color:r.col, flexShrink:0, width:13, textAlign:"center" }} />{r.txt}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, padding:"14px 22px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#EF4444", color:"#fff", border:"none" }}>
          <i className="fa-solid fa-unlink" style={{ marginRight:6 }} /> Disconnect {p.name}
        </button>
      </div>
    </>
  );
}

// ── Account Menu Modal ─────────────────────────────────────────────────────
function AccMenuModal({ p, acc, showToast, onDisconnect, onClose }: { p: Platform; acc: Account; showToast: (m: string, t?: string) => void; onDisconnect: () => void; onClose: () => void }) {
  const items = [
    { icon:"fa-chart-simple", label:"View Analytics", act:() => { showToast("📊 Opening analytics…","brand"); onClose(); } },
    { icon:"fa-rotate", label:"Force Sync Now", act:() => { showToast(`🔄 Syncing ${acc.name}…`,"brand"); onClose(); } },
    { icon:"fa-calendar-check", label:"View Scheduled Posts", act:() => { showToast("📅 Opening queue…","brand"); onClose(); } },
    { icon:"fa-pen", label:"Edit Account Settings", act:() => { showToast("⚙️ Opening settings…","brand"); onClose(); } },
    { icon:"fa-unlink", label:"Disconnect This Account", act:() => { onClose(); onDisconnect(); }, danger:true },
  ];
  return (
    <>
      <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:`${p.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className={p.icon} style={{ color:p.color }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{acc.name}</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>{acc.handle} · {p.name}</div>
        </div>
      </div>
      <div style={{ padding:"10px 22px" }}>
        {items.map(m => (
          <div key={m.label} onClick={m.act} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 13px", borderRadius:9, cursor:"pointer", marginBottom:3, color:m.danger?"#EF4444":"#0B0C1A", transition:"background .13s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = m.danger?"#FEF2F2":"#F0F1F9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}>
            <i className={`fa-solid ${m.icon}`} style={{ fontSize:13, width:16, textAlign:"center", color:m.danger?"#EF4444":"#8486AB" }} />
            <span style={{ fontSize:13, fontWeight:600 }}>{m.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, padding:"14px 22px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:"#8486AB" }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:acc.health==="active"?"#10B981":"#F59E0B" }} />
          {acc.health==="active"?"Posting Active":"Syncing"} · {acc.lastSync}
        </div>
        <button onClick={onClose} style={{ padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Close</button>
      </div>
    </>
  );
}

// ── Picker Modal ───────────────────────────────────────────────────────────
function PickerModal({ plats, onSelect, onClose }: { plats: Platform[]; onSelect: (id: string) => void; onClose: () => void }) {
  return (
    <>
      <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #E2E4F0", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:42, height:42, borderRadius:11, background:"#EEEEFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
          <i className="fa-solid fa-plus" style={{ color:"#5B5BD6" }} />
        </div>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Connect a Platform</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>Choose a social network to link with Shoutly AI</div>
        </div>
      </div>
      <div style={{ padding:"18px 22px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {plats.map(p => {
            const isConn = ["connected","syncing"].includes(p.status);
            return (
              <div key={p.id} onClick={() => onSelect(p.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:10, border:`1.5px solid ${isConn?"rgba(16,185,129,.3)":"#E2E4F0"}`, background:isConn?"#ECFDF5":"#F0F1F9", cursor:"pointer", transition:"all .14s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor=p.color; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 0 0 3px ${p.color}22`; (e.currentTarget as HTMLDivElement).style.transform="translateY(-1px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor=isConn?"rgba(16,185,129,.3)":"#E2E4F0"; (e.currentTarget as HTMLDivElement).style.boxShadow=""; (e.currentTarget as HTMLDivElement).style.transform=""; }}>
                <div style={{ width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, flexShrink:0, background:p.grad }}>
                  <i className={p.icon} />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#0B0C1A" }}>{p.name}</div>
                  <div style={{ fontSize:10.5, fontWeight:600, marginTop:1, color:isConn?"#059669":p.status==="error"?"#F59E0B":"#8486AB" }}>
                    {isConn?"✓ Connected":p.status==="error"?"⚡ Needs reconnect":"Not connected"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display:"flex", padding:"14px 22px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} style={{ padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Close</button>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SocialAccountsPage() {
  const { sidebarSlim, setSidebarSlim } = useSidebarState();
  const [plats, setPlats] = useState<Platform[]>(INIT_PLATS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [alertVisible, setAlertVisible] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [modal, setModal] = useState<{ type: ModalType; platId?: string; accId?: string; mode?: string }>({ type: null });
  const [oauthStep, setOauthStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toasts, show: showToast, remove: removeToast } = useToasts();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check Facebook connection on mount
  useEffect(() => {
    // If returning from /facebook after successful OAuth
    if (searchParams.get("fb") === "connected") {
      showToast("✅ Facebook connected successfully!", "green");
      router.replace("/dashboards/settings/accounts");
    }

    // Check if Facebook is already connected via API
    const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
    if (!token) return;

    getFacebookPages().then(pages => {
      if (Array.isArray(pages) && pages.length > 0) {
        setPlats(prev => prev.map(p => {
          if (p.id !== "fb") return p;
          const accounts: Account[] = pages.map(pg => ({
            id: pg.pageId,
            name: pg.pageName ?? "Facebook Page",
            handle: pg.isDefault ? "Default Page" : "Page",
            ava: "FB",
            col: "#1877F2",
            followers: "—",
            lastSync: "Just now",
            health: "active" as const,
          }));
          return { ...p, status: "connected" as PlatStatus, accounts, stats: { f: "—", p: "—", e: "—%" } };
        }));
      }
    }).catch(() => { /* not connected, stay disconnected */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlats = plats.filter(p => {
    if (filter === "connected") return ["connected","syncing"].includes(p.status);
    if (filter === "disconnected") return p.status === "disconnected";
    if (filter === "attention") return ["error","syncing"].includes(p.status);
    return true;
  });

  const connCount = plats.filter(p => ["connected","syncing"].includes(p.status)).length;
  const attnCount = plats.filter(p => ["error"].includes(p.status)).length;

  const openConnect = (platId: string, mode = "connect") => setModal({ type:"connect", platId, mode });
  const openDisconnect = (platId: string) => setModal({ type:"disconnect", platId });
  const openAccMenu = (platId: string, accId: string) => setModal({ type:"accMenu", platId, accId });
  const openPicker = () => setModal({ type:"picker" });
  const closeModal = () => { setModal({ type:null }); setOauthStep(0); setShowSuccess(false); };

  const startOAuth = async (platId: string) => {
    if (platId === "fb") {
      try {
        const url = await getFacebookAuthUrl();
        window.location.href = url;
      } catch {
        showToast("Facebook connect failed. Please try again.", "red");
        closeModal();
      }
      return;
    }

    setModal({ type:"oauthLoading", platId });
    setOauthStep(0);
    let step = 0;
    const tick = () => {
      step++;
      setOauthStep(step);
      if (step < 4) setTimeout(tick, 850);
      else setTimeout(() => {
        setShowSuccess(true);
        setPlats(prev => prev.map(p => {
          if (p.id !== platId) return p;
          const updated = { ...p, status: "connected" as PlatStatus };
          if (!updated.accounts.length) {
            updated.accounts = [{ id: p.id+"N", name: p.name+" Account", handle:"@brandname", ava:p.name.slice(0,2).toUpperCase(), col:p.color, followers:"—", lastSync:"Just now", health:"active" }];
            updated.stats = { f:"—", p:"0", e:"—%" };
          }
          return updated;
        }));
        setTimeout(() => { closeModal(); showToast(`✅ ${platId} connected successfully!`,"green"); }, 1900);
      }, 400);
    };
    setTimeout(tick, 800);
  };

  const confirmDisconnect = (platId: string) => {
    setPlats(prev => prev.map(p => p.id !== platId ? p : { ...p, status:"disconnected" as PlatStatus, accounts:[], stats:undefined }));
    closeModal();
    showToast(`🔌 ${platId} disconnected. Posting stopped.`,"red");
  };

  const syncAll = () => {
    if (syncing) return;
    setSyncing(true);
    showToast("🔄 Syncing all connected accounts…","brand");
    setTimeout(() => { setSyncing(false); showToast("✅ All accounts synced successfully!","green"); }, 2600);
  };

  const activePlat = plats.find(p => p.id === modal.platId);
  const activeAcc = activePlat?.accounts.find(a => a.id === modal.accId);

  const toastColors: Record<string, string> = { default:"#0F1117", green:"#059669", red:"#EF4444", brand:"#5B5BD6", amber:"#F59E0B" };
  const toastIcons: Record<string, string> = { default:"🔔", green:"✅", red:"🔌", brand:"✦", amber:"⚡" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px; background: #F4F5FB; color: #0B0C1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes connectedGlow { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)} 50%{box-shadow:0 0 0 6px rgba(16,185,129,0)} }
        @keyframes cardReveal { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastSlide { from{transform:translateX(120%)} to{transform:translateX(0)} }
        @keyframes successPop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        {/* ── Sidebar (imported) ── */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim(s => !s)} activePath="/settings/accounts" />

        {/* ── Main ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Topbar */}
          <AdminHeader
            pageTitle="Social Accounts"
            slim={sidebarSlim}
            onToggle={() => setSidebarSlim(s => !s)}
            searchPlaceholder="Search accounts…"
            actionButton={
              <button onClick={syncAll} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:7, background:"#5B5BD6", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", border:"none", fontFamily:"Sora,sans-serif", boxShadow:"0 4px 20px rgba(91,91,214,.28)" }}>
                <i className="fa-solid fa-rotate" style={{ fontSize:11, animation:syncing?"spin .6s linear infinite":undefined }} /> Sync All
              </button>
            }
          />

          {/* Content */}
          <div style={{ flex:1, overflowY:"auto" }}>
            {/* Page Header */}
            <div style={{ background:"#fff", borderBottom:"1px solid #E2E4F0", padding:"24px 28px 20px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-80, right:-60, width:320, height:320, background:"radial-gradient(circle,rgba(91,91,214,.07) 0%,transparent 70%)", pointerEvents:"none" }} />
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, marginBottom:18 }}>
                <div>
                  <div style={{ width:46, height:46, borderRadius:12, background:"linear-gradient(135deg,#5B5BD6,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#fff", marginBottom:12, boxShadow:"0 4px 20px rgba(91,91,214,.32)" }}>
                    <i className="fa-solid fa-link" />
                  </div>
                  <div style={{ fontSize:23, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif", letterSpacing:"-.5px", marginBottom:5 }}>Social Accounts</div>
                  <div style={{ fontSize:13, color:"#8486AB", maxWidth:540, lineHeight:1.55 }}>Connect your social media accounts to enable auto-posting and AI automation. Manage all your platforms in one place.</div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, marginTop:4 }}>
                  <button onClick={() => showToast("🔑 API keys copied","brand")} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#F0F1F9", border:"1px solid #E2E4F0", color:"#3D3F60" }}>
                    <i className="fa-solid fa-key" style={{ fontSize:11 }} /> API Keys
                  </button>
                  <button onClick={openPicker} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#5B5BD6", color:"#fff", border:"none", boxShadow:"0 4px 20px rgba(91,91,214,.32)" }}>
                    <i className="fa-solid fa-plus" style={{ fontSize:12 }} /> Connect Account
                  </button>
                </div>
              </div>
              {/* Stats */}
              <div style={{ display:"flex", gap:0, borderTop:"1px solid #ECEDF8", paddingTop:16 }}>
                {[
                  { v:connCount, l:"Connected", d:"↑ +2 this month", dc:"#10B981" },
                  { v:"147K", l:"Total Followers", d:"↑ +12.4%", dc:"#10B981" },
                  { v:"68", l:"Posts Queued", d:"Next: Today 7:45 AM", dc:"#8486AB" },
                  { v:"8.7%", l:"Avg Engagement", d:"↑ +1.2% vs last mo", dc:"#10B981" },
                  { v:attnCount, l:"Action Needed", d:"Reconnect required", dc:"#F59E0B", warn:true },
                ].map((s, i, arr) => (
                  <div key={s.l} style={{ display:"flex", flexDirection:"column", gap:2, paddingRight:24, marginRight:24, borderRight:i<arr.length-1?"1px solid #ECEDF8":undefined }}>
                    <div style={{ fontSize:21, fontWeight:900, fontFamily:"Sora,sans-serif", color:s.warn?"#F59E0B":"#0B0C1A", letterSpacing:"-.5px", lineHeight:1 }}>{s.v}</div>
                    <div style={{ fontSize:10.5, color:s.warn?"#F59E0B":"#8486AB", fontWeight:600, textTransform:"uppercase", letterSpacing:".5px", marginTop:3 }}>{s.l}</div>
                    <div style={{ fontSize:10, fontWeight:700, fontFamily:"JetBrains Mono,monospace", marginTop:2, color:s.dc }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Banner */}
            {alertVisible && (
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 28px", background:"linear-gradient(90deg,rgba(245,158,11,.08),transparent)", borderBottom:"1px solid rgba(245,158,11,.15)" }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"#FFFBEB", display:"flex", alignItems:"center", justifyContent:"center", color:"#F59E0B", fontSize:14, flexShrink:0 }}>
                  <i className="fa-solid fa-triangle-exclamation" />
                </div>
                <div style={{ fontSize:13, color:"#3D3F60", flex:1 }}>
                  <strong style={{ color:"#0B0C1A" }}>2 accounts need attention</strong> — YouTube & TikTok tokens have expired. Reconnect to resume AI posting.
                </div>
                <button onClick={openPicker} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:7, background:"#F59E0B", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", border:"none", fontFamily:"Sora,sans-serif" }}>
                  <i className="fa-solid fa-plug" style={{ fontSize:11 }} /> Reconnect Now
                </button>
                <span onClick={() => setAlertVisible(false)} style={{ color:"#F59E0B", cursor:"pointer", padding:4, fontSize:14 }}>
                  <i className="fa-solid fa-xmark" />
                </span>
              </div>
            )}

            {/* Filter Bar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 28px", background:"#fff", borderBottom:"1px solid #E2E4F0", flexWrap:"wrap" }}>
              {([["all","All Platforms"],["connected","Connected"],["disconnected","Disconnected"],["attention","Needs Attention"]] as const).map(([f, label]) => {
                const dotCols: Record<string, string> = { connected:"#10B981", disconnected:"#BFC1D9", attention:"#F59E0B" };
                return (
                  <div key={f} onClick={() => setFilter(f)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:20, fontSize:12, fontWeight:700, cursor:"pointer", border:`1.5px solid ${filter===f?"#5B5BD6":"#E2E4F0"}`, background:filter===f?"#5B5BD6":"#fff", color:filter===f?"#fff":"#3D3F60", fontFamily:"Sora,sans-serif", whiteSpace:"nowrap", transition:"all .14s" }}>
                    {f !== "all" && <div style={{ width:7, height:7, borderRadius:"50%", background:filter===f?"rgba(255,255,255,.7)":dotCols[f] }} />}
                    {label}
                    {f === "all" && <span style={{ fontSize:10, background:filter===f?"rgba(255,255,255,.25)":"#F0F1F9", padding:"1px 6px", borderRadius:8, marginLeft:2 }}>{plats.length}</span>}
                  </div>
                );
              })}
              <div style={{ width:1, height:20, background:"#E2E4F0" }} />
              <select onChange={() => showToast("🔀 Sorted","brand")} style={{ padding:"7px 10px", borderRadius:8, border:"1px solid #E2E4F0", background:"#F0F1F9", color:"#3D3F60", fontSize:12, fontWeight:600, cursor:"pointer", outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif" }}>
                <option>Sort: Platform Name</option>
                <option>Sort: Status</option>
                <option>Sort: Followers</option>
                <option>Sort: Last Synced</option>
              </select>
              <div style={{ flex:1 }} />
              <div onClick={syncAll} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, background:"#F0F1F9", border:"1px solid #E2E4F0", color:"#3D3F60", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all .13s" }}>
                <i className="fa-solid fa-rotate" style={{ fontSize:11, animation:syncing?"spin .6s linear infinite":undefined }} /> Sync All Accounts
              </div>
            </div>

            {/* Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:18, padding:"24px 28px 32px" }}>
              {filteredPlats.map((p, i) => (
                <PlatCard key={p.id} p={p} idx={i} onConnect={openConnect} onDisconnect={openDisconnect} onAccMenu={openAccMenu} showToast={showToast} />
              ))}
              {/* Add Platform Card */}
              <div onClick={() => showToast("📩 Request sent! We'll prioritize it.","brand")} style={{ background:"#fff", border:"2px dashed #E2E4F0", borderRadius:16, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"36px 24px", gap:10, cursor:"pointer", transition:"all .18s", minHeight:200, animation:`cardReveal .35s ease ${filteredPlats.length*0.07}s both` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#5B5BD6"; (e.currentTarget as HTMLDivElement).style.background="#EEEEFF"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#E2E4F0"; (e.currentTarget as HTMLDivElement).style.background="#fff"; (e.currentTarget as HTMLDivElement).style.transform=""; }}>
                <div style={{ width:54, height:54, borderRadius:14, background:"#F0F1F9", border:"1.5px solid #E2E4F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"#BFC1D9", marginBottom:4 }}>
                  <i className="fa-solid fa-plus" />
                </div>
                <div style={{ fontSize:14, fontWeight:800, color:"#3D3F60", fontFamily:"Sora,sans-serif" }}>Request a Platform</div>
                <div style={{ fontSize:12, color:"#8486AB", textAlign:"center", lineHeight:1.4 }}>Missing a social network? Let us know and we'll add it.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modal.type && (
        <div onClick={e => { if ((e.target as HTMLElement).id==="modal-bg") closeModal(); }} id="modal-bg"
          style={{ position:"fixed", inset:0, background:"rgba(11,12,26,.5)", backdropFilter:"blur(10px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .18s ease" }}>
          <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:20, width:"100%", maxWidth:modal.type==="connect"||modal.type==="picker"?"500px":"460px", overflow:"hidden", boxShadow:"0 32px 80px rgba(11,12,26,.2)", animation:"scaleIn .22s cubic-bezier(.34,1.56,.64,1)", position:"relative" }}>
            {/* Success overlay */}
            {showSuccess && (
              <div style={{ position:"absolute", inset:0, background:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, animation:"fadeIn .3s ease", borderRadius:20, zIndex:10 }}>
                <div style={{ width:76, height:76, borderRadius:"50%", background:"#ECFDF5", border:"3px solid #10B981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, color:"#10B981", animation:"successPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
                  <i className="fa-solid fa-check" />
                </div>
                <div style={{ fontSize:19, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Account Connected!</div>
                <div style={{ fontSize:13, color:"#8486AB", textAlign:"center", maxWidth:300, lineHeight:1.55 }}>{activePlat?.name} is live. Shoutly AI will now auto-post and schedule content to this account.</div>
              </div>
            )}

            {modal.type==="connect" && activePlat && (
              <ConnectModal p={activePlat} mode={modal.mode||"connect"} onAuthorize={() => startOAuth(activePlat.id)} onClose={closeModal} />
            )}
            {modal.type==="oauthLoading" && activePlat && (
              <OAuthLoadingModal p={activePlat} step={oauthStep} />
            )}
            {modal.type==="disconnect" && activePlat && (
              <DisconnectModal p={activePlat} onConfirm={() => confirmDisconnect(activePlat.id)} onClose={closeModal} />
            )}
            {modal.type==="accMenu" && activePlat && activeAcc && (
              <AccMenuModal p={activePlat} acc={activeAcc} showToast={showToast} onDisconnect={() => openDisconnect(activePlat.id)} onClose={closeModal} />
            )}
            {modal.type==="picker" && (
              <PickerModal plats={plats} onSelect={id => { closeModal(); openConnect(id); }} onClose={closeModal} />
            )}
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:8, zIndex:999, pointerEvents:"none" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:toastColors[t.type]||"#0F1117", color:"#fff", fontSize:13, fontWeight:600, boxShadow:"0 20px 50px rgba(11,12,26,.14)", animation:"toastSlide .3s cubic-bezier(.34,1.56,.64,1)", pointerEvents:"all", maxWidth:340, border:"1px solid rgba(255,255,255,.08)" }}>
            <span style={{ fontSize:15, flexShrink:0 }}>{toastIcons[t.type]||"🔔"}</span>
            <span style={{ flex:1 }}>{t.msg}</span>
            <span onClick={() => removeToast(t.id)} style={{ opacity:.6, cursor:"pointer", padding:"2px 4px", marginLeft:"auto", flexShrink:0, pointerEvents:"all" }}>✕</span>
          </div>
        ))}
      </div>
    </>
  );
}