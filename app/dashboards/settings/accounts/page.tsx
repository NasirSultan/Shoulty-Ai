"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "../../AdminHeader";
import {
  getConnectUrl,
  getConnectionStatus,
  getAccountsOverview,
  handlePlatformCallback,
} from "@/api/autopostApi";

// ── Types ──────────────────────────────────────────────────────────────────
type PlatStatus = "connected" | "disconnected" | "attention";
type ModalType = "connect" | "disconnect" | "oauthLoading" | null;

interface Feature { label: string; enabled: boolean }

interface Platform {
  id: string; name: string; icon: string; color: string; grad: string;
  desc: string; perms: string[];
  status: PlatStatus; accountCount: number; lastSync: string;
  publishing: "active" | "at risk" | "—";
  features: Feature[];
}

interface ConnectedAccount {
  id: string; brandName: string; brandInitials: string; brandColor: string;
  platformId: string; platformIcon: string; platformColor: string; platformGrad: string;
  handle: string; accountType: string; role: "Admin" | "Owner" | "Member";
  health: "Healthy" | "Needs refresh";
  followers: string; posts?: string; engagement?: string;
  connectedDate: string; lastSync: string; publishing: "active" | "at risk";
  permissions: string[]; workspace: string;
}

// ── Backend integration constants ───────────────────────────────────────────
// Only these three go through /connect + /handle-callback successfully today.
// (YouTube starts OAuth fine but normalizePlatform() has no 'youtube' case,
// so its callback throws — keep it disabled until the backend adds it.)
const PLATFORM_CONNECT_NAME: Record<string, string> = {
  fb: "facebook",
  ig: "instagram"
};
const BACKEND_TO_ID: Record<string, string> = {
  FACEBOOK: "fb",
  INSTAGRAM: "ig",
  LINKEDIN: "li",
};
const SUPPORTED_IDS = new Set(Object.keys(PLATFORM_CONNECT_NAME));

// ── Static platform metadata (cosmetic only — live status/counts come from the API) ──
const INIT_PLATS: Platform[] = [

  { id:"fb", name:"Facebook", icon:"fa-brands fa-facebook", color:"#1877F2", grad:"linear-gradient(135deg,#1877F2,#0C52C5)", desc:"Reach billions via Pages, Groups & Reels", perms:["Manage Facebook Pages","Publish posts & reels","Access Page analytics","Moderate comments"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Posts",enabled:true},{label:"Reels",enabled:true},{label:"Stories",enabled:true}] },
  { id:"li", name:"LinkedIn", icon:"fa-brands fa-linkedin", color:"#0A66C2", grad:"linear-gradient(135deg,#0A66C2,#0853A0)", desc:"Professional network for B2B growth", perms:["Share posts & articles","Manage Company Page","View follower analytics","Post on behalf of company"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true},{label:"Stories",enabled:false}] },
  { id:"ig", name:"Instagram", icon:"fa-brands fa-instagram", color:"#E1306C", grad:"linear-gradient(135deg,#F77737,#E1306C,#C13584,#833AB4)", desc:"Share photos, Reels & Stories with 2B+ users", perms:["Publish photos & videos","Read post insights","Manage comments","Access follower data"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Posts",enabled:true},{label:"Reels",enabled:true},{label:"Stories",enabled:true}] },
  { id:"x", name:"X", icon:"fa-brands fa-x-twitter", color:"#1A1A1A", grad:"linear-gradient(135deg,#1A1A1A,#444)", desc:"Real-time conversations & viral reach", perms:["Post & schedule tweets","Read account timeline","Access engagement metrics","Manage replies"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true},{label:"Reels",enabled:false}] },
  { id:"tk", name:"TikTok", icon:"fa-brands fa-tiktok", color:"#010101", grad:"linear-gradient(135deg,#010101,#EE1D52,#69C9D0)", desc:"Short-form video for Gen-Z reach", perms:["Upload short videos","Read profile & followers","Access video analytics"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Reels",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true},{label:"Stories",enabled:false}] },
  { id:"pi", name:"Pinterest", icon:"fa-brands fa-pinterest", color:"#E60023", grad:"linear-gradient(135deg,#E60023,#AD0019)", desc:"Visual discovery for 450M+ monthly users", perms:["Create & schedule pins","Access analytics","Manage boards","Read audience insights"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Schedule",enabled:true}] },
  { id:"yt", name:"YouTube", icon:"fa-brands fa-youtube", color:"#FF0000", grad:"linear-gradient(135deg,#FF0000,#CC0000)", desc:"World's largest video platform", perms:["Upload & schedule videos","Manage channel","Post community updates","Read analytics"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Reels",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true}] },
  { id:"gb", name:"Google Business", icon:"fa-brands fa-google", color:"#4285F4", grad:"linear-gradient(135deg,#4285F4,#1A6CF0)", desc:"Manage your local Google presence", perms:["Publish business updates","Respond to reviews","Post offers & events","View insights"], status:"disconnected", accountCount:0, lastSync:"—", publishing:"—", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Schedule",enabled:true},{label:"Reels",enabled:false}] },

];

// Still static — no backend endpoint powers AI suggestions or an activity feed yet.
const AI_RECS = [
  { id:"r2", icon:"fa-brands fa-threads", iconBg:"#F0F1F9", iconColor:"#1A1A1A", title:"Connect Threads to increase your reach.", desc:"Your Instagram audience overlaps ~80% — same content, extra reach, zero effort.", action:"Connect Threads", primary:false },
  { id:"r3", icon:"fa-brands fa-youtube", iconBg:"#FEF2F2", iconColor:"#FF0000", title:"Your YouTube channel supports Shorts.", desc:"Shoutly can repurpose your 12 recent Reels into Shorts automatically.", action:"Enable Shorts", primary:false },
  { id:"r4", icon:"fa-brands fa-linkedin", iconBg:"#EFF6FF", iconColor:"#0A66C2", title:"You've connected LinkedIn but only scheduled 2 posts.", desc:"Your B2B audience is most active Tue–Thu mornings.", action:"Schedule posts", primary:false },
];

const RECENT_ACT = [
  { id:"t2", icon:"fa-brands fa-linkedin", iconBg:"#0A66C2", text:"LinkedIn refreshed automatically", time:"2h ago" },
  { id:"t3", icon:"fa-brands fa-youtube", iconBg:"#FF0000", text:"YouTube permissions updated — Shorts enabled", time:"Yesterday" },
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

// ── Platform Card ──────────────────────────────────────────────────────────
function PlatCard({ p, onConnect, onDisconnect, showToast }: {
  p: Platform;
  onConnect: (id: string, mode?: string) => void;
  onDisconnect: (id: string) => void;
  showToast: (msg: string, type?: string) => void;
}) {
  const isConn = p.status === "connected";
  const isAttn = p.status === "attention";
  const isActive = isConn || isAttn;
  const isSupported = SUPPORTED_IDS.has(p.id);

  return (
    <div
      style={{ background:"#fff", border:`1px solid ${isAttn?"rgba(245,158,11,.25)":isConn?"rgba(249,115,22,.2)":"#E2E4F0"}`, borderRadius:12, overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 1px 4px rgba(11,12,26,.04)", transition:"all .18s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 6px 20px rgba(11,12,26,.08)"; (e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow="0 1px 4px rgba(11,12,26,.04)"; (e.currentTarget as HTMLDivElement).style.transform=""; }}
    >
      {/* Header */}
      <div style={{ padding:"16px 16px 10px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:42, height:42, borderRadius:10, background:p.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, color:"#fff", flexShrink:0, boxShadow:"0 2px 8px rgba(11,12,26,.1)" }}>
          <i className={p.icon} />
        </div>
        <span style={{ fontSize:14.5, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{p.name}</span>
      </div>

      {/* Status strip */}
      <div style={{ margin:"0 16px 10px", padding:"5px 10px", borderRadius:6, background:isAttn?"#FFFBEB":isConn?"#ECFDF5":"#F0F1F9", display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:isAttn?"#F59E0B":isConn?"#10B981":"#BFC1D9", animation:isConn?"connectedGlow 2s infinite":undefined, flexShrink:0 }} />
        <span style={{ fontSize:11.5, fontWeight:700, color:isAttn?"#B45309":isConn?"#059669":"#8486AB" }}>
          {isAttn?"Attention":isConn?"Connected":!isSupported?"Not available yet":"Not Connected"}

        </span>
      </div>

      {/* Account info */}
      {isActive && (
        <div style={{ padding:"0 16px 10px" }}>
          <div style={{ fontSize:12, color:"#8486AB" }}>Feature coming soon</div>
          <div style={{ fontSize:12, marginTop:3 }}>
            Publishing: <span style={{ fontWeight:700, color:"#F97316" }}>upcoming</span>
          </div>
        </div>
      )}

      {/* Feature chips */}
      <div style={{ padding:"0 16px 14px", display:"flex", flexWrap:"wrap", gap:5 }}>
        {p.features.map(f => (
          <span key={f.label} style={{ padding:"3px 11px", borderRadius:20, background:"#F0F1F9", border:"1px solid #E8E9F3", fontSize:11, fontWeight:600, color:f.enabled?"#3D3F60":"#BFC1D9", textDecoration:f.enabled?"none":"line-through" }}>
            {f.label}
          </span>
        ))}
      </div>

      {/* Button */}
      <div style={{ padding:"11px 16px", borderTop:"1px solid #F0F1F9" }}>
        {!isSupported ? (
          <button
            disabled
            style={{ width:"100%", padding:"9px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"not-allowed", fontFamily:"Sora,sans-serif", background:"#F0F1F9", border:"1.5px solid #E2E4F0", color:"#BFC1D9" }}
          >
            Coming Soon
          </button>
        ) : isAttn ? (
          <button onClick={() => onConnect(p.id,"reconnect")} style={{ width:"100%", padding:"9px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(249,115,22,.3)" }}>
            Reconnect
          </button>
        ) : isConn ? (
          <button
            onClick={() => showToast(`Managing ${p.name}…`,"brand")}
            style={{ width:"100%", padding:"9px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#059669", border:"1.5px solid #E2E4F0", color:"#fff", transition:"all .14s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#F97316"; (e.currentTarget as HTMLButtonElement).style.color="#F97316"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#E2E4F0"; (e.currentTarget as HTMLButtonElement).style.color="#3D3F60"; }}
            disabled
          >

            Connected


          </button>
        ) : (
          <button onClick={() => onConnect(p.id)} style={{ width:"100%", padding:"9px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(249,115,22,.3)" }}>
            Connect {p.name}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Connected Account Row ──────────────────────────────────────────────────
function AccountRow({ acc, showToast, isLast }: { acc: ConnectedAccount; showToast: (m: string, t?: string) => void; isLast?: boolean }) {
  const needsRefresh = acc.health === "Needs refresh";

  const platName: Record<string, string> = {
    ig:"Instagram", tk:"TikTok", li:"LinkedIn", fb:"Facebook",
    x:"X", yt:"YouTube", pi:"Pinterest", gb:"Google Business",
  };

  const meta = [
    platName[acc.platformId] || acc.platformId,
    acc.accountType,
    acc.followers,
    acc.posts ? `${acc.posts} posts` : "",
    acc.engagement ? `${acc.engagement} eng.` : "",
  ].filter(Boolean).join(" · ");

  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 24px", borderBottom:isLast ? "none" : "1px solid #F0F1F9" }}>
      <div style={{ width:48, height:48, borderRadius:14, background:acc.platformGrad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#fff", flexShrink:0, boxShadow:"0 2px 8px rgba(11,12,26,.12)" }}>
        <i className={acc.platformIcon} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:3 }}>{acc.handle}</div>
        <div style={{ fontSize:12.5, color:"#8486AB" }}>{meta}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:needsRefresh?"#FFF7ED":"#ECFDF5", border:`1px solid ${needsRefresh?"#FDBA74":"rgba(16,185,129,.25)"}`, flexShrink:0 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:needsRefresh?"#F97316":"#10B981", flexShrink:0, display:"inline-block" }} />
        <span style={{ fontSize:12, fontWeight:700, color:needsRefresh?"#EA580C":"#059669", fontFamily:"Sora,sans-serif", whiteSpace:"nowrap" }}>
          {needsRefresh ? "Reconnect" : "Connected"}
        </span>
      </div>
      {needsRefresh ? (
        <button
          onClick={() => showToast(`🔄 Reconnecting ${acc.handle}…`, "brand")}
          style={{ padding:"9px 20px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(135deg,#6366F1,#4F46E5)", color:"#fff", border:"none", whiteSpace:"nowrap", flexShrink:0, boxShadow:"0 2px 10px rgba(99,102,241,.35)" }}>
          Reconnect
        </button>
      ) : (
        <button
          onClick={() => showToast(`Managing ${acc.handle}…`, "brand")}
          style={{ padding:"9px 20px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60", whiteSpace:"nowrap", flexShrink:0, transition:"all .14s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#F97316"; (e.currentTarget as HTMLButtonElement).style.color="#F97316"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#E2E4F0"; (e.currentTarget as HTMLButtonElement).style.color="#3D3F60"; }}>
          {/* Manage asd */}
        </button>
      )}
    </div>
  );
}

// ── Connect Modal ──────────────────────────────────────────────────────────
function ConnectModal({ p, mode, onAuthorize, onClose, authorizing }: { p: Platform; mode: string; onAuthorize: () => void; onClose: () => void; authorizing: boolean }) {
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 22px", borderBottom:"1px solid #E2E4F0" }}>
        <div style={{ width:54, height:54, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:25, color:"#fff", flexShrink:0, background:p.grad }}>
          <i className={p.icon} />
        </div>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{mode==="reconnect"?"Reconnect":"Connect"} {p.name}</div>
          <div style={{ fontSize:12, color:"#8486AB", marginTop:2 }}>Secure OAuth 2.0 · We never store your password</div>
        </div>
      </div>
      <div style={{ padding:"18px 22px" }}>
        {["Click Authorize — you'll be securely redirected to "+p.name, "Log in to "+p.name+" if prompted and approve Shoutly AI", "Grant the required permissions for AI posting to work", "Redirected back automatically — your account goes live instantly ✅"].map((step, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:i<3?"1px solid #ECEDF8":undefined }}>
            <div style={{ width:26, height:26, borderRadius:8, background:"#EEEEFF", color:"#F97316", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"Sora,sans-serif", marginTop:1 }}>{i+1}</div>
            <div style={{ fontSize:12.5, color:"#3D3F60", lineHeight:1.5 }}>{step}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:"0 22px 14px" }}>
        <div style={{ fontSize:10.5, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", color:"#8486AB", marginBottom:7 }}>Permissions Requested</div>
        {p.perms.map(pr => (
          <div key={pr} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", fontSize:12.5, color:"#3D3F60" }}>
            <i className="fa-solid fa-circle-check" style={{ color:"#10B981", fontSize:11, flexShrink:0 }} />{pr}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, padding:"14px 22px", borderTop:"1px solid #E2E4F0", background:"#F0F1F9" }}>
        <button onClick={onClose} disabled={authorizing} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={onAuthorize} disabled={authorizing} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", opacity:authorizing?0.7:1 }}>
          <i className={authorizing ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-lock"} style={{ marginRight:6 }} />
          {authorizing ? "Redirecting…" : `Authorize ${p.name}`}
        </button>
      </div>
    </>
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
      <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:6 }}>
        {[{icon:"fa-xmark",col:"#EF4444",txt:`All queued posts for ${p.name} will be paused`},{icon:"fa-xmark",col:"#EF4444",txt:"API token & access revoked immediately"},{icon:"fa-xmark",col:"#EF4444",txt:"Analytics sync will stop"},{icon:"fa-check",col:"#10B981",txt:"Post history & content drafts are preserved"},{icon:"fa-check",col:"#10B981",txt:"Reconnect anytime with one click"}].map(r => (
          <div key={r.txt} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 11px", borderRadius:8, background:"#F0F1F9", border:"1px solid #ECEDF8", fontSize:12.5, color:"#3D3F60" }}>
            <i className={`fa-solid ${r.icon}`} style={{ fontSize:11, color:r.col, flexShrink:0, width:13, textAlign:"center" }} />{r.txt}
          </div>
        ))}
        <div style={{ fontSize:11, color:"#BFC1D9", marginTop:4 }}>
          Note: no disconnect API exists on the backend yet — this will only update what you see here, not revoke access with {p.name}.
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SocialAccountsPage() {
  const [plats, setPlats] = useState<Platform[]>(INIT_PLATS);
  const [liveAccounts, setLiveAccounts] = useState<ConnectedAccount[]>([]);
  const [totals, setTotals] = useState<{ totalFollowers: number; avgEngagementRate: number } | null>(null);
  const [modal, setModal] = useState<{ type: ModalType; platId?: string; mode?: string }>({ type: null });
  const [authorizing, setAuthorizing] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [syncing, setSyncing] = useState(false);
  const { toasts, show: showToast, remove: removeToast } = useToasts();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Pulls connection-status + accounts-overview and merges into `plats` / `liveAccounts`
  const loadAccountsAndAnalytics = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
    if (!token) return;

    try {
      const [statusRes, overviewRes] = await Promise.all([
        getConnectionStatus(),
        getAccountsOverview(),
      ]);

      const statusByPlatform: Record<string, any> = {};
      (statusRes?.platforms || []).forEach((p: any) => { statusByPlatform[p.platform] = p; });
      const overviewByPlatform = overviewRes?.platforms || {};

      setPlats(prev => prev.map(p => {
        const backendKey = Object.keys(BACKEND_TO_ID).find(k => BACKEND_TO_ID[k] === p.id);
        if (!backendKey) return p; // unsupported platform, leave static/disabled

        const status = statusByPlatform[backendKey];
        const overview = overviewByPlatform[backendKey];

        if (!status || !status.connected) {
          return { ...p, status: "disconnected" as PlatStatus, accountCount: 0, lastSync: "—", publishing: "—" as const };
        }

        const acc = status.accounts?.[0];
        return {
          ...p,
          status: "connected" as PlatStatus,
          accountCount: status.accounts?.length ?? 0,
          lastSync: acc?.lastSync ? new Date(acc.lastSync).toLocaleString() : "—",
          publishing: "active" as const,
        };
      }));

      // Build the flat connected-accounts list. Role/health/connectedDate/workspace
      // have no backend source today — placeholders are marked below.
      const built: ConnectedAccount[] = [];
      (statusRes?.platforms || []).forEach((p: any) => {
        if (!p.connected) return;
        const meta = plats.find(m => BACKEND_TO_ID[p.platform] === m.id) ?? INIT_PLATS.find(m => BACKEND_TO_ID[p.platform] === m.id);
        if (!meta) return;
        const overview = overviewByPlatform[p.platform];

        (p.accounts || []).forEach((acc: any) => {
          built.push({
            id: acc.id,
            brandName: "Your Workspace",       // placeholder — no brand/org field in schema
            brandInitials: "YW",
            brandColor: "#7C3AED",
            platformId: BACKEND_TO_ID[p.platform],
            platformIcon: meta.icon,
            platformColor: meta.color,
            platformGrad: meta.grad,
            handle: acc.username ? `@${acc.username}` : "Connected Account",
            accountType: "Account",             // placeholder — page/profile/channel type not stored
            followers: overview?.followers != null ? `${overview.followers} followers` : "",
            role: "Owner",                      // placeholder — no per-account role field
            health: acc.status === "active" ? "Healthy" : "Needs refresh",
            connectedDate: "—",                 // placeholder — createdAt isn't returned by connection-status today
            lastSync: acc.lastSync ? new Date(acc.lastSync).toLocaleString() : "—",
            publishing: acc.status === "active" ? "active" : "at risk",
            permissions: meta.perms,
            workspace: "Your Workspace",
          });
        });
      });
      setLiveAccounts(built);

      setTotals(overviewRes?.totals
        ? { totalFollowers: overviewRes.totals.totalFollowers, avgEngagementRate: overviewRes.totals.avgEngagementRate }
        : null);
    } catch (err) {
      console.error("Failed to load account status/analytics:", err);
      showToast("Couldn't load account data. Try refreshing.", "red");
    }
  };

  // On mount: finalize an OAuth redirect if we just came back from Outstand, then load real data
  useEffect(() => {
    const sessionToken = searchParams.get("session_token"); // Facebook — snake_case in URL
    const accountId = searchParams.get("account_id");       // Instagram / LinkedIn

    const finalize = async () => {
      try {
        if (sessionToken) {
          await handlePlatformCallback({ sessionToken });
          showToast("✅ Account connected successfully!", "green");
        } else if (accountId) {
          await handlePlatformCallback({
            account_id: accountId,
            network_unique_id: searchParams.get("network_unique_id") ?? undefined,
            username: searchParams.get("username") ?? undefined,
            network: searchParams.get("network") ?? undefined,
          });
          showToast("✅ Account connected successfully!", "green");
        }
      } catch (err: any) {
        showToast(err.message || "❌ Failed to finalize connection", "red");
      } finally {
        if (sessionToken || accountId) {
          router.replace("/dashboards/settings/accounts");
        }
        loadAccountsAndAnalytics();
      }
    };

    finalize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connCount = plats.filter(p => p.status === "connected").length;
  const attnCount = plats.filter(p => p.status === "attention").length;
  const totalAccs = liveAccounts.length;
  const healthyAccs = liveAccounts.filter(a => a.health === "Healthy").length;

  const openConnect = (platId: string, mode = "connect") => {
    if (!SUPPORTED_IDS.has(platId)) {
      showToast("This platform isn't available to connect yet.", "amber" as any);
      return;
    }
    setModal({ type:"connect", platId, mode });
  };
  const openDisconnect = (platId: string) => setModal({ type:"disconnect", platId });
  const closeModal = () => { if (!authorizing) setModal({ type:null }); };

  // Redirects the browser to Outstand's OAuth page for the given platform
  const startOAuth = async (platId: string) => {
    const network = PLATFORM_CONNECT_NAME[platId];
    if (!network) {
      showToast("This platform isn't available to connect yet.", "red");
      return;
    }
    setAuthorizing(true);
    try {
      const { redirectUrl } = await getConnectUrl(network);
      window.location.href = redirectUrl;
    } catch (err: any) {
      showToast(err.message || "Connect failed. Please try again.", "red");
      setAuthorizing(false);
    }
  };

  // No backend disconnect endpoint yet — this is a local-only UI update
  const confirmDisconnect = (platId: string) => {
    setPlats(prev => prev.map(p => p.id !== platId ? p : { ...p, status:"disconnected" as PlatStatus, accountCount:0, publishing:"—" as const }));
    setLiveAccounts(prev => prev.filter(a => a.platformId !== platId));
    closeModal();
    showToast(`🔌 ${platId} disconnected locally (not yet revoked server-side).`, "red");
  };

  const syncAll = () => {
    if (syncing) return;
    setSyncing(true);
    showToast("🔄 Refreshing connected accounts…", "brand");
    loadAccountsAndAnalytics().finally(() => {
      setSyncing(false);
      showToast("✅ Accounts refreshed!", "green");
    });
  };

  const filteredAccounts = liveAccounts.filter(a =>
    searchQ === "" ||
    a.brandName.toLowerCase().includes(searchQ.toLowerCase()) ||
    a.handle.toLowerCase().includes(searchQ.toLowerCase()) ||
    a.platformId.toLowerCase().includes(searchQ.toLowerCase())
  );

  const workspaceGroups = filteredAccounts.reduce<Record<string, ConnectedAccount[]>>((acc, a) => {
    if (!acc[a.workspace]) acc[a.workspace] = [];
    acc[a.workspace].push(a);
    return acc;
  }, {});

  const activePlat = plats.find(p => p.id === modal.platId);
  const toastColors: Record<string, string> = { default:"#0F1117", green:"#059669", red:"#EF4444", brand:"#F97316", amber:"#F59E0B" };

  const sortedPlats = [...plats].sort((a, b) => {
    const order: Record<PlatStatus, number> = { attention:0, connected:1, disconnected:2 };
    return order[a.status] - order[b.status];
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #E2E4F0; border-radius: 3px; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes connectedGlow { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)} 50%{box-shadow:0 0 0 6px rgba(16,185,129,0)} }
        @keyframes toastSlide { from{transform:translateX(120%)} to{transform:translateX(0)} }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <AdminHeader pageTitle="Social Accounts" searchPlaceholder="Search accounts…" />

        <div style={{ flex:1, overflowY:"auto", padding:"28px 28px 48px" }}>

          {/* ── Page title ── */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:20 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif", letterSpacing:"-.5px", marginBottom:5 }}>Social Media Accounts</h1>
              <p style={{ fontSize:13.5, color:"#8486AB", maxWidth:460, lineHeight:1.55 }}>Connect your social media accounts once and let AI publish content automatically across every platform.</p>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0, marginTop:4 }}>
              <button onClick={syncAll} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>
                <i className="fa-solid fa-rotate" style={{ fontSize:11, animation:syncing?"spin .6s linear infinite":undefined }} /> Refresh connections
              </button>
              <button onClick={() => openConnect("ig")} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", boxShadow:"0 4px 14px rgba(249,115,22,.4)" }}>
                <i className="fa-solid fa-plus" style={{ fontSize:11 }} /> Connect account
              </button>
            </div>
          </div>

          {/* ── Health status card ── */}
          <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:14, marginBottom:28, overflow:"hidden" }}>
            <div style={{ padding:"18px 22px 16px", borderBottom: attnCount > 0 ? "1px dashed #E2E4F0" : undefined }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background: attnCount > 0 ? "#FFFBEB" : "#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color: attnCount > 0 ? "#F59E0B" : "#10B981", flexShrink:0, marginTop:2 }}>
                    <i className={attnCount > 0 ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-shield-halved"} />
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:3 }}>
                      {attnCount > 0 ? "Almost everything is healthy" : "Everything is healthy"}
                    </div>
                    <div style={{ fontSize:12.5, color:"#8486AB", lineHeight:1.4 }}>
                      {attnCount > 0 ? `${attnCount} platform${attnCount!==1?"s":""} need${attnCount===1?"s":""} a quick reconnect — publishing continues everywhere else.` : "All connected platforms are publishing normally."}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:0, flexShrink:0 }}>
                  {[
                    { v:`${connCount}/${SUPPORTED_IDS.size}`, l:"PLATFORMS" },
                    { v:String(totalAccs), l:"ACCOUNTS" },
                    { v:String(healthyAccs), l:"HEALTHY" },
                    { v:String(attnCount), l:"NEEDS ATTENTION", warn:true },
                    { v: totals ? totals.totalFollowers.toLocaleString() : "—", l:"TOTAL FOLLOWERS", green:true },
                  ].map((s, i, arr) => (
                    <div key={s.l} style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingRight:i<arr.length-1?20:0, marginRight:i<arr.length-1?20:0, borderRight:i<arr.length-1?"1px solid #ECEDF8":undefined }}>
                      <div style={{ fontSize:20, fontWeight:900, fontFamily:"Sora,sans-serif", color:s.warn?"#F59E0B":s.green?"#059669":"#0B0C1A", letterSpacing:"-.5px" }}>{s.v}</div>
                      <div style={{ fontSize:9.5, fontWeight:700, color:"#BFC1D9", letterSpacing:".5px", marginTop:2, textTransform:"uppercase" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {attnCount > 0 && (
              <div style={{ padding:"12px 22px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ flex:1, fontSize:13, color:"#3D3F60" }}>
                  Some platforms need attention. <span style={{ color:"#8486AB" }}>Reconnect them to avoid paused posts.</span>
                </span>
              </div>
            )}
          </div>

          {/* ── Supported Platforms ── */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Supported platforms</h2>
              <span style={{ fontSize:12, color:"#8486AB" }}>Connected platforms appear first</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
              {sortedPlats.map(p => (
                <PlatCard key={p.id} p={p} onConnect={openConnect} onDisconnect={openDisconnect} showToast={showToast} />
              ))}
            </div>
          </div>

          {/* ── Connected Accounts ── */}
          <div style={{ marginBottom:32 }}>
            {Object.keys(workspaceGroups).length === 0 ? (
              <div style={{ background:"#fff", border:"1px dashed #E2E4F0", borderRadius:16, padding:"40px 24px", textAlign:"center", color:"#8486AB", fontSize:13.5 }}>
                No accounts connected yet. Connect a platform above to get started.
              </div>
            ) : Object.entries(workspaceGroups).map(([ws, accounts]) => {
              const needsAttn = accounts.filter(a => a.health === "Needs refresh").length;
              const connectedCount = accounts.filter(a => a.health === "Healthy").length;
              return (
                <div key={ws} style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:16, overflow:"hidden", marginBottom:20, boxShadow:"0 1px 4px rgba(11,12,26,.04)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"20px 24px 14px", borderBottom:"1px solid #F0F1F9" }}>
                    <div>
                      <h2 style={{ fontSize:17, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:5 }}>Connected accounts</h2>
                      <p style={{ fontSize:13, color:"#8486AB" }}>
                        {connectedCount} of {accounts.length} networks connected. Posts publish to every connected profile.
                      </p>
                    </div>
                    {needsAttn > 0 ? (
                      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:20, background:"#FFF7ED", border:"1px solid #FDBA74", flexShrink:0 }}>
                        <span style={{ width:7, height:7, borderRadius:"50%", background:"#F97316", display:"inline-block" }} />
                        <span style={{ fontSize:12, fontWeight:700, color:"#EA580C", fontFamily:"Sora,sans-serif" }}>{needsAttn} need{needsAttn===1?"s":""} attention</span>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 13px", borderRadius:20, background:"#ECFDF5", border:"1px solid rgba(16,185,129,.25)", flexShrink:0 }}>
                        <span style={{ width:7, height:7, borderRadius:"50%", background:"#10B981", display:"inline-block" }} />
                        <span style={{ fontSize:12, fontWeight:700, color:"#059669", fontFamily:"Sora,sans-serif" }}>All systems healthy</span>
                      </div>
                    )}
                  </div>
                  <div>
                    {accounts.map((acc, i) => (
                      <AccountRow key={acc.id} acc={acc} showToast={showToast} isLast={i === accounts.length - 1} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── AI Recommendations (static — no backend source yet) ── */}
          {/* <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:14 }}>AI recommendations</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {AI_RECS.map(r => (
                <div key={r.id} style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:r.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>
                    <i className={r.icon} style={{ color:r.iconColor }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:700, color:"#0B0C1A", marginBottom:2 }}>{r.title}</div>
                    <div style={{ fontSize:12, color:"#8486AB", lineHeight:1.4 }}>{r.desc}</div>
                  </div>
                  <button
                    onClick={() => showToast(`${r.action}…`,"brand")}
                    style={{ padding:"8px 18px", borderRadius:8, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:r.primary?"linear-gradient(115deg,#F97316,#EA580C)":"#fff", color:r.primary?"#fff":"#3D3F60", border:r.primary?"none":"1.5px solid #E2E4F0", whiteSpace:"nowrap", flexShrink:0, boxShadow:r.primary?"0 2px 10px rgba(249,115,22,.3)":undefined }}
                  >
                    {r.action}
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          {/* ── Security + Recent Activity ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:14, padding:"22px 24px" }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:14 }}>Security</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                {[
                  { icon:"fa-solid fa-shield-halved", txt:"Secure sign-in with each platform — Shoutly never sees your passwords" },
                  { icon:"fa-solid fa-lock", txt:"Connection credentials are encrypted at rest" },
                  { icon:"fa-solid fa-check", txt:"No password storage — revoke access anytime from here" },
                ].map(s => (
                  <div key={s.txt} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:"#3D3F60" }}>
                    <i className={s.icon} style={{ color:"#10B981", fontSize:13, marginTop:1, flexShrink:0 }} />
                    <span>{s.txt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:14, padding:"22px 24px" }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:14 }}>Recent activity</h3>
              <div style={{ display:"flex", flexDirection:"column" }}>
                {RECENT_ACT.map((a, i) => (
                  <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:i<RECENT_ACT.length-1?"1px solid #F0F1F9":undefined }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:a.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", flexShrink:0 }}>
                      <i className={a.icon} />
                    </div>
                    <span style={{ flex:1, fontSize:12.5, color:"#3D3F60", minWidth:0 }}>{a.text}</span>
                    <span style={{ fontSize:11, color:"#BFC1D9", whiteSpace:"nowrap", fontFamily:"JetBrains Mono,monospace" }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal ── */}
      {modal.type && (
        <div
          id="modal-bg"
          onClick={e => { if ((e.target as HTMLElement).id==="modal-bg") closeModal(); }}
          style={{ position:"fixed", inset:0, background:"rgba(11,12,26,.5)", backdropFilter:"blur(10px)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:20, animation:"fadeIn .18s ease" }}
        >
          <div style={{ background:"#fff", border:"1px solid #E2E4F0", borderRadius:20, width:"100%", maxWidth:"500px", overflow:"hidden", boxShadow:"0 32px 80px rgba(11,12,26,.2)", animation:"scaleIn .22s cubic-bezier(.34,1.56,.64,1)", position:"relative" }}>
            {modal.type==="connect" && activePlat && <ConnectModal p={activePlat} mode={modal.mode||"connect"} onAuthorize={() => startOAuth(activePlat.id)} onClose={closeModal} authorizing={authorizing} />}
            {modal.type==="disconnect" && activePlat && <DisconnectModal p={activePlat} onConfirm={() => confirmDisconnect(activePlat.id)} onClose={closeModal} />}
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:8, zIndex:999, pointerEvents:"none" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:12, background:toastColors[t.type]||"#0F1117", color:"#fff", fontSize:13, fontWeight:600, boxShadow:"0 20px 50px rgba(11,12,26,.14)", animation:"toastSlide .3s cubic-bezier(.34,1.56,.64,1)", pointerEvents:"all", maxWidth:340, border:"1px solid rgba(255,255,255,.08)" }}>
            <span style={{ flex:1 }}>{t.msg}</span>
            <span onClick={() => removeToast(t.id)} style={{ opacity:.6, cursor:"pointer", padding:"2px 4px", marginLeft:"auto", flexShrink:0, pointerEvents:"all" }}>✕</span>
          </div>
        ))}
      </div>
    </>
  );
}