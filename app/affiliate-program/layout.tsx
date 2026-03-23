import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description:
    "Join the Shoutly AI affiliate program and earn commissions by sharing AI social media automation.",
  alternates: {
    canonical: "/affiliate-program",
  },
};

export default function AffiliateProgramLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
