import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Press & Media",
  description:
    "Read Shoutly AI press updates, announcements, and media resources.",
  alternates: {
    canonical: "/press-media",
  },
};

export default function PressMediaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
