import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "See how brands use Shoutly AI to increase output and grow engagement across social platforms.",
  alternates: {
    canonical: "/case-studies",
  },
};

export default function CaseStudiesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
