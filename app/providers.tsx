"use client";

import { SessionProvider } from "next-auth/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MobileSidebarProvider } from "@/context/MobileSidebarContext";

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <SessionProvider refetchOnWindowFocus={false}>
                <MobileSidebarProvider>
                    {children}
                </MobileSidebarProvider>
            </SessionProvider>
        </GoogleOAuthProvider>
    );
}
