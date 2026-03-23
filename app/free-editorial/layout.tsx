import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Editorial",
  description:
    "Access free social media editorial resources and planning ideas from Shoutly AI.",
  alternates: {
    canonical: "/free-editorial",
  },
};

export default function FreeEditorialLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
