"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";

interface SidebarProps {
  slim: boolean;
  onToggle: () => void;
  /** Pass the current pathname to auto-highlight the active item.
   *  e.g. activePath={usePathname()} in Next.js  */
  activePath?: string;
}

const navItems = [
  { section: "Workspace" },
  {
    icon: "fa-solid fa-gauge",
    label: "Dashboard",
    href: "/dashboards",
  },
  {
    icon: "fa-solid fa-wand-magic-sparkles",
    label: "Generate Content",
    href: "/generate",
    badge: "AI",
  },
  {
    icon: "fa-solid fa-chart-simple",
    label: "Analytics",
    href: "/dashboards/analytics",
  },
  {
    icon: "fa-solid fa-calendar-days",
    label: "Content Calendar",
    href: "/dashboards/calendar",
  },
  {
    icon: "fa-solid fa-photo-film",
    label: "Image & Reel Library",
    href: "/dashboards/library",
  },
  {
    icon: "fa-solid fa-users",
    label: "Team",
    href: "/dashboards/team",
  },
  { section: "Settings" },
  {
    icon: "fa-solid fa-house-chimney",
    label: "Brand Settings",
    href: "/dashboards/settings/brand",
  },
  {
    icon: "fa-solid fa-share-nodes",
    label: "Social Accounts",
    href: "/dashboards/settings/accounts",
  },
  {
    icon: "fa-solid fa-credit-card",
    label: "Subscription & Billing",
    href: "/dashboards/settings/billing",
  },
  {
    icon: "fa-solid fa-gear",
    label: "Settings",
    href: "/dashboards/settings",
  },
  { section: "More" },
  {
    icon: "fa-solid fa-bell",
    label: "Notifications",
    href: "/dashboards/notifications",
    badge: "3",
  },
];

export default function Sidebar({ slim, onToggle, activePath = "/dashboard" }: SidebarProps) {
  const pathname = usePathname();
  const currentPath = pathname || activePath;
  const { user, initials } = useUserProfile();

  const sidebarUserName = user?.name || "User";
  const sidebarUserSubline = [user?.role, user?.brandName].filter(Boolean).join(" · ") || "Shoutly Member";

  return (
    <>
    <div
      style={{
        width: slim ? 64 : 228,
        flexShrink: 0,
        background: "#0F1117",
        borderRight: "1px solid rgba(255,255,255,.06)",
        display: "flex",
        flexDirection: "column",
        transition: "width .22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        zIndex: 200,
        height: "100vh",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          flexShrink: 0,
        }}
      >
        <Link href="/dashboards" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div
            style={{
              position: "relative",
              width: slim ? 46 : 170,
              height: 70,
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/logo2.png"
              alt="Shoutly AI"
              fill
              priority
              style={{ objectFit: "contain", objectPosition: "left center" }}
            />
          </div>
        </Link>
      </div>

      {/* ── Nav Items ── */}
      <div className="sb-nav-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {navItems.map((item, idx) => {
          // Section label — not a link
          if ("section" in item) {
            return !slim ? (
              <div
                key={idx}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".8px",
                  color: "#5A5C7A",
                  padding: "10px 18px 5px",
                }}
              >
                {item.section}
              </div>
            ) : null;
          }

          const isActive =
            currentPath === item.href ||
            (item.href !== "/dashboards" &&
              item.href !== "/dashboards/settings" &&
              currentPath.startsWith(item.href + "/"));

          return (
            <Link
              key={idx}
              href={item.href}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                className="sb-item-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 11px",
                  margin: "1px 8px",
                  borderRadius: 7,
                  color: isActive ? "#A5B4FC" : "#9B9DC0",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  background: isActive ? "rgba(91,91,214,.18)" : undefined,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all .13s",
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: "0 3px 3px 0",
                      background: "#818CF8",
                    }}
                  />
                )}

                <i
                  className={item.icon}
                  style={{ width: 16, fontSize: 14, flexShrink: 0, textAlign: "center" }}
                />

                {!slim && <span style={{ flex: 1 }}>{item.label}</span>}

                {!slim && item.badge && (
                  <span
                    style={{
                      minWidth: 18,
                      height: 18,
                      padding: "0 5px",
                      borderRadius: 9,
                      background: "#5B5BD6",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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

      {/* ── User ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: 8, flexShrink: 0 }}>
        <Link href="/settings/profile" style={{ textDecoration: "none" }}>
          <div
            className="sb-item-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: 8,
              borderRadius: 7,
              cursor: "pointer",
              transition: "background .13s",
            }}
          >
            <div
              style={{
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
              }}
            >
              {initials}
            </div>

            {!slim && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#F1F2FF",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sidebarUserName}
                </div>
                <div style={{ fontSize: 11, color: "#5A5C7A" }}>{sidebarUserSubline}</div>
              </div>
            )}

            {!slim && (
              <i
                className="fa-solid fa-chevron-down"
                style={{ color: "#5A5C7A", fontSize: 10, flexShrink: 0 }}
              />
            )}
          </div>
        </Link>
      </div>
    </div>

      <style>{`
        .sb-nav-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sb-nav-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sb-nav-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.12);
          border-radius: 4px;
        }
        .sb-nav-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,.22);
        }
        .sb-nav-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.12) transparent;
        }
      `}</style>
    </>
  );
}