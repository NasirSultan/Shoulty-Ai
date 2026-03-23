import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Shoutly AI account and start automating your content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUp() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
