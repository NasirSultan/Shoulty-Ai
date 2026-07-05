"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";

interface SidebarProps {
  slim?: boolean;
  onToggle?: () => void;
  activePath?: string;
}

// Top standalone item (no section header)
const TOP_ITEM = {
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  label: "Dash Board",
  href: "/dashboards",
  exact: true,
};

const NAV_GROUPS = [
  {
    section: "Workspace",
    items: [
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
        label: "Brand Settings",
        href: "/dashboards/settings/brand",
      },
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
        label: "Social Account",
        href: "/dashboards/settings/accounts",
      },
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4m8-4v4"/></svg>,
        label: "Content Calendar",
        href: "/dashboards/calendar",
      },
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-4 3 2 5-5 5 5"/></svg>,
        label: "Image and Reel Library",
        href: "/dashboards/library",
      },
    ],
  },
  {
    section: "Dashboard",
    items: [
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>,
        label: "Analytics",
        href: "/dashboards/analytics",
      },
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
        label: "Subscription",
        href: "/dashboards/settings/billing",
      },
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
        label: "Settings",
        href: "/dashboards/settings",
        exact: true,
      },
    ],
  },
  {
    section: "More",
    items: [
      {
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
        label: "Notifications",
        href: "/dashboards/notifications",
        badge: "3",
      },
    ],
  },
];

// Orange-500 → Orange-600 gradient (matches homepage)
const GRAD = "linear-gradient(115deg,#F97316,#EA580C)";

export default function Sidebar({ slim = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, initials } = useUserProfile();
  const current = pathname || "/dashboards";

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return current === href;
    if (href === "/dashboards/settings") {
      return (
        current === href ||
        (current.startsWith("/dashboards/settings") &&
          !current.startsWith("/dashboards/settings/brand") &&
          !current.startsWith("/dashboards/settings/accounts") &&
          !current.startsWith("/dashboards/settings/billing"))
      );
    }
    return current === href || current.startsWith(href + "/");
  };

  return (
    <>
      <style>{`
        .sb-nav-item { transition: background .15s, color .15s; }
        .sb-nav-item:hover { background: #FFF7ED !important; }
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: rgba(249,115,22,.2); border-radius: 4px; }
        .sb-scroll { scrollbar-width: thin; scrollbar-color: rgba(249,115,22,.2) transparent; }
      `}</style>

      <div style={{
        width: slim ? 64 : 232,
        flexShrink: 0,
        background: "#FFFFFF",
        borderRight: "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width .22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        zIndex: 100,
      }}>

        {/* Logo */}
        <Link href="/dashboards" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: slim ? "14px 0 16px" : "14px 16px 18px",
            justifyContent: slim ? "center" : "flex-start",
            borderBottom: "1px solid #F3F4F6",
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: GRAD,
              display: "grid", placeItems: "center",
              boxShadow: "0 4px 10px -2px rgba(249,115,22,.45)",
            }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16 }}>
                <path d="M4 13h5l2 5 4-12 2 5h3" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {!slim && (
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827", letterSpacing: "-.01em" }}>
                Shoutly
                <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  AI
                </span>
              </span>
            )}
          </div>
        </Link>

        {/* Nav groups */}
        <div className="sb-scroll" style={{ flex: 1, overflowY: "auto", padding: "6px 0 12px" }}>

          {/* Dashboard — always at the top */}
          {(() => {
            const active = isActive(TOP_ITEM.href, TOP_ITEM.exact);
            return (
              <div style={{ padding: "4px 8px 2px" }}>
                <Link href={TOP_ITEM.href} style={{ textDecoration: "none", display: "block" }}>
                  <div className="sb-nav-item" style={{
                    display: "flex", alignItems: "center",
                    gap: 10, padding: slim ? "9px 8px" : "8px 10px",
                    borderRadius: 8, position: "relative",
                    justifyContent: slim ? "center" : "flex-start",
                    color: active ? "#111827" : "#6B7280",
                    fontWeight: active ? 600 : 500,
                    fontSize: ".875rem",
                    background: active ? "#FFF7ED" : "transparent",
                  }}>
                    {active && (
                      <span style={{ position: "absolute", left: -8, top: 6, bottom: 6, width: 3, borderRadius: "0 3px 3px 0", background: GRAD }} />
                    )}
                    <span style={{ width: 17, height: 17, flexShrink: 0, color: active ? "#F97316" : "#9CA3AF" }}>
                      {TOP_ITEM.icon}
                    </span>
                    {!slim && <span style={{ flex: 1 }}>{TOP_ITEM.label}</span>}
                  </div>
                </Link>
              </div>
            );
          })()}

          {NAV_GROUPS.map(({ section, items }) => (
            <div key={section}>
              {!slim ? (
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: ".9px", color: "#9CA3AF",
                  padding: "12px 16px 4px",
                }}>
                  {section}
                </div>
              ) : (
                <div style={{ height: 10 }} />
              )}

              {items.map(({ icon, label, href, exact, badge }: any) => {
                const active = isActive(href, exact);
                return (
                  <Link key={href} href={href} style={{ textDecoration: "none", display: "block" }}>
                    <div className="sb-nav-item" style={{
                      display: "flex", alignItems: "center",
                      gap: 10, margin: "1px 8px",
                      padding: slim ? "9px 8px" : "8px 10px",
                      borderRadius: 8, position: "relative",
                      justifyContent: slim ? "center" : "flex-start",
                      color: active ? "#111827" : "#6B7280",
                      fontWeight: active ? 600 : 500,
                      fontSize: ".875rem",
                      background: active ? "#FFF7ED" : "transparent",
                    }}>
                      {active && (
                        <span style={{
                          position: "absolute", left: -8, top: 6, bottom: 6, width: 3,
                          borderRadius: "0 3px 3px 0",
                          background: GRAD,
                        }} />
                      )}

                      <span style={{
                        width: 17, height: 17, flexShrink: 0,
                        color: active ? "#F97316" : "#9CA3AF",
                      }}>
                        {icon}
                      </span>

                      {!slim && (
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {label}
                        </span>
                      )}

                      {!slim && badge && (
                        <span style={{
                          minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99,
                          background: GRAD,
                          color: "#fff", fontSize: 10, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User row */}
        <div style={{ borderTop: "1px solid #F3F4F6", padding: 10, flexShrink: 0 }}>
          <Link href="/dashboards/settings" style={{ textDecoration: "none" }}>
            <div className="sb-nav-item" style={{
              display: "flex", alignItems: "center",
              gap: 9, padding: 8, borderRadius: 8, cursor: "pointer",
              justifyContent: slim ? "center" : "flex-start",
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: GRAD,
                color: "#fff", display: "grid", placeItems: "center",
                fontWeight: 700, fontSize: ".72rem",
              }}>
                {initials}
              </span>
              {!slim && (
                <span style={{ minWidth: 0, flex: 1 }}>
                  <b style={{ display: "block", fontSize: ".82rem", lineHeight: 1.3, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || "User"}
                  </b>
                  <span style={{ fontSize: ".7rem", color: "#9CA3AF", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.email || "member"}
                  </span>
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
