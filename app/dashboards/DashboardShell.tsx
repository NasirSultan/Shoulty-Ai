"use client";

import React from "react";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";
import MobileHeader from "@/components/MobileHeader";
import { useSidebarState } from "@/hooks/useSidebarState";

export const SidebarContext = React.createContext<{
  slim: boolean;
  toggle: () => void;
}>({ slim: false, toggle: () => {} });

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarSlim, setSidebarSlim } = useSidebarState();

  return (
    <SidebarContext.Provider value={{ slim: sidebarSlim, toggle: () => setSidebarSlim(s => !s) }}>
      <style>{`
        @media (max-width: 767px) {
          body {
            padding-top: 60px !important;
          }
          .dash-shell-content {
            height: calc(100vh - 60px) !important;
          }
        }
      `}</style>
      <MobileHeader />
      <div style={{ display: "flex", minHeight: "100vh", overflow: "hidden", background: "#F9FAFB" }}>
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim(s => !s)} />
        <div className="dash-shell-content" style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}>
          {children}
        </div>
      </div>
      <ChatWidget />
    </SidebarContext.Provider>
  );
}
