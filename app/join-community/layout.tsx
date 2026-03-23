import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Join Community",
  description:
    "Join the Shoutly AI community to learn social growth playbooks and automation tips.",
  alternates: {
    canonical: "/join-community",
  },
};

export default function JoinCommunityLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
