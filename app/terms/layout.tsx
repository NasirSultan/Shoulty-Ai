import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Shoutly AI terms and conditions for platform usage, billing, and policies.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
