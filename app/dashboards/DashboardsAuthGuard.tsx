"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function DashboardsAuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("shoutly_token");
      if (!token) {
        const nextPath = encodeURIComponent(pathname || "/dashboards");
        router.replace(`/sign-in?next=${nextPath}`);
        setAllowed(false);
        return;
      }
      setAllowed(true);
    };

    checkAuth();
    window.addEventListener("auth-changed", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("auth-changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname, router]);

  if (allowed !== true) {
    return null;
  }

  return <>{children}</>;
}
