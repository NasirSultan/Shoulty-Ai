import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Review the Shoutly AI privacy policy and how we collect, use, and protect your information.",
  alternates: {
    canonical: "/policy",
  },
};

export default function PolicyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
