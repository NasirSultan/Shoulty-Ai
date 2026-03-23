import NewPasswordForm from "@/components/auth/NewPasswordForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Set New Password",
    description: "Set a new password to securely access your Shoutly AI account.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NewPassword() {
    return (
        <Suspense fallback={null}>
            <NewPasswordForm />
        </Suspense>
    );
}

