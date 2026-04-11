"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchProfile } from "@/api/authApi";

type Props = {
  children: React.ReactNode;
};

export default function DashboardsAuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const token = localStorage.getItem("shoutly_token");
      if (!token) {
        try {
          const profileResp = await fetchProfile();
          const profileUser =
            (profileResp as { user?: unknown })?.user || profileResp;

          if (!cancelled && profileUser && typeof profileUser === "object") {
            localStorage.setItem("shoutly_user", JSON.stringify(profileUser));
            setAllowed(true);
            return;
          }
        } catch {
          // Ignore and continue to normal redirect.
        }

        if (cancelled) return;
        const nextPath = encodeURIComponent(pathname || "/dashboards");
        router.replace(`/sign-in?next=${nextPath}`);
        setAllowed(false);
        return;
      }
      if (cancelled) return;
      setAllowed(true);
    };

    void checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      cancelled = true;
      window.removeEventListener("auth-changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname, router]);

  if (allowed !== true) {
    return null;
  }

  return <>{children}</>;
}
