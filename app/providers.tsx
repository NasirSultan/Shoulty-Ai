"use client";

import { SessionProvider } from "next-auth/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const content = (
        <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
    );

    if (!googleClientId) {
        return content;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            {content}
        </GoogleOAuthProvider>
    );
}
