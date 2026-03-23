import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Shoutly AI helps businesses generate and schedule social media content at scale.",
  alternates: {
    canonical: "/about-us",
  },
};

export default function AboutUsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
