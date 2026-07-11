"use client";

import { useEffect, useRef, useState } from "react";
import AdminHeader from "../../AdminHeader";
import { useUserProfile } from "@/hooks/useUserProfile";
import { fetchImages } from "@/api/homeApi";
import { setUserProfile } from "@/api/authApi";

// ── Types ──────────────────────────────────────────────────────────────────
type PosKey = "tl" | "tr" | "bl" | "br";
type BadgeStyle = "glass" | "solid" | "outline" | "minimal";
type TextColor = "white" | "dark";

interface OverlayState {
  pos: PosKey;
  logoUrl: string | null;
  logoName: string;
  logoSize: string;
  primary: string;
  opacity: number;
  blur: number;
  radius: number;
  size: number;
  style: BadgeStyle;
  textColor: TextColor;
  showLogo: boolean;
  showName: boolean;
  showContact: boolean;
  showOvtext: boolean;
  showCorner: boolean;
  showTextbar: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────
const POS_CSS: Record<PosKey, React.CSSProperties> = {
  tl: { top: 12, left: 12, right: "auto", bottom: "auto" },
  tr: { top: 12, right: 12, left: "auto", bottom: "auto" },
  bl: { bottom: 12, left: 12, right: "auto", top: "auto" },
  br: { bottom: 12, right: 12, left: "auto", top: "auto" },
};
const POS_CORNER: Record<PosKey, { top?: number; bottom?: number; left?: number; right?: number; borderRadius: string }> = {
  tl: { top: 0, left: 0, borderRadius: "0 0 8px 0" },
  tr: { top: 0, right: 0, borderRadius: "0 0 0 8px" },
  bl: { bottom: 0, left: 0, borderRadius: "0 8px 0 0" },
  br: { bottom: 0, right: 0, borderRadius: "8px 0 0 0" },
};
const POS_LABELS: Record<PosKey, string> = { tl: "Top Left", tr: "Top Right", bl: "Bottom Left", br: "Bottom Right" };

const PRIMARY_SWATCHES = ["#F97316","#E1306C","#0A66C2","#10B981","#F59E0B","#EF4444","#0F1117","#ffffff"];

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=80",
  "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=700&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80",
];

const TIME_BLOCKS = [
  { icon: "fa-instagram", color: "#E1306C", bg: "rgba(225,48,108,.1)", name: "Instagram", sub: "8.7% avg engagement", times: [{ t: "8:00 AM", best: true }, { t: "12:30 PM", best: false }, { t: "7:00 PM", best: true }, { t: "9:30 PM", best: false }] },
  { icon: "fa-facebook", color: "#1877F2", bg: "rgba(24,119,242,.1)", name: "Facebook", sub: "3.8% avg engagement", times: [{ t: "9:00 AM", best: false }, { t: "1:00 PM", best: true }, { t: "3:00 PM", best: true }, { t: "7:00 PM", best: false }] },
  { icon: "fa-linkedin", color: "#0A66C2", bg: "rgba(10,102,194,.1)", name: "LinkedIn", sub: "5.4% avg engagement", times: [{ t: "8:30 AM", best: true }, { t: "12:00 PM", best: false }, { t: "5:30 PM", best: true }] },
  { icon: "fa-x-twitter", color: "#1DA1F2", bg: "rgba(29,161,242,.1)", name: "Twitter / X", sub: "4.2% avg engagement", times: [{ t: "9:00 AM", best: false }, { t: "1:00 PM", best: true }, { t: "6:00 PM", best: false }, { t: "10:00 PM", best: true }] },
  { icon: "fa-tiktok", color: "#111", bg: "rgba(0,0,0,.07)", name: "TikTok", sub: "9.1% avg engagement", times: [{ t: "9:00 AM", best: true }, { t: "12:00 PM", best: false }, { t: "6:00 PM", best: true }, { t: "9:00 PM", best: false }] },
  { icon: "fa-threads", color: "#000", bg: "rgba(0,0,0,.07)", name: "Threads", sub: "4.1% avg engagement", times: [{ t: "9:00 AM", best: false }, { t: "1:00 PM", best: true }, { t: "6:00 PM", best: false }, { t: "8:00 PM", best: true }] },
  { icon: "fa-bluesky", color: "#0085FF", bg: "rgba(0,133,255,.1)", name: "Bluesky", sub: "3.5% avg engagement", times: [{ t: "8:00 AM", best: true }, { t: "12:00 PM", best: false }, { t: "5:00 PM", best: true }, { t: "8:00 PM", best: false }] },
  { icon: "fa-youtube", color: "#FF0000", bg: "rgba(255,0,0,.08)", name: "YouTube", sub: "6.2% avg engagement", times: [{ t: "11:00 AM", best: false }, { t: "2:00 PM", best: true }, { t: "6:00 PM", best: false }] },
  { icon: "fa-pinterest", color: "#E60023", bg: "rgba(230,0,35,.1)", name: "Pinterest", sub: "2.9% avg engagement", times: [{ t: "8:00 AM", best: true }, { t: "2:00 PM", best: false }, { t: "8:00 PM", best: true }, { t: "9:00 PM", best: false }] },
  { icon: "fa-google", color: "#4285F4", bg: "rgba(66,133,244,.1)", name: "Google Business Profile", sub: "2.1% avg engagement", times: [{ t: "9:00 AM", best: false }, { t: "11:00 AM", best: true }, { t: "2:00 PM", best: false }] },
];

const APPLY_PLATFORMS = [
  { icon: "fa-instagram", color: "#E1306C", name: "Instagram", defaultOn: true },
  { icon: "fa-linkedin", color: "#0A66C2", name: "LinkedIn", defaultOn: true },
  { icon: "fa-x-twitter", color: "#1DA1F2", name: "Twitter/X", defaultOn: true },
  { icon: "fa-facebook", color: "#1877F2", name: "Facebook", defaultOn: true },
  { icon: "fa-tiktok", color: "#111", name: "TikTok", defaultOn: false },
  { icon: "fa-threads", color: "#000", name: "Threads", defaultOn: false },
  { icon: "fa-bluesky", color: "#0085FF", name: "Bluesky", defaultOn: false },
  { icon: "fa-youtube", color: "#FF0000", name: "YouTube", defaultOn: false },
  { icon: "fa-pinterest", color: "#E60023", name: "Pinterest", defaultOn: false },
  { icon: "fa-google", color: "#4285F4", name: "Google Biz", defaultOn: false },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function hexToRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3) || "5b", 16);
  const g = parseInt(hex.slice(3, 5) || "5b", 16);
  const b = parseInt(hex.slice(5, 7) || "d6", 16);
  return `rgba(${r},${g},${b},${a})`;
}

function sliderFill(pct: number): string {
  return `linear-gradient(90deg,#F97316 ${pct}%,#E4E5EF ${pct}%)`;
}


// ── Toggle component ───────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ position: "relative", width: 36, height: 20, flexShrink: 0, cursor: "pointer" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: checked ? "#F97316" : "#E4E5EF", border: `1px solid ${checked ? "#F97316" : "#E4E5EF"}`, transition: "all .2s" }} />
      <div style={{ position: "absolute", top: 3, left: checked ? 19 : 3, width: 12, height: 12, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.25)" }} />
    </div>
  );
}

// ── Toast hook ─────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: "", type: "green" });
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (msg: string, type = "green") => {
    if (t.current) clearTimeout(t.current);
    setToast({ visible: true, msg, type });
    t.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 2600);
  };
  return { toast, show };
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BrandOverlayPage() {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bgImg, setBgImg] = useState(BG_IMAGES[0]);
  const [bgOptions, setBgOptions] = useState<string[]>(BG_IMAGES);
  const [selTimes, setSelTimes] = useState<Record<string, string>>({});
  const [openSection, setOpenSection] = useState<string | null>("logo-upload");
  const toggleSection = (id: string) => setOpenSection(s => s === id ? null : id);
  const { toast, show: showToast } = useToast();


  useEffect(() => {
    let cancelled = false;
    fetchImages()
      .then((images: Array<{ file?: string; url?: string }>) => {
        if (cancelled) return;
        const urls = (images || []).map((img) => img.file || img.url || "").filter(Boolean);
        if (urls.length) {
          setBgOptions(urls);
          setBgImg(urls[0]);
        }
      })
      .catch(() => {
        // Keep the static fallback images if the live library is unreachable.
      });
    return () => { cancelled = true; };
  }, []);

  const [S, setS] = useState<OverlayState>({
    pos: "tl", logoUrl: null, logoName: "", logoSize: "",
    primary: "#F97316", opacity: 90, blur: 12, radius: 10, size: 32,
    style: "glass", textColor: "white",
    showLogo: true, showName: true, showContact: true, showOvtext: true, showCorner: false, showTextbar: false,
  });

  const [brandName, setBrandName] = useState("Your Brand");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [overlayText, setOverlayText] = useState("yourbrand.com");
  const { user } = useUserProfile();
  const [applyPlatforms, setApplyPlatforms] = useState<Record<string, boolean>>(
    Object.fromEntries(APPLY_PLATFORMS.map(p => [p.name, p.defaultOn]))
  );


  useEffect(() => {
    if (!user) return;

    const backendBrandName = typeof user.brandName === "string" ? user.brandName.trim() : "";
    const backendPhone = typeof user.phone === "string" ? user.phone.trim() : "";
    const backendWebsite = typeof user.website === "string" ? user.website.trim() : "";
    const backendLogoRaw =
      (typeof user["brandLogo"] === "string" && user["brandLogo"]) ||
      (typeof user.profilePicture === "string" && user.profilePicture) ||
      "";

    if (backendBrandName) setBrandName(backendBrandName);
    if (backendPhone) setPhone(backendPhone);
    if (backendWebsite) setOverlayText(backendWebsite);
    if (backendLogoRaw) {
      setS((prev) => ({
        ...prev,
        logoUrl: backendLogoRaw,
        logoName: prev.logoName || "Brand Logo",
        logoSize: prev.logoSize || "From profile",
      }));
    }
  }, [user]);

  const mark = () => setDirty(true);
  const updS = (patch: Partial<OverlayState>) => { setS(s => ({ ...s, ...patch })); mark(); };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      updS({ logoUrl: ev.target?.result as string, logoName: f.name, logoSize: (f.size / 1024).toFixed(1) + "KB" });
    };
    r.readAsDataURL(f);
  };

  const removeLogo = () => updS({ logoUrl: null, logoName: "", logoSize: "" });

  const saveSettings = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("shoutly_user") : null;
      const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};

      const emailToSave =
        (typeof user?.email === "string" && user.email) ||
        (typeof existing.email === "string" ? existing.email : "");

      if (!emailToSave) {
        showToast("Email is missing for profile update", "red");
        return;
      }

      const response = await setUserProfile({
        email: emailToSave,
        brandName: brandName.trim() || "Shoutly User",
        website: overlayText.trim() || "https://shoutlyai.com",
        phone: phone.trim(),
        connectedSocials: [],
      });

      const backendUser =
        (response && typeof response === "object" && "user" in (response as Record<string, unknown>))
          ? ((response as { user?: Record<string, unknown> }).user || {})
          : ((response as Record<string, unknown>) || {});

      const merged = {
        ...existing,
        ...backendUser,
        brandName: brandName.trim(),
        website: overlayText.trim(),
        phone: phone.trim(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("shoutly_user", JSON.stringify(merged));
        window.dispatchEvent(new Event("auth-changed"));
      }

      setDirty(false);
      showToast("✓ Brand settings saved!", "green");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      showToast(err?.response?.data?.message || err?.message || "Failed to save brand settings", "red");
    } finally {
      setSaving(false);
    }
  };

  // Badge style computation
  const getBadgeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { ...POS_CSS[S.pos], position: "absolute", display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: S.radius, opacity: S.opacity / 100, zIndex: 10, maxWidth: 150, transition: "all .25s", color: S.textColor === "white" ? "#fff" : "#0D0E1A" };
    switch (S.style) {
      case "glass": return { ...base, background: hexToRgba(S.primary, .18), backdropFilter: `blur(${S.blur}px)`, border: `1px solid ${hexToRgba(S.primary, .3)}`, boxShadow: `0 4px 16px ${hexToRgba(S.primary, .2)}` };
      case "solid": return { ...base, background: S.primary, backdropFilter: "none", border: "1px solid rgba(255,255,255,.1)", boxShadow: `0 4px 16px ${hexToRgba(S.primary, .4)}` };
      case "outline": return { ...base, background: "rgba(0,0,0,.25)", backdropFilter: `blur(${S.blur}px)`, border: `2px solid ${S.primary}`, boxShadow: "none" };
      case "minimal": return { ...base, background: "transparent", backdropFilter: "none", border: "none", boxShadow: "none" };
    }
  };

  const tc = S.textColor === "white" ? "#fff" : "#0D0E1A";
  const opacityPct = ((S.opacity - 10) / 90) * 100;
  const blurPct = (S.blur / 24) * 100;
  const radiusPct = (S.radius / 28) * 100;
  const sizePct = ((S.size - 24) / 56) * 100;

  const toastColors: Record<string, string> = { green: "#10B981", brand: "#F97316", amber: "#F59E0B", red: "#EF4444" };
  const toastCol = toastColors[toast.type] || toastColors.green;

  const fieldStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 7, border: "1px solid #E4E5EF", background: "#F0F1F8", color: "#0D0E1A", fontSize: 13.5, outline: "none", fontFamily: "inherit" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#9496B5", marginBottom: 6, display: "flex", alignItems: "center", gap: 5, fontFamily: "Sora,sans-serif" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans',sans-serif; font-size: 13.5px; background: #F5F6FA; color: #0D0E1A; overflow: hidden; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #E4E5EF; border-radius: 4px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes liveGlow { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.35)} 50%{box-shadow:0 0 0 5px rgba(16,185,129,0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #F97316; border: 2.5px solid #fff; box-shadow: 0 1px 4px rgba(249,115,22,.5); cursor: pointer; }
        .sb-item-hover:hover { background: #1E1F2E; color: #F1F2FF; }
        .tb-icon-hover:hover { background: #F0F1F8; color: #0D0E1A; }
        .pos-btn:hover { border-color: rgba(249,115,22,.35); background: #EEEEFF; }
        .style-btn-hover:hover { border-color: rgba(249,115,22,.35); background: #EEEEFF; }
        .swatch:hover { transform: scale(1.1); }
        .time-badge:hover { border-color: #F97316; color: #F97316; background: #EEEEFF; }
        .bg-thumb:hover { transform: scale(1.06); }
        .mini-card-item:hover { box-shadow: 0 4px 12px rgba(13,14,26,.08); transform: translateY(-2px); }
        .upload-box-hover:hover { border-color: rgba(249,115,22,.4); background: #EEEEFF; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Topbar */}
          <AdminHeader
            pageTitle="Overlay Settings"
            searchPlaceholder="Search settings…"
            actionButton={
              <button onClick={saveSettings} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7, background: "linear-gradient(115deg,#F97316,#EA580C)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 14px rgba(249,115,22,.4)" }}>
                {saving ? <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 11 }} /> : <i className="fa-solid fa-floppy-disk" style={{ fontSize: 11 }} />} Save Changes
              </button>
            }
          />

          {/* Page body: 3 columns */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

            {/* ── LEFT: Settings panel ── */}
            <div style={{ width: 360, flexShrink: 0, overflowY: "auto", background: "#fff", borderRight: "1px solid #E4E5EF" }}>

              {/* Header */}
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #E4E5EF", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".6px", color: "#9496B5", marginBottom: 5, fontFamily: "Sora,sans-serif" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(115deg,#F97316,#EA580C)" }} />Brand Overlay Settings
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.35px", lineHeight: 1.2 }}>Make every post yours</div>
                <div style={{ fontSize: 12.5, color: "#9496B5", marginTop: 4, lineHeight: 1.6 }}>Logo and contact info applied to all generated posts. Changes are live instantly.</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 7, padding: "3px 9px", borderRadius: 20, background: "#ECFDF5", border: "1px solid rgba(16,185,129,.15)", color: "#10B981", fontSize: 11.5, fontWeight: 700, fontFamily: "Sora,sans-serif" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", animation: "blink 2s infinite" }} />Auto-applies to all new posts
                </div>
              </div>

              {/* Logo Upload */}
              <div style={{ borderBottom: "1px solid #ECEDF5" }}>
                <div onClick={() => toggleSection("logo-upload")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-image" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Logo Upload</span>
                  <span style={{ padding: "2px 7px", borderRadius: 5, background: "#EEEEFF", color: "#F97316", fontSize: 10, fontWeight: 700 }}>Required</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "logo-upload" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "logo-upload" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <div style={{ ...labelStyle, marginBottom: 8 }}><span>Upload</span><span style={{ fontSize: 10.5, color: "#C8CADF", fontWeight: 500, textTransform: "none", letterSpacing: 0, marginLeft: "auto" }}>PNG, SVG, JPG, WEBP</span></div>
                    <label className="upload-box-hover" style={{ display: "block", border: `1.5px dashed ${S.logoUrl ? "#F97316" : "#E4E5EF"}`, borderRadius: 14, padding: 18, textAlign: "center", cursor: "pointer", background: S.logoUrl ? "#EEEEFF" : "#F0F1F8", transition: "all .18s" }}>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", border: "1px solid #E4E5EF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ color: "#F97316", fontSize: 16 }} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0E1A", marginBottom: 2, fontFamily: "Sora,sans-serif" }}>Drop your logo here</div>
                      <div style={{ fontSize: 12, color: "#9496B5" }}>or click to browse files</div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
                        {["PNG","SVG","JPG"].map(f => <span key={f} style={{ padding: "2px 6px", borderRadius: 4, background: "#fff", border: "1px solid #E4E5EF", color: "#9496B5", fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>{f}</span>)}
                      </div>
                    </label>
                    {S.logoUrl && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 7, background: "#F0F1F8", marginTop: 10, border: "1px solid #E4E5EF" }}>
                        <img src={S.logoUrl} alt="" style={{ width: 38, height: 38, objectFit: "contain", borderRadius: 6, background: "#fff", border: "1px solid #E4E5EF" }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0D0E1A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{S.logoName}</div>
                          <div style={{ fontSize: 11, color: "#9496B5" }}>{S.logoSize}</div>
                        </div>
                        <div onClick={removeLogo} style={{ width: 24, height: 24, borderRadius: 6, background: "#FEF2F2", color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Logo Position */}
              <div style={{ borderBottom: "1px solid #ECEDF5" }}>
                <div onClick={() => toggleSection("logo-position")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-arrows-up-down-left-right" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Logo Position</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "logo-position" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "logo-position" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {(["tl","tr","bl","br"] as PosKey[]).map(p => {
                        const icons: Record<PosKey, string> = { tl:"fa-arrow-up-left", tr:"fa-arrow-up-right", bl:"fa-arrow-down-left", br:"fa-arrow-down-right" };
                        return (
                          <div key={p} onClick={() => updS({ pos: p })} className="pos-btn" style={{ padding: "9px 8px", borderRadius: 7, border: `1.5px solid ${S.pos===p?"#F97316":"#E4E5EF"}`, background: S.pos===p?"#EEEEFF":"#F0F1F8", color: S.pos===p?"#F97316":"#4B4D6B", fontSize: 12.5, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: S.pos===p?"0 0 0 3px rgba(249,115,22,.08)":undefined }}>
                            <i className={`fa-solid ${icons[p]} fa-xs`} /> {POS_LABELS[p]}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 13 }}>
                      <div style={{ ...labelStyle }}>Logo Size <span style={{ fontSize: 10.5, color: "#C8CADF", fontWeight: 500, textTransform: "none", letterSpacing: 0, marginLeft: "auto" }}>{S.size}px</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 10.5, color: "#C8CADF", flexShrink: 0 }}>XS</span>
                        <input type="range" min={24} max={80} value={S.size} onChange={e => updS({ size: +e.target.value })} style={{ flex: 1, background: sliderFill(sizePct) }} />
                        <span style={{ fontSize: 10.5, color: "#C8CADF", flexShrink: 0 }}>XL</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay Appearance */}
              <div style={{ borderBottom: "1px solid #ECEDF5" }}>
                <div onClick={() => toggleSection("overlay-appearance")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-sliders" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Overlay Appearance</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "overlay-appearance" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "overlay-appearance" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <div style={{ marginBottom: 13 }}>
                      <div style={{ ...labelStyle }}>Badge Style</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {(["glass","solid","outline","minimal"] as BadgeStyle[]).map(bs => (
                          <div key={bs} onClick={() => updS({ style: bs })} className="style-btn-hover" style={{ padding: 9, borderRadius: 7, border: `1.5px solid ${S.style===bs?"#F97316":"#E4E5EF"}`, background: S.style===bs?"#EEEEFF":"#F0F1F8", color: S.style===bs?"#F97316":"#4B4D6B", fontSize: 12.5, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: "Sora,sans-serif" }}>
                            {bs.charAt(0).toUpperCase()+bs.slice(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                    {[
                      { label: "Opacity", val: S.opacity, key: "opacity" as const, min: 10, max: 100, pct: opacityPct, suffix: "%", l: "10%", r: "100%" },
                      { label: "Blur", val: S.blur, key: "blur" as const, min: 0, max: 24, pct: blurPct, suffix: "px", l: "0", r: "24" },
                      { label: "Corner Radius", val: S.radius, key: "radius" as const, min: 0, max: 28, pct: radiusPct, suffix: "px", l: "0", r: "28" },
                    ].map(sl => (
                      <div key={sl.key} style={{ marginBottom: 13 }}>
                        <div style={{ ...labelStyle }}>{sl.label} <span style={{ fontSize: 10.5, color: "#C8CADF", fontWeight: 500, textTransform: "none", letterSpacing: 0, marginLeft: "auto" }}>{sl.val}{sl.suffix}</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 10.5, color: "#C8CADF", flexShrink: 0 }}>{sl.l}</span>
                          <input type="range" min={sl.min} max={sl.max} value={sl.val} onChange={e => updS({ [sl.key]: +e.target.value })} style={{ flex: 1, background: sliderFill(sl.pct) }} />
                          <span style={{ fontSize: 10.5, color: "#C8CADF", flexShrink: 0 }}>{sl.r}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Brand Colors */}
              <div style={{ borderBottom: "1px solid #ECEDF5" }}>
                <div onClick={() => toggleSection("brand-colors")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-palette" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Brand Colors</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "brand-colors" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "brand-colors" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <div style={{ marginBottom: 13 }}>
                      <div style={{ ...labelStyle }}>Primary Color</div>
                      <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                        {PRIMARY_SWATCHES.map(c => (
                          <div key={c} onClick={() => updS({ primary: c })} className="swatch" style={{ width: 28, height: 28, borderRadius: 7, cursor: "pointer", background: c, border: `2.5px solid ${S.primary===c?"#F97316":c==="#ffffff"?"#E4E5EF":"transparent"}`, boxShadow: S.primary===c?"0 0 0 2px rgba(249,115,22,.3)":undefined, transition: "all .15s", flexShrink: 0 }} />
                        ))}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, border: "1.5px dashed #E4E5EF", background: "#F0F1F8", display: "flex", alignItems: "center", justifyContent: "center", color: "#9496B5", cursor: "pointer" }}>
                            <i className="fa-solid fa-plus" style={{ fontSize: 11 }} />
                          </div>
                          <input type="color" value={S.primary} onChange={e => updS({ primary: e.target.value })} style={{ position: "absolute", opacity: 0, width: 28, height: 28, top: 0, left: 0, cursor: "pointer" }} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ ...labelStyle }}>Text Color on Badge</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                        {(["white","dark"] as TextColor[]).map(tc => (
                          <div key={tc} onClick={() => updS({ textColor: tc })} className="style-btn-hover" style={{ padding: 9, borderRadius: 7, border: `1.5px solid ${S.textColor===tc?"#F97316":"#E4E5EF"}`, background: S.textColor===tc?"#EEEEFF":"#F0F1F8", color: S.textColor===tc?"#F97316":"#4B4D6B", fontSize: 12.5, fontWeight: 700, cursor: "pointer", textAlign: "center", fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                            <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: tc==="white"?"#fff":"#0F1117", border: tc==="white"?"1px solid rgba(0,0,0,.15)":undefined }} />
                            {tc.charAt(0).toUpperCase()+tc.slice(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Identity */}
              <div style={{ borderBottom: "1px solid #ECEDF5" }}>
                <div onClick={() => toggleSection("brand-identity")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-id-badge" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Brand Identity</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "brand-identity" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "brand-identity" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    {[
                      { label: "Brand Name", val: brandName, set: setBrandName, placeholder: "Your Brand Name" },
                      { label: "Overlay / Tagline", val: overlayText, set: setOverlayText, placeholder: "Website or tagline…", tip: "Optional" },
                      { label: "Phone / Contact", val: phone, set: setPhone, placeholder: "+1 (555) 000-0000" },
                    ].map((f, i) => (
                      <div key={f.label} style={{ marginBottom: i < 2 ? 11 : 0 }}>
                        <div style={{ ...labelStyle }}>{f.label}{f.tip && <span style={{ fontSize: 10.5, color: "#C8CADF", fontWeight: 500, textTransform: "none", letterSpacing: 0, marginLeft: "auto" }}>{f.tip}</span>}</div>
                        <input value={f.val} onChange={e => { f.set(e.target.value); mark(); }} placeholder={f.placeholder} style={fieldStyle} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Show / Hide toggles */}
              <div style={{ borderBottom: "1px solid #ECEDF5" }}>
                <div onClick={() => toggleSection("show-hide")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-toggle-on" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Show / Hide Elements</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "show-hide" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "show-hide" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    {[
                      { key: "showLogo" as const, icon: "fa-image", iconBg: "#EEEEFF", iconC: "#F97316", title: "Logo", sub: "Display your logo on posts" },
                      { key: "showName" as const, icon: "fa-font", iconBg: "#ECFDF5", iconC: "#10B981", title: "Brand Name", sub: "Display name text on badge" },
                      { key: "showContact" as const, icon: "fa-phone", iconBg: "#FFFBEB", iconC: "#F59E0B", title: "Contact Info", sub: "Show phone number on badge" },
                      { key: "showOvtext" as const, icon: "fa-link", iconBg: "#EFF6FF", iconC: "#3B82F6", title: "Overlay Text", sub: "Show tagline or website URL" },
                      { key: "showCorner" as const, icon: "fa-vector-square", iconBg: "#FDF2F8", iconC: "#EC4899", title: "Corner Accents", sub: "Branded corner frame element" },
                      { key: "showTextbar" as const, icon: "fa-grip-lines", iconBg: "#ECFEFF", iconC: "#06B6D4", title: "Bottom Text Bar", sub: "Full-width bar at the bottom" },
                    ].map((item, i) => (
                      <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: i > 0 ? "1px solid #ECEDF5" : undefined }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                            <i className={`fa-solid ${item.icon}`} style={{ color: item.iconC }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0D0E1A" }}>{item.title}</div>
                            <div style={{ fontSize: 11.5, color: "#9496B5", marginTop: 1 }}>{item.sub}</div>
                          </div>
                        </div>
                        <Toggle checked={S[item.key]} onChange={v => updS({ [item.key]: v })} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Best Posting Times */}
              <div>
                <div onClick={() => toggleSection("posting-times")} style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEEEFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className="fa-solid fa-clock" style={{ fontSize: 11, color: "#F97316" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Best Posting Times</span>
                  <span style={{ padding: "2px 7px", borderRadius: 5, background: "#EEEEFF", color: "#F97316", fontSize: 10, fontWeight: 700 }}>AI</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", transition: "transform .2s", transform: openSection === "posting-times" ? "rotate(180deg)" : "rotate(0deg)" }} />
                </div>
                {openSection === "posting-times" && (
                  <div style={{ padding: "0 20px 16px" }}>
                    {TIME_BLOCKS.filter(b => b.times.length > 0).map(block => (
                      <div key={block.name} style={{ background: "#F0F1F8", border: "1px solid #E4E5EF", borderRadius: 10, padding: "11px 13px", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: block.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                            <i className={`fa-brands ${block.icon}`} style={{ color: block.color }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>{block.name}</div>
                            <div style={{ fontSize: 11, color: "#9496B5", marginTop: 1 }}>{block.sub}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {block.times.map(slot => (
                            <div key={slot.t} onClick={() => { setSelTimes(p => ({ ...p, [block.name]: slot.t })); showToast(`Best time noted: ${slot.t}`, "brand"); }} className="time-badge" style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 6, background: selTimes[block.name]===slot.t?"#EEEEFF":slot.best?"#ECFDF5":"#fff", border: `1px solid ${selTimes[block.name]===slot.t?"#F97316":slot.best?"rgba(16,185,129,.25)":"#E4E5EF"}`, fontSize: 11.5, fontWeight: 700, color: selTimes[block.name]===slot.t?"#F97316":slot.best?"#10B981":"#4B4D6B", cursor: "pointer", fontFamily: "JetBrains Mono,monospace", transition: "all .13s" }}>
                              {slot.best && <div style={{ width: 5, height: 5, borderRadius: "50%", background: selTimes[block.name]===slot.t?"#F97316":"#10B981", flexShrink: 0 }} />}
                              {slot.t}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── CENTER: Live Preview ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#F5F6FA" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif", letterSpacing: "-.3px" }}>Live Preview</div>
                </div>
              </div>

              {/* Preview Card */}
              <div style={{ background: "#fff", border: "1px solid #E4E5EF", borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 32px rgba(13,14,26,.10)", marginBottom: 14, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderBottom: "1px solid #E4E5EF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: "#E1306C", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="fa-brands fa-instagram" style={{ color: "#fff", fontSize: 11 }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />)}
                  </div>
                </div>
                {/* Stage */}
                <div style={{ position: "relative", overflow: "hidden", background: "#F0F1F8", width: "100%", height: 320 }}>
                  <img src={bgImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                  {/* Brand badge overlay */}
                  <div style={getBadgeStyle()}>
                    {S.showLogo && S.logoUrl && <img src={S.logoUrl} alt="" style={{ width: S.size, height: S.size, objectFit: "contain", borderRadius: 6, display: "block", flexShrink: 0 }} />}
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {S.showName && <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "Sora,sans-serif", color: tc, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{brandName}</div>}
                      {S.showContact && <div style={{ fontSize: 8.5, fontWeight: 600, color: tc, opacity: .8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{phone}</div>}
                      {S.showOvtext && <div style={{ fontSize: 8.5, fontWeight: 500, color: tc, opacity: .7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{overlayText}</div>}
                    </div>
                  </div>
                  {/* Corner accent */}
                  {S.showCorner && (
                    <div style={{ position: "absolute", width: 52, height: 52, pointerEvents: "none", zIndex: 8, ...POS_CORNER[S.pos], borderColor: S.primary, borderStyle: "solid", borderWidth: S.pos==="tl"?"3px 0 0 3px":S.pos==="tr"?"3px 3px 0 0":S.pos==="bl"?"0 0 3px 3px":"0 3px 3px 0" }} />
                  )}
                  {/* Bottom text bar */}
                  {S.showTextbar && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "9px 13px 11px", zIndex: 9, background: `linear-gradient(transparent,${hexToRgba(S.primary, .7)})` }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontFamily: "Sora,sans-serif" }}>
                        {[brandName, phone, overlayText].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "10px 14px", borderTop: "1px solid #E4E5EF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[["fa-heart","24.8K"],["fa-regular fa-comment","1.2K"],["fa-share-nodes","847"]].map(([ic, v]) => (
                      <div key={v} style={{ fontSize: 12, color: "#9496B5", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className={`fa-${ic.startsWith("fa-regular")?ic:`solid ${ic}`}`} style={{ fontSize: 11 }} />{v}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "3px 9px", borderRadius: 20, background: "#ECFDF5", border: "1px solid rgba(16,185,129,.15)", color: "#10B981", fontSize: 11, fontWeight: 700, fontFamily: "Sora,sans-serif" }}>Overlay Active</div>
                </div>
              </div>

              {/* BG Swapper */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#9496B5", marginBottom: 8, fontFamily: "Sora,sans-serif" }}>Test Backgrounds</div>
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                  {bgOptions.map((src, i) => (
                    <img key={i} onClick={() => setBgImg(src)} className="bg-thumb" src={src} alt="" style={{ flex: "0 0 calc(100% / 7 - 6px)", minWidth: 0, height: 64, borderRadius: 8, objectFit: "cover", cursor: "pointer", border: `2.5px solid ${bgImg===src?"#F97316":"transparent"}`, boxShadow: bgImg===src?"0 0 0 2px rgba(249,115,22,.25)":undefined, transition: "all .15s" }} />
                  ))}
                </div>
              </div>

            </div>

            {/* ── RIGHT: Action column ── */}
            <div style={{ width: 240, flexShrink: 0, overflowY: "auto", background: "#fff", borderLeft: "1px solid #E4E5EF" }}>
              <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid #E4E5EF", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0D0E1A", fontFamily: "Sora,sans-serif" }}>Overlay Summary</div>
                <div style={{ fontSize: 12, color: "#9496B5", marginTop: 2 }}>Current brand config</div>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 11 }}>
                {/* Unsaved changes */}
                {dirty && (
                  <div style={{ padding: "9px 11px", borderRadius: 7, background: "#FFFBEB", border: "1px solid rgba(245,158,11,.2)", fontSize: 12, fontWeight: 600, color: "#F59E0B", display: "flex", alignItems: "center", gap: 6, animation: "fadeIn .2s ease" }}>
                    <i className="fa-solid fa-circle-dot" style={{ fontSize: 11, flexShrink: 0 }} /> Unsaved changes
                  </div>
                )}
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "#ECFDF5", border: "1px solid rgba(16,185,129,.15)" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10B981", flexShrink: 0, animation: "liveGlow 2s ease-in-out infinite" }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4B4D6B" }}>Overlay is <strong style={{ color: "#10B981" }}>Active</strong></div>
                </div>
                {/* Summary */}
                <div style={{ background: "#F0F1F8", border: "1px solid #E4E5EF", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0D0E1A", marginBottom: 9, fontFamily: "Sora,sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="fa-solid fa-info-circle" style={{ color: "#F97316", fontSize: 11 }} /> Settings Summary
                  </div>
                  {[
                    { k: "Position", v: POS_LABELS[S.pos] },
                    { k: "Logo Size", v: `${S.size}px` },
                    { k: "Opacity", v: `${S.opacity}%` },
                    { k: "Style", v: S.style.charAt(0).toUpperCase()+S.style.slice(1) },
                    { k: "Logo", v: S.logoUrl?S.logoName:"Not set", col: S.logoUrl?"#10B981":"#EF4444" },
                    { k: "Corner", v: S.showCorner?"On":"Off", col: S.showCorner?"#10B981":"#EF4444" },
                  ].map((row, i, arr) => (
                    <div key={row.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 12, borderBottom: i<arr.length-1?"1px solid #ECEDF5":undefined }}>
                      <span style={{ color: "#9496B5", fontWeight: 500 }}>{row.k}</span>
                      <span style={{ color: row.col||"#0D0E1A", fontWeight: 700, fontFamily: "JetBrains Mono,monospace", fontSize: 11.5 }}>{row.v}</span>
                    </div>
                  ))}
                </div>
                {/* Apply to platforms */}
                <div style={{ background: "#F0F1F8", border: "1px solid #E4E5EF", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0D0E1A", marginBottom: 9, fontFamily: "Sora,sans-serif" }}>Apply overlay to</div>
                  {APPLY_PLATFORMS.map((plat, i) => (
                    <div key={plat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i<APPLY_PLATFORMS.length-1?"1px solid #ECEDF5":undefined }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4B4D6B", display: "flex", alignItems: "center", gap: 7 }}>
                        <i className={`fa-brands ${plat.icon}`} style={{ fontSize: 12, color: plat.color }} />{plat.name}
                      </span>
                      <Toggle checked={applyPlatforms[plat.name]} onChange={v => setApplyPlatforms(p => ({ ...p, [plat.name]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      {/* Toast */}
      <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 9999, display: "flex", alignItems: "center", gap: 9, padding: "11px 16px", borderRadius: 10, background: "#0D0E1A", color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: "0 12px 32px rgba(13,14,26,.10)", fontFamily: "Sora,sans-serif", opacity: toast.visible ? 1 : 0, transform: toast.visible ? "translateY(0)" : "translateY(8px)", transition: "all .3s cubic-bezier(.4,0,.2,1)", pointerEvents: "none" }}>
        <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: "50%", background: `${toastCol}22`, color: toastCol, alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>{toast.type==="red"?"✕":"✓"}</span>
        &nbsp;{toast.msg}
      </div>
    </>
  );
}