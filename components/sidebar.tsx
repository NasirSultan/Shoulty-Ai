"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
// Font Awesome requirement: Import CSS in your layout file (see instructions below)

// ─────────────────────────────────────────────
// NAV CONFIG
// Map each item to its href so Next.js Link works
// ─────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      {
        icon: "fa-solid fa-grid-2",
        label: "Dashboard",
        href: "/dashboard",
        badge: null,
        badgeGrad: false,
      },
      {
        icon: "fa-solid fa-wand-magic-sparkles",
        label: "Generate Content",
        href: "/generate",
        badge: "AI",
        badgeGrad: true,
      },
      {
        icon: "fa-solid fa-calendar-days",
        label: "Content Calendar",
        href: "/calendar",
        badge: null,
        badgeGrad: false,
      },
      {
        icon: "fa-solid fa-photo-film",
        label: "Content Library",
        href: "/library",
        badge: null,
        badgeGrad: false,
      },
      {
        icon: "fa-solid fa-photo-film",
        label: "Studio",
        href: "/studio",
        badge: null,
        badgeGrad: false,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        icon: "fa-solid fa-house-chimney",
        label: "Brand Settings",
        href: "/brand",
        badge: null,
        badgeGrad: false,
      },
      {
        icon: "fa-solid fa-share-nodes",
        label: "Social Accounts",
        href: "/accounts",
        badge: null,
        badgeGrad: false,
      },
      {
        icon: "fa-solid fa-credit-card",
        label: "Subscription & Billing",
        href: "/billing",
        badge: null,
        badgeGrad: false,
      },
      {
        icon: "fa-solid fa-gear",
        label: "Settings",
        href: "/settings",
        badge: null,
        badgeGrad: false,
      },
    ],
  },
  {
    label: "More",
    items: [
      {
        icon: "fa-solid fa-bell",
        label: "Notifications",
        href: "/notifications",
        badge: "3",
        badgeGrad: false,
      },
    ],
  },
];

// ─────────────────────────────────────────────
// SIDEBAR COMPONENT
// ─────────────────────────────────────────────
export default function Sidebar() {
  const [slim, setSlim] = useState(false);
  const pathname = usePathname();

  return (
    <aside style={{ ...S.sb, width: slim ? 64 : 228 }}>
      {/* ── Logo ── */}
      <div style={S.sbLogo}>
        <div style={S.sbMark}>S</div>
        {!slim && (
          <span style={S.sbWordmark}>
            Shoutly <span style={S.sbAccent}>AI</span>
          </span>
        )}
        {/* Collapse toggle lives inside the logo bar */}
        <button
          onClick={() => setSlim((v) => !v)}
          style={{ ...S.collapseBtn, marginLeft: slim ? "auto" : "auto" }}
          title={slim ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i
            className={`fa-solid ${slim ? "fa-chevron-right" : "fa-chevron-left"}`}
            style={{ fontSize: 10 }}
          />
        </button>
      </div>

      {/* ── Nav body ── */}
      <div style={S.sbBody}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!slim && <div style={S.sectionLbl}>{section.label}</div>}

            {section.items.map((item) => {
              // Active if the current pathname starts with the item's href
              const isOn =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    title={slim ? item.label : undefined}
                    style={{
                      ...S.navItem,
                      ...(isOn ? S.navItemOn : {}),
                      justifyContent: slim ? "center" : "flex-start",
                    }}
                  >
                    {isOn && <div style={S.activePip} />}

                    <i
                      className={item.icon}
                      style={{
                        width: 16,
                        fontSize: 14,
                        textAlign: "center",
                        flexShrink: 0,
                        color: isOn ? "#A5B4FC" : "#9B9DC0",
                      }}
                    />

                    {!slim && (
                      <span
                        style={{ flex: 1, color: isOn ? "#A5B4FC" : "#9B9DC0" }}
                      >
                        {item.label}
                      </span>
                    )}

                    {!slim && item.badge && (
                      <span
                        style={{
                          ...S.badge,
                          background: item.badgeGrad
                            ? "linear-gradient(135deg,#5B5BD6,#7C3AED)"
                            : "#5B5BD6",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── User footer ── */}
      <div style={S.sbBottom}>
        <div style={S.userRow}>
          <div style={S.userAv}>JD</div>
          {!slim && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.userName}>Jane Doe</div>
                <div style={S.userRole}>Premium · Brand A</div>
              </div>
              <i
                className="fa-solid fa-chevron-down"
                style={{ color: "#5A5C7A", fontSize: 10, flexShrink: 0 }}
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  sb: {
    flexShrink: 0,
    background: "#0F1117",
    borderRight: "1px solid rgba(255,255,255,.06)",
    display: "flex",
    flexDirection: "column",
    transition: "width .22s cubic-bezier(.4,0,.2,1)",
    overflow: "hidden",
    zIndex: 200,
    height: "100vh",
    position: "sticky",
    top: 0,
  },

  sbLogo: {
    height: 56,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    borderBottom: "1px solid rgba(255,255,255,.06)",
    flexShrink: 0,
  },

  sbMark: {
    width: 32,
    height: 32,
    borderRadius: 9,
    flexShrink: 0,
    background: "linear-gradient(135deg,#5B5BD6,#7C3AED)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
    fontFamily: "'Sora',sans-serif",
    boxShadow: "0 4px 20px rgba(91,91,214,.28)",
  },

  sbWordmark: {
    fontSize: 15,
    fontWeight: 800,
    color: "#F1F2FF",
    fontFamily: "'Sora',sans-serif",
    whiteSpace: "nowrap",
    letterSpacing: -0.3,
    flex: 1,
  },

  sbAccent: {
    background: "linear-gradient(90deg,#818CF8,#A78BFA)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  collapseBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "#5A5C7A",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all .13s",
  },

  sbBody: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },

  sectionLbl: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#5A5C7A",
    padding: "10px 18px 5px",
    whiteSpace: "nowrap",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 11px",
    margin: "1px 8px",
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    overflow: "hidden",
    position: "relative",
    transition: "background .13s",
    textDecoration: "none",
  },

  navItemOn: {
    background: "rgba(91,91,214,.18)",
    fontWeight: 600,
  },

  activePip: {
    position: "absolute",
    left: 0,
    top: "20%",
    bottom: "20%",
    width: 3,
    borderRadius: "0 3px 3px 0",
    background: "#818CF8",
  },

  badge: {
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 9,
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sbBottom: {
    borderTop: "1px solid rgba(255,255,255,.06)",
    padding: 8,
    flexShrink: 0,
  },

  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: 8,
    borderRadius: 7,
    cursor: "pointer",
  },

  userAv: {
    width: 30,
    height: 30,
    borderRadius: 8,
    flexShrink: 0,
    background: "linear-gradient(135deg,#5B5BD6,#EC4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "#fff",
  },

  userName: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#F1F2FF",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userRole: {
    fontSize: 11,
    color: "#5A5C7A",
  },
};