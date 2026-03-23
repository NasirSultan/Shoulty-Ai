"use client";
import { useEffect, useState } from "react";
import { fetchProfile } from "@/api/authApi";

export interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    brandName?: string;
    website?: string;
    phone?: string;
    connectedSocials?: string[];
    profilePicture?: string;
    role?: string;
    [key: string]: unknown;
}

/** Returns initials (up to 2 chars) from a full name string */
export function getInitials(name?: string): string {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Reads the logged-in user profile from localStorage immediately,
 * then refreshes from the backend API (if a token is present).
 */
export function useUserProfile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Serve cached data instantly so UI doesn't flash
        try {
            const raw = localStorage.getItem("shoutly_user");
            if (raw) setUser(JSON.parse(raw) as UserProfile);
        } catch {
            // ignore
        }

        // 2. Refresh from API if authenticated
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("shoutly_token")
                : null;

        if (!token) {
            setLoading(false);
            return;
        }

        fetchProfile()
            .then((data: unknown) => {
                const fresh =
                    (data as { user?: UserProfile })?.user ??
                    (data as UserProfile);
                if (fresh && typeof fresh === "object") {
                    localStorage.setItem("shoutly_user", JSON.stringify(fresh));
                    setUser(fresh as UserProfile);
                }
            })
            .catch(() => {
                // silent — already showing cached data
            })
            .finally(() => setLoading(false));
    }, []);

    return { user, loading, initials: getInitials(user?.name) };
}
