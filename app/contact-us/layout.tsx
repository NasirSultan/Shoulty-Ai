import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Shoutly AI team for sales, support, or partnership inquiries.",
  alternates: {
    canonical: "/contact-us",
  },
};

export default function ContactUsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
