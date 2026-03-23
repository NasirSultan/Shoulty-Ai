import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore open roles at Shoutly AI and help build the future of social media automation.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
