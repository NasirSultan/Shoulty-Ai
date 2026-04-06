"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, SparklesIcon, ChevronDown, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import ShoutlyLogo from "@/components/common/ShoutlyLogo";
import { logout } from "@/api/authApi";

interface UserProfile {
    name?: string;
    email?: string;
    picture?: string;
}

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const profileRef = useRef<HTMLDivElement>(null);

    const icons = [User, SparklesIcon, User, SparklesIcon];
    const primaryLinks = [
        { label: "Home", href: "/" },
        { label: "Who We Help", href: "/#who-we-help" },
        { label: "Library", href: "/#library" },
        { label: "Pricing", href: "/#pricing" },
    ];
    const resourceLinks = [
        { label: "Blog", href: "https://blog.shoutlyai.com/" },
        { label: "Help Center / FAQ", href: "/help-center" },
        { label: "Case Studies", href: "/case-studies" },
    ];
    const companyLinks = [
        { label: "About Us", href: "/about-us" },
        { label: "Contact", href: "/contact-us" },
        { label: "Press", href: "/press-media" },
        { label: "Careers", href: "/careers" },
    ];

    const refreshAuthState = () => {
        const token = localStorage.getItem("shoutly_token");
        if (token) {
            const stored = localStorage.getItem("shoutly_user");
            if (stored) {
                try {
                    setUser(JSON.parse(stored));
                } catch {
                    setUser({});
                }
            }
            else setUser({}); // logged in but no profile data yet
            return;
        }

        if (status === "authenticated" && session?.user) {
            setUser({
                name: session.user.name ?? undefined,
                email: session.user.email ?? undefined,
                picture: session.user.image ?? undefined,
            });
            return;
        }

        setUser(null);
    };

    // Keep header state in sync with login/logout and route changes
    useEffect(() => {
        refreshAuthState();
    }, [pathname, status, session]);

    useEffect(() => {
        const handler = () => refreshAuthState();
        window.addEventListener("storage", handler);
        window.addEventListener("auth-changed", handler);

        return () => {
            window.removeEventListener("storage", handler);
            window.removeEventListener("auth-changed", handler);
        };
    }, [status, session]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        logout();
        localStorage.removeItem("shoutly_user");
        window.dispatchEvent(new Event("auth-changed"));
        setUser(null);
        setProfileOpen(false);
        router.push("/");
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => {
        if (path === "/" && pathname !== "/") return false;
        return pathname === path;
    };

    if (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/dashboards" ||
        pathname.startsWith("/dashboards/")
    ) {
        return null;
    }

    return (
        <header className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-200${isScrolled ? " shadow-sm" : ""}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="relative flex-shrink-0 w-24 h-8 sm:w-36 sm:h-12">
                        <a href="/">
                            <Image
                                src="/images/logo.png"
                                alt="Shoutly AI logo"
                                width={160}
                                height={56}
                                sizes="(max-width: 640px) 96px, 144px"
                                priority
                                className="w-24 h-8 sm:w-36 sm:h-12 object-contain"
                            />
                        </a>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden min-[930px]:flex items-center gap-8 text-sm font-medium text-black">
                        {primaryLinks.map((link) => (
                            <Link key={link.label} href={link.href}>
                                {link.label}
                            </Link>
                        ))}

                        {/* Resources Dropdown */}
                        <div className="relative group">
                            <span className="cursor-pointer py-4">
                                Resources
                            </span>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                                {resourceLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Company Dropdown */}
                        <div className="relative group">
                            <span className="cursor-pointer py-4">Company</span>
                            <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                                {companyLinks.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right side (Desktop only) */}
                    <div className="hidden min-[930px]:flex text-black items-center gap-4">
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    {user.picture ? (
                                        <img
                                            src={user.picture}
                                            alt="Profile"
                                            width={36}
                                            height={36}
                                            loading="lazy"
                                            className="rounded-full border border-gray-200 object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                                            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                                        </div>
                                    )}
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                                        {user.name && (
                                            <div className="px-4 py-2 border-b">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        )}
                                        <Link
                                            href="/dashboards/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/dashboards"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/sign-in" className="text-sm">
                                    Log In
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium"
                                >
                                    Sign Up / Free Trial
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger (Mobile only) */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="min-[930px]:hidden p-2 -mr-2 text-black rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
            </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="min-[930px]:hidden bg-white border-t px-5 py-5 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
                        {primaryLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="block text-base text-black font-medium"
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Resources */}
                            <div className="space-y-2 border border-gray-100 bg-gray-50 rounded-xl p-4">
                                <p className="font-semibold text-black text-sm uppercase tracking-wide mb-2">
                                Resources
                            </p>
                            {resourceLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="block text-sm text-gray-700 py-1"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Company */}
                            <div className="space-y-2 border border-gray-100 bg-gray-50 rounded-xl p-4">
                                <p className="font-semibold text-black text-sm uppercase tracking-wide mb-2">Company</p>
                            {companyLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="block text-sm text-gray-700 py-1"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                            <div className="border-t border-gray-100 pt-4 space-y-3">
                            {user ? (
                                <>
                                    <Link
                                            href="/dashboards/settings"
                                            className="block text-center text-black text-sm font-medium py-2"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/dashboards"
                                            className="block text-center text-black text-sm font-medium py-2"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                                            className="w-full text-center bg-red-600 text-white py-3 rounded-xl text-sm font-medium active:opacity-80"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-in"
                                            className="block text-center text-black text-sm font-medium py-3 border border-gray-200 rounded-xl"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                            className="block text-center bg-black text-white py-3 rounded-xl text-sm font-medium active:opacity-80"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Sign Up / Free Trial
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>
    );
}
