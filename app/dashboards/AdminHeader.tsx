"use client";

import React from "react";

interface AdminHeaderProps {
  /** Page name shown after "Shoutly AI /" in the breadcrumb */
  pageTitle: string;
  /** Additional breadcrumb segments rendered before the final title */
  breadcrumb?: string[];
  /** Called when the hamburger is clicked to toggle sidebar */
  onToggle?: () => void;
  /** Controlled search input value */
  searchValue?: string;
  /** Called on every keystroke in the search box */
  onSearchChange?: (value: string) => void;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Optional extra element rendered between the search bar and bell icon (e.g. a LIVE badge) */
  extra?: React.ReactNode;
  /** Button or element shown at the far right (e.g. "New Post", "Export PDF") */
  actionButton?: React.ReactNode;
}

export default function AdminHeader({
  pageTitle,
  breadcrumb = [],
  onToggle,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  extra,
  actionButton,
}: AdminHeaderProps) {
  return (
    <div
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 22px",
        background: "#fff",
        borderBottom: "1px solid #E4E5EF",
        boxShadow: "0 1px 2px rgba(13,14,26,.05)",
        zIndex: 100,
      }}
    >
      {/* Hamburger */}
      {onToggle && (
        <div
          onClick={onToggle}
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9496B5",
            cursor: "pointer",
          }}
        >
          <i className="fa-solid fa-bars" style={{ fontSize: 14 }} />
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#9496B5" }}>
        <span>Shoutly AI</span>
        {breadcrumb.map((seg) => (
          <React.Fragment key={seg}>
            <span style={{ color: "#E4E5EF" }}>/</span>
            <span>{seg}</span>
          </React.Fragment>
        ))}
        <span style={{ color: "#E4E5EF" }}>/</span>
        <span style={{ color: "#0D0E1A", fontWeight: 700, fontFamily: "Sora,sans-serif" }}>{pageTitle}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 12px",
          borderRadius: 7,
          background: "#F0F1F8",
          border: "1px solid #E4E5EF",
          width: 220,
        }}
      >
        <i className="fa-solid fa-magnifying-glass" style={{ color: "#9496B5", fontSize: 12, flexShrink: 0 }} />
        <input
          value={searchValue ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#0D0E1A",
            width: "100%",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Extra slot (e.g. LIVE badge) */}
      {extra}

      {/* Bell notification */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4B4D6B",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <i className="fa-regular fa-bell" style={{ fontSize: 14 }} />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#EF4444",
            border: "1.5px solid #fff",
          }}
        />
      </div>

      {/* Help */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4B4D6B",
          cursor: "pointer",
        }}
      >
        <i className="fa-regular fa-circle-question" style={{ fontSize: 14 }} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "#E4E5EF", flexShrink: 0 }} />

      {/* User */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "4px 8px 4px 4px",
          borderRadius: 7,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "linear-gradient(135deg,#5B5BD6,#EC4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          JD
        </div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Jane Doe</span>
        <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: "#9496B5", marginLeft: 3 }} />
      </div>

      {/* Action button */}
      {actionButton}
    </div>
  );
}
