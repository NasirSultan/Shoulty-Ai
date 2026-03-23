import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to continue to your Shoutly AI workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignIn() {
  return <SignInForm />;
}
