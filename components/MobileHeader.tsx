"use client";

import { FaBars, FaBell } from "react-icons/fa6";
import Link from "next/link";
import { useMobileSidebar } from "@/context/MobileSidebarContext";

export default function MobileHeader() {
  const { toggle } = useMobileSidebar();
  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .mobile-header-wrapper {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: #FFFFFF;
            border-bottom: 1px solid #E5E7EB;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            z-index: 35;
          }
        }
        @media (min-width: 768px) {
          .mobile-header-wrapper {
            display: none;
          }
        }
      `}</style>

      <div className="mobile-header-wrapper">
        {/* Left: Hamburger button */}
        <button
          onClick={toggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Open menu"
        >
          <FaBars size={20} color="#0F1117" />
        </button>

        {/* Center: Logo */}
        <Link href="/" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#111827", letterSpacing: "-.01em" }}>
            Shoutly
            <span style={{ background: "linear-gradient(115deg,#F97316,#EA580C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              AI
            </span>
          </div>
        </Link>

        {/* Right: Notification icon */}
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          title="Notifications"
        >
          <FaBell size={18} color="#0F1117" />
        </button>
      </div>
    </>
  );
}
