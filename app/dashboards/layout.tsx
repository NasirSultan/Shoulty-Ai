import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardsAuthGuard from "./DashboardsAuthGuard";
import DashboardShell from "./DashboardShell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardsAuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </DashboardsAuthGuard>
  );
}
