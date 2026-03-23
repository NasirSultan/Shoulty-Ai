import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find tutorials, FAQs, and support documentation for using Shoutly AI.",
  alternates: {
    canonical: "/help-center",
  },
};

export default function HelpCenterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
