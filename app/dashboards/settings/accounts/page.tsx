"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminHeader from "../../AdminHeader";
import { getFacebookAuthUrl, getFacebookPages } from "@/api/facebookApi";

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
  platformId: string; platformIcon: string; platformColor: string;
  handle: string; accountType: string; role: "Admin" | "Owner" | "Member";
  health: "Healthy" | "Needs refresh";
  connectedDate: string; lastSync: string; publishing: "active" | "at risk";
  permissions: string[]; workspace: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
const INIT_PLATS: Platform[] = [
  { id:"fb", name:"Facebook", icon:"fa-brands fa-facebook", color:"#1877F2", grad:"linear-gradient(135deg,#1877F2,#0C52C5)", desc:"Reach billions via Pages, Groups & Reels", perms:["Manage Facebook Pages","Publish posts & reels","Access Page analytics","Moderate comments"], status:"attention", accountCount:1, lastSync:"3d ago", publishing:"at risk", features:[{label:"Posts",enabled:true},{label:"Reels",enabled:true},{label:"Stories",enabled:true}] },
  { id:"li", name:"LinkedIn", icon:"fa-brands fa-linkedin", color:"#0A66C2", grad:"linear-gradient(135deg,#0A66C2,#0853A0)", desc:"Professional network for B2B growth", perms:["Share posts & articles","Manage Company Page","View follower analytics","Post on behalf of company"], status:"connected", accountCount:2, lastSync:"2h ago", publishing:"active", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true},{label:"Stories",enabled:false}] },
  { id:"ig", name:"Instagram", icon:"fa-brands fa-instagram", color:"#E1306C", grad:"linear-gradient(135deg,#F77737,#E1306C,#C13584,#833AB4)", desc:"Share photos, Reels & Stories with 2B+ users", perms:["Publish photos & videos","Read post insights","Manage comments","Access follower data"], status:"connected", accountCount:2, lastSync:"10 min ago", publishing:"active", features:[{label:"Posts",enabled:true},{label:"Reels",enabled:true},{label:"Stories",enabled:true}] },
  { id:"x", name:"X", icon:"fa-brands fa-x-twitter", color:"#1A1A1A", grad:"linear-gradient(135deg,#1A1A1A,#444)", desc:"Real-time conversations & viral reach", perms:["Post & schedule tweets","Read account timeline","Access engagement metrics","Manage replies"], status:"connected", accountCount:1, lastSync:"1h ago", publishing:"active", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true},{label:"Reels",enabled:false}] },
  { id:"tk", name:"TikTok", icon:"fa-brands fa-tiktok", color:"#010101", grad:"linear-gradient(135deg,#010101,#EE1D52,#69C9D0)", desc:"Short-form video for Gen-Z reach", perms:["Upload short videos","Read profile & followers","Access video analytics"], status:"connected", accountCount:1, lastSync:"25 min ago", publishing:"active", features:[{label:"Reels",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true},{label:"Stories",enabled:false}] },
  { id:"pi", name:"Pinterest", icon:"fa-brands fa-pinterest", color:"#E60023", grad:"linear-gradient(135deg,#E60023,#AD0019)", desc:"Visual discovery for 450M+ monthly users", perms:["Create & schedule pins","Access analytics","Manage boards","Read audience insights"], status:"connected", accountCount:1, lastSync:"4h ago", publishing:"active", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Schedule",enabled:true}] },
  { id:"yt", name:"YouTube", icon:"fa-brands fa-youtube", color:"#FF0000", grad:"linear-gradient(135deg,#FF0000,#CC0000)", desc:"World's largest video platform", perms:["Upload & schedule videos","Manage channel","Post community updates","Read analytics"], status:"connected", accountCount:1, lastSync:"1h ago", publishing:"active", features:[{label:"Reels",enabled:true},{label:"Analytics",enabled:true},{label:"Comments",enabled:true}] },
  { id:"gb", name:"Google Business", icon:"fa-brands fa-google", color:"#4285F4", grad:"linear-gradient(135deg,#4285F4,#1A6CF0)", desc:"Manage your local Google presence", perms:["Publish business updates","Respond to reviews","Post offers & events","View insights"], status:"connected", accountCount:1, lastSync:"6h ago", publishing:"active", features:[{label:"Posts",enabled:true},{label:"Analytics",enabled:true},{label:"Schedule",enabled:true},{label:"Reels",enabled:false}] },
];

const WORKSPACE_ACCOUNTS: ConnectedAccount[] = [
  { id:"a1", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"fb", platformIcon:"fa-brands fa-facebook", platformColor:"#1877F2", handle:"BrightFit Studio", accountType:"Page", role:"Admin", health:"Needs refresh", connectedDate:"Mar 2025", lastSync:"3d ago", publishing:"at risk", workspace:"BrightFit Studio", permissions:["Can publish posts","Can publish reels","Can publish stories","Can read analytics","Can reply to comments","Can schedule"] },
  { id:"a2", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"ig", platformIcon:"fa-brands fa-instagram", platformColor:"#E1306C", handle:"@brightfit.studio", accountType:"Profile", role:"Owner", health:"Healthy", connectedDate:"Mar 2025", lastSync:"10 min ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish posts","Can publish reels","Can publish stories","Can read analytics","Can reply to comments","Can schedule"] },
  { id:"a3", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"li", platformIcon:"fa-brands fa-linkedin", platformColor:"#0A66C2", handle:"brightfit-studio", accountType:"Company", role:"Admin", health:"Healthy", connectedDate:"Apr 2025", lastSync:"2h ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish posts","Can read analytics","Can reply to comments","Can schedule"] },
  { id:"a4", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"tk", platformIcon:"fa-brands fa-tiktok", platformColor:"#010101", handle:"@brightfit", accountType:"Profile", role:"Owner", health:"Healthy", connectedDate:"May 2025", lastSync:"25 min ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish reels","Can read analytics","Can reply to comments","Can schedule"] },
  { id:"a5", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"yt", platformIcon:"fa-brands fa-youtube", platformColor:"#FF0000", handle:"@BrightFitStudio", accountType:"Channel", role:"Owner", health:"Healthy", connectedDate:"Mar 2025", lastSync:"1h ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish videos","Can read analytics","Can reply to comments","Can schedule"] },
  { id:"a6", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"x", platformIcon:"fa-brands fa-x-twitter", platformColor:"#1A1A1A", handle:"@BrightFitStudio", accountType:"Profile", role:"Owner", health:"Healthy", connectedDate:"Mar 2025", lastSync:"1h ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish posts","Can read analytics","Can reply to comments","Can schedule"] },
  { id:"a7", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"pi", platformIcon:"fa-brands fa-pinterest", platformColor:"#E60023", handle:"@brightfitstudio", accountType:"Business", role:"Admin", health:"Healthy", connectedDate:"Jun 2025", lastSync:"4h ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish pins","Can read analytics","Can schedule"] },
  { id:"a8", brandName:"BrightFit Studio", brandInitials:"BS", brandColor:"#7C3AED", platformId:"gb", platformIcon:"fa-brands fa-google", platformColor:"#4285F4", handle:"BrightFit Studio", accountType:"Business Profile", role:"Admin", health:"Healthy", connectedDate:"May 2025", lastSync:"6h ago", publishing:"active", workspace:"BrightFit Studio", permissions:["Can publish posts","Can read analytics","Can schedule"] },
  { id:"b1", brandName:"Wellness Hub", brandInitials:"WH", brandColor:"#059669", platformId:"ig", platformIcon:"fa-brands fa-instagram", platformColor:"#E1306C", handle:"@wellnesshub", accountType:"Profile", role:"Owner", health:"Healthy", connectedDate:"May 2025", lastSync:"15 min ago", publishing:"active", workspace:"Wellness Hub", permissions:["Can publish posts","Can publish reels","Can read analytics","Can schedule"] },
  { id:"b2", brandName:"Wellness Hub", brandInitials:"WH", brandColor:"#059669", platformId:"tk", platformIcon:"fa-brands fa-tiktok", platformColor:"#010101", handle:"@wellnesshub", accountType:"Profile", role:"Owner", health:"Healthy", connectedDate:"Jun 2025", lastSync:"30 min ago", publishing:"active", workspace:"Wellness Hub", permissions:["Can publish reels","Can read analytics","Can schedule"] },
  { id:"b3", brandName:"Wellness Hub", brandInitials:"WH", brandColor:"#059669", platformId:"pi", platformIcon:"fa-brands fa-pinterest", platformColor:"#E60023", handle:"@wellnesshub", accountType:"Business", role:"Admin", health:"Healthy", connectedDate:"Jun 2025", lastSync:"5h ago", publishing:"active", workspace:"Wellness Hub", permissions:["Can publish pins","Can read analytics","Can schedule"] },
];

const AI_RECS = [
  { id:"r1", icon:"fa-brands fa-facebook", iconBg:"#EEF2FF", iconColor:"#1877F2", title:"Reconnect Facebook to avoid failed publishing.", desc:"The security token expires Wednesday — it takes about 20 seconds.", action:"Reconnect", primary:true },
  { id:"r2", icon:"fa-brands fa-threads", iconBg:"#F0F1F9", iconColor:"#1A1A1A", title:"Connect Threads to increase your reach.", desc:"Your Instagram audience overlaps ~80% — same content, extra reach, zero effort.", action:"Connect Threads", primary:false },
  { id:"r3", icon:"fa-brands fa-youtube", iconBg:"#FEF2F2", iconColor:"#FF0000", title:"Your YouTube channel supports Shorts.", desc:"Shoutly can repurpose your 12 recent Reels into Shorts automatically.", action:"Enable Shorts", primary:false },
  { id:"r4", icon:"fa-brands fa-linkedin", iconBg:"#EFF6FF", iconColor:"#0A66C2", title:"You've connected LinkedIn but only scheduled 2 posts.", desc:"Your B2B audience is most active Tue–Thu mornings.", action:"Schedule posts", primary:false },
];

const RECENT_ACT = [
  { id:"t1", icon:"fa-brands fa-instagram", iconBg:"linear-gradient(135deg,#F77737,#E1306C)", text:"Instagram · @brightfit.studio synced", time:"10 min ago" },
  { id:"t2", icon:"fa-brands fa-linkedin", iconBg:"#0A66C2", text:"LinkedIn refreshed automatically", time:"2h ago" },
  { id:"t3", icon:"fa-brands fa-youtube", iconBg:"#FF0000", text:"YouTube permissions updated — Shorts enabled", time:"Yesterday" },
  { id:"t4", icon:"fa-solid fa-cloud", iconBg:"#1DA1F2", text:"Bluesky connected", time:"Jul 2" },
  { id:"t5", icon:"fa-brands fa-facebook", iconBg:"#1877F2", text:"Facebook token expiry warning issued", time:"Jul 2" },
  { id:"t6", icon:"fa-brands fa-google", iconBg:"#4285F4", text:"Google Business reauthorized", time:"Jun 28" },
  { id:"t7", icon:"fa-brands fa-pinterest", iconBg:"#E60023", text:"Pinterest board access granted", time:"Jun 24" },
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

  return (
    <div
      style={{ background:"#fff", border:`1px solid ${isAttn?"rgba(245,158,11,.25)":isConn?"rgba(16,185,129,.15)":"#E2E4F0"}`, borderRadius:12, overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 1px 4px rgba(11,12,26,.04)", transition:"all .18s" }}
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
          {isAttn?"Attention":isConn?"Connected":"Not Connected"}
        </span>
      </div>

      {/* Account info */}
      {isActive && (
        <div style={{ padding:"0 16px 10px" }}>
          <div style={{ fontSize:12, color:"#8486AB" }}>{p.accountCount} account{p.accountCount!==1?"s":""} · synced {p.lastSync}</div>
          <div style={{ fontSize:12, marginTop:3 }}>
            Publishing: <span style={{ fontWeight:700, color:p.publishing==="at risk"?"#F59E0B":"#059669" }}>{p.publishing}</span>
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
        {isAttn ? (
          <button onClick={() => onConnect(p.id,"reconnect")} style={{ width:"100%", padding:"9px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", boxShadow:"0 2px 8px rgba(249,115,22,.3)" }}>
            Reconnect
          </button>
        ) : isConn ? (
          <button
            onClick={() => showToast(`Managing ${p.name}…`,"brand")}
            style={{ width:"100%", padding:"9px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60", transition:"all .14s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#F97316"; (e.currentTarget as HTMLButtonElement).style.color="#F97316"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="#E2E4F0"; (e.currentTarget as HTMLButtonElement).style.color="#3D3F60"; }}
          >
            Manage
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
function AccountRow({ acc, showToast }: { acc: ConnectedAccount; showToast: (m: string, t?: string) => void }) {
  const needsRefresh = acc.health === "Needs refresh";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const moreItems = [
    { icon:"fa-chart-simple", label:"View Analytics", danger:false, action:() => { showToast("📊 Opening analytics…","brand"); setMoreOpen(false); } },
    { icon:"fa-rotate", label:"Force Sync Now", danger:false, action:() => { showToast(`🔄 Syncing ${acc.handle}…`,"brand"); setMoreOpen(false); } },
    { icon:"fa-calendar-check", label:"View Scheduled Posts", danger:false, action:() => { showToast("📅 Opening queue…","brand"); setMoreOpen(false); } },
    { icon:"fa-pen", label:"Edit Account Settings", danger:false, action:() => { showToast("⚙️ Opening settings…","brand"); setMoreOpen(false); } },
    { icon:"fa-unlink", label:"Disconnect This Account", danger:true, action:() => { showToast("🔌 Disconnecting…","red"); setMoreOpen(false); } },
  ];

  return (
    <div style={{ background:"#fff", border:`1px solid ${needsRefresh?"rgba(245,158,11,.2)":"#E2E4F0"}`, borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"flex-start", gap:14 }}>
      {/* Avatar */}
      <div style={{ position:"relative", flexShrink:0 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:acc.brandColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#fff", fontFamily:"Sora,sans-serif" }}>
          {acc.brandInitials}
        </div>
        <div style={{ position:"absolute", bottom:-2, right:-2, width:18, height:18, borderRadius:5, background:acc.platformColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff", border:"2px solid #fff" }}>
          <i className={acc.platformIcon} />
        </div>
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>{acc.brandName}</span>
          <span style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:needsRefresh?"#FFFBEB":"#ECFDF5", color:needsRefresh?"#B45309":"#059669" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0, display:"inline-block" }} />
            {acc.health}
          </span>
          <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:"#F0F1F9", color:"#8486AB" }}>{acc.role}</span>
        </div>
        <div style={{ fontSize:12, color:"#8486AB", marginBottom:5 }}>
          <i className={acc.platformIcon} style={{ marginRight:4, fontSize:11 }} />
          {acc.handle} · {acc.accountType}
        </div>
        <div style={{ fontSize:11.5, color:"#8486AB", marginBottom:8 }}>
          Connected {acc.connectedDate} &nbsp;·&nbsp; Last sync {acc.lastSync} &nbsp;·&nbsp; Publishing{" "}
          <span style={{ fontWeight:700, color:needsRefresh?"#F59E0B":"#059669" }}>{acc.publishing}</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {acc.permissions.map(pm => (
            <span key={pm} style={{ padding:"2px 7px", borderRadius:5, background:"#F0F1F9", border:"1px solid #E2E4F0", fontSize:11, color:"#8486AB", fontWeight:500 }}>{pm}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
        {needsRefresh ? (
          <button onClick={() => showToast(`🔄 Reconnecting ${acc.handle}…`,"brand")} style={{ padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(249,115,22,.3)" }}>
            Reconnect
          </button>
        ) : (
          <button onClick={() => showToast(`Managing ${acc.handle}…`,"brand")} style={{ padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60", whiteSpace:"nowrap" }}>
            Manage
          </button>
        )}
        {/* More dropdown */}
        <div ref={moreRef} style={{ position:"relative" }}>
          <button
            onClick={() => setMoreOpen(o => !o)}
            style={{ width:"100%", padding:"7px 16px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Sora,sans-serif", background:moreOpen?"#F0F1F9":"#fff", border:"1.5px solid #E2E4F0", color:"#8486AB", whiteSpace:"nowrap", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}
          >
            More <i className="fa-solid fa-chevron-down" style={{ fontSize:9, transition:"transform .15s", transform:moreOpen?"rotate(180deg)":"rotate(0deg)" }} />
          </button>
          {moreOpen && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 5px)", background:"#fff", border:"1px solid #E2E4F0", borderRadius:10, boxShadow:"0 8px 28px rgba(11,12,26,.13)", minWidth:210, zIndex:200, overflow:"hidden", animation:"scaleIn .15s cubic-bezier(.34,1.56,.64,1)" }}>
              {moreItems.map((item, i) => (
                <div
                  key={item.label}
                  onClick={item.action}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:"pointer", color:item.danger?"#EF4444":"#0B0C1A", fontSize:13, fontWeight:500, borderTop:i>0?"1px solid #F0F1F9":undefined, transition:"background .12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = item.danger?"#FEF2F2":"#F0F1F9"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
                >
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize:12, width:16, textAlign:"center", color:item.danger?"#EF4444":"#8486AB" }} />
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Connect Modal ──────────────────────────────────────────────────────────
function ConnectModal({ p, mode, onAuthorize, onClose }: { p: Platform; mode: string; onAuthorize: () => void; onClose: () => void }) {
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
        <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"#fff", border:"1.5px solid #E2E4F0", color:"#3D3F60" }}>Cancel</button>
        <button onClick={onAuthorize} style={{ flex:1, padding:11, borderRadius:10, fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none" }}>
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
      <div style={{ width:54, height:54, borderRadius:"50%", border:"3px solid #E2E4F0", borderTopColor:"#F97316", animation:"spin .8s linear infinite" }} />
      <div style={{ fontSize:15, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Connecting to {p.name}</div>
      <div style={{ fontSize:12, color:"#8486AB", textAlign:"center", lineHeight:1.5 }}>Complete authorization in the popup window. Usually takes a few seconds.</div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, width:"100%" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:i<step?"#10B981":i===step?"#0B0C1A":"#8486AB", fontWeight:i===step?700:400, padding:"4px 0" }}>
            <i className={i<step?"fa-solid fa-check":i===step?"fa-solid fa-circle-notch":"fa-regular fa-circle"} style={{ fontSize:11, flexShrink:0, width:14, textAlign:"center", animation:i===step?"spin .8s linear infinite":undefined, color:i<step?"#10B981":i===step?"#F97316":"#BFC1D9" }} />
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
      <div style={{ padding:"18px 22px", display:"flex", flexDirection:"column", gap:6 }}>
        {[{icon:"fa-xmark",col:"#EF4444",txt:`All queued posts for ${p.name} will be paused`},{icon:"fa-xmark",col:"#EF4444",txt:"API token & access revoked immediately"},{icon:"fa-xmark",col:"#EF4444",txt:"Analytics sync will stop"},{icon:"fa-check",col:"#10B981",txt:"Post history & content drafts are preserved"},{icon:"fa-check",col:"#10B981",txt:"Reconnect anytime with one click"}].map(r => (
          <div key={r.txt} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 11px", borderRadius:8, background:"#F0F1F9", border:"1px solid #ECEDF8", fontSize:12.5, color:"#3D3F60" }}>
            <i className={`fa-solid ${r.icon}`} style={{ fontSize:11, color:r.col, flexShrink:0, width:13, textAlign:"center" }} />{r.txt}
          </div>
        ))}
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
  const [modal, setModal] = useState<{ type: ModalType; platId?: string; mode?: string }>({ type: null });
  const [oauthStep, setOauthStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [syncing, setSyncing] = useState(false);
  const { toasts, show: showToast, remove: removeToast } = useToasts();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("fb") === "connected") {
      showToast("✅ Facebook connected successfully!", "green");
      router.replace("/dashboards/settings/accounts");
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null;
    if (!token) return;
    getFacebookPages().then(pages => {
      if (Array.isArray(pages) && pages.length > 0) {
        setPlats(prev => prev.map(p => p.id !== "fb" ? p : { ...p, status: "connected" as PlatStatus, accountCount: pages.length, publishing: "active" as const }));
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connCount = plats.filter(p => p.status === "connected").length;
  const attnCount = plats.filter(p => p.status === "attention").length;
  const totalAccs = WORKSPACE_ACCOUNTS.length;
  const healthyAccs = WORKSPACE_ACCOUNTS.filter(a => a.health === "Healthy").length;

  const openConnect = (platId: string, mode = "connect") => setModal({ type:"connect", platId, mode });
  const openDisconnect = (platId: string) => setModal({ type:"disconnect", platId });
  const closeModal = () => { setModal({ type:null }); setOauthStep(0); setShowSuccess(false); };

  const startOAuth = async (platId: string) => {
    if (platId === "fb") {
      try { const url = await getFacebookAuthUrl(); window.location.href = url; }
      catch { showToast("Facebook connect failed. Please try again.", "red"); closeModal(); }
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
        setPlats(prev => prev.map(p => p.id !== platId ? p : { ...p, status:"connected" as PlatStatus, accountCount:1, lastSync:"Just now", publishing:"active" as const }));
        setTimeout(() => { closeModal(); showToast(`✅ ${platId} connected successfully!`,"green"); }, 1900);
      }, 400);
    };
    setTimeout(tick, 800);
  };

  const confirmDisconnect = (platId: string) => {
    setPlats(prev => prev.map(p => p.id !== platId ? p : { ...p, status:"disconnected" as PlatStatus, accountCount:0, publishing:"—" as const }));
    closeModal();
    showToast(`🔌 ${platId} disconnected.`,"red");
  };

  const syncAll = () => {
    if (syncing) return;
    setSyncing(true);
    showToast("🔄 Syncing all connected accounts…","brand");
    setTimeout(() => { setSyncing(false); showToast("✅ All accounts synced!","green"); }, 2600);
  };

  const filteredAccounts = WORKSPACE_ACCOUNTS.filter(a =>
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
  const toastColors: Record<string, string> = { default:"#0F1117", green:"#059669", red:"#EF4444", brand:"#F97316" };

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
        @keyframes successPop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <AdminHeader
          pageTitle="Social Accounts"
          searchPlaceholder="Search accounts…"
        />

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
            <div style={{ padding:"18px 22px 16px", borderBottom:"1px dashed #E2E4F0" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"#FFFBEB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:"#F59E0B", flexShrink:0, marginTop:2 }}>
                    <i className="fa-solid fa-triangle-exclamation" />
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif", marginBottom:3 }}>Almost everything is healthy</div>
                    <div style={{ fontSize:12.5, color:"#8486AB", lineHeight:1.4 }}>1 account needs a quick reconnect — publishing continues everywhere else.</div>
                  </div>
                </div>
                {/* Stats */}
                <div style={{ display:"flex", gap:0, flexShrink:0 }}>
                  {[
                    { v:`${connCount+attnCount}/${plats.length}`, l:"PLATFORMS" },
                    { v:String(totalAccs), l:"ACCOUNTS" },
                    { v:String(healthyAccs), l:"HEALTHY" },
                    { v:String(attnCount), l:"NEEDS ATTENTION", warn:true },
                    { v:"Yes ✓", l:"PUBLISHING READY", green:true },
                  ].map((s, i, arr) => (
                    <div key={s.l} style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingRight:i<arr.length-1?20:0, marginRight:i<arr.length-1?20:0, borderRight:i<arr.length-1?"1px solid #ECEDF8":undefined }}>
                      <div style={{ fontSize:20, fontWeight:900, fontFamily:"Sora,sans-serif", color:s.warn?"#F59E0B":s.green?"#059669":"#0B0C1A", letterSpacing:"-.5px" }}>{s.v}</div>
                      <div style={{ fontSize:9.5, fontWeight:700, color:"#BFC1D9", letterSpacing:".5px", marginTop:2, textTransform:"uppercase" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Alert row */}
            <div style={{ padding:"12px 22px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ flex:1, fontSize:13, color:"#3D3F60" }}>
                <strong>Facebook · BrightFit Studio</strong> — token expires in 3 days.{" "}
                <span style={{ color:"#8486AB" }}>Reconnect now to avoid paused posts.</span>
              </span>
              <button onClick={() => openConnect("fb","reconnect")} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:8, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"Sora,sans-serif", background:"linear-gradient(115deg,#F97316,#EA580C)", color:"#fff", border:"none", whiteSpace:"nowrap", flexShrink:0, boxShadow:"0 2px 10px rgba(249,115,22,.3)" }}>
                Reconnect Facebook
              </button>
            </div>
          </div>

          {/* ── Supported Platforms ── */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Supported platforms</h2>
              <span style={{ fontSize:12, color:"#8486AB" }}>Connected platforms appear first</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              {sortedPlats.map(p => (
                <PlatCard key={p.id} p={p} onConnect={openConnect} onDisconnect={openDisconnect} showToast={showToast} />
              ))}
            </div>
          </div>

          {/* ── Connected Accounts ── */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Connected accounts</h2>
              <span style={{ fontSize:12, color:"#8486AB" }}>{totalAccs} accounts across {Object.keys(workspaceGroups).length} workspaces</span>
            </div>
            {/* Filters */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:"0 0 240px" }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#BFC1D9", pointerEvents:"none" }} />
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search accounts..."
                  style={{ width:"100%", padding:"9px 12px 9px 34px", borderRadius:8, border:"1.5px solid #E2E4F0", background:"#fff", fontSize:13, color:"#0B0C1A", outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif" }}
                />
              </div>
              {["All platforms","All statuses","All workspaces"].map(label => (
                <select key={label} style={{ padding:"9px 12px", borderRadius:8, border:"1.5px solid #E2E4F0", background:"#fff", fontSize:13, color:"#3D3F60", cursor:"pointer", outline:"none", fontFamily:"Plus Jakarta Sans,sans-serif" }}>
                  <option>{label}</option>
                </select>
              ))}
              <span style={{ marginLeft:"auto", fontSize:12, color:"#8486AB", fontWeight:600 }}>{filteredAccounts.length} of {totalAccs} accounts</span>
            </div>
            {/* Grouped list */}
            <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
              {Object.entries(workspaceGroups).map(([ws, accounts]) => (
                <div key={ws}>
                  <div style={{ fontSize:11, fontWeight:800, color:"#BFC1D9", letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>{ws} · {accounts.length}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {accounts.map(acc => <AccountRow key={acc.id} acc={acc} showToast={showToast} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Recommendations ── */}
          <div style={{ marginBottom:32 }}>
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
          </div>

          {/* ── Security + Recent Activity ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Security */}
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
              <div style={{ fontSize:11.5, color:"#BFC1D9", marginBottom:10 }}>Last security check: today, 6:00 AM · all clear</div>
              <span onClick={() => showToast("Opening security guide…","brand")} style={{ fontSize:12.5, color:"#F97316", fontWeight:700, cursor:"pointer" }}>
                Learn how Shoutly protects your accounts →
              </span>
            </div>

            {/* Recent Activity */}
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
            {showSuccess && (
              <div style={{ position:"absolute", inset:0, background:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, animation:"fadeIn .3s ease", borderRadius:20, zIndex:10 }}>
                <div style={{ width:76, height:76, borderRadius:"50%", background:"#ECFDF5", border:"3px solid #10B981", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, color:"#10B981", animation:"successPop .5s cubic-bezier(.34,1.56,.64,1)" }}>
                  <i className="fa-solid fa-check" />
                </div>
                <div style={{ fontSize:19, fontWeight:900, color:"#0B0C1A", fontFamily:"Sora,sans-serif" }}>Account Connected!</div>
                <div style={{ fontSize:13, color:"#8486AB", textAlign:"center", maxWidth:300, lineHeight:1.55 }}>{activePlat?.name} is live. Shoutly AI will now auto-post and schedule content.</div>
              </div>
            )}
            {modal.type==="connect" && activePlat && <ConnectModal p={activePlat} mode={modal.mode||"connect"} onAuthorize={() => startOAuth(activePlat.id)} onClose={closeModal} />}
            {modal.type==="oauthLoading" && activePlat && <OAuthLoadingModal p={activePlat} step={oauthStep} />}
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
