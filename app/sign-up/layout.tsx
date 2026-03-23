import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Shoutly AI account and generate a full year of social media content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
