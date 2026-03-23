import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Understand how cookies and similar technologies are used on Shoutly AI.",
  alternates: {
    canonical: "/cookie",
  },
};

export default function CookieLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
