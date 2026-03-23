import OTPForm from "@/components/auth/OTPForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Verify Email",
    description: "Verify your email to activate and secure your Shoutly AI account.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function VerifyEmail() {
    return (
        <Suspense fallback={null}>
            <OTPForm />
        </Suspense>
    );
}

