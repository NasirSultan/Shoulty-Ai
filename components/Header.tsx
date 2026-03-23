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
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="relative bg-white font-arial py-10 text-gray-900 dark:text-white selection:text-white overflow-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="relative w-28 h-10 sm:w-40 sm:h-14">
                        <a href="/">
                            <Image
                                src="/images/logo.png"
                                alt="Shoutly AI logo"
                                width={160}
                                height={56}
                                sizes="(max-width: 640px) 112px, 160px"
                                priority
                                className="w-28 h-10 sm:w-40 sm:h-14 object-contain"
                            />
                        </a>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black">
                        <Link href="/">Home</Link>
                        <Link href="/#who-we-help">Who We Help</Link>
                        <Link href="/#library">Library</Link>
                        <Link href="/#pricing">Pricing</Link>

                        {/* Resources Dropdown */}
                        <div className="relative group">
                            <span className="cursor-pointer py-4">
                                Resources
                            </span>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                                <Link
                                    href="https://blog.shoutlyai.com/"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Blog
                                </Link>
                                <Link
                                    href="/help-center"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Help Center / FAQ
                                </Link>
                                <Link
                                    href="/case-studies"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Case Studies
                                </Link>
                            </div>
                        </div>

                        {/* Company Dropdown */}
                        <div className="relative group">
                            <span className="cursor-pointer py-4">Company</span>
                            <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                                <Link
                                    href="/about-us"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    About Us
                                </Link>
                                <Link
                                    href="/contact-us"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Contact
                                </Link>
                                <Link
                                    href="/press-media"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Press
                                </Link>
                                <Link
                                    href="/careers"
                                    className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Careers
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right side (Desktop only) */}
                    <div className="hidden md:flex text-black items-center gap-4">
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
                                            href="/account-setup"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            My Profile
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
                        className="md:hidden text-2xl text-black"
                    >
                        ☰
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden bg-white border-t px-6 py-6 space-y-5">
                        <Link
                            href="/"
                            className="block text-base text-black font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="#features"
                            className="block text-base text-black font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="#who-we-help"
                            className="block text-base text-black font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            Who We Help
                        </Link>
                        <Link
                            href="#pricing"
                            className="block text-base text-black font-medium"
                            onClick={() => setMenuOpen(false)}
                        >
                            Pricing
                        </Link>

                        {/* Resources */}
                        <div className="space-y-2 border border-gray-200 bg-white rounded-lg p-3">
                            <p className="font-semibold text-black">
                                Resources
                            </p>
                            <Link
                                href="/blog"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Blog
                            </Link>
                            <Link
                                href="/help-center"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Help Center / FAQ
                            </Link>
                            <Link
                                href="/case-studies"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Case Studies
                            </Link>
                            <Link
                                href="/free-tools"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Free Tools
                            </Link>
                        </div>

                        {/* Company */}
                        <div className="space-y-2 border border-gray-200 bg-white rounded-lg p-3">
                            <p className="font-semibold text-black">Company</p>
                            <Link
                                href="/about"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                About Us
                            </Link>
                            <Link
                                href="/contact"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Contact
                            </Link>
                            <Link
                                href="/press"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Press
                            </Link>
                            <Link
                                href="/careers"
                                className="block text-sm text-gray-700"
                                onClick={() => setMenuOpen(false)}
                            >
                                Careers
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="border-t pt-4 space-y-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/account-setup"
                                        className="block text-center text-black text-sm font-medium"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/dashboards"
                                        className="block text-center text-black text-sm font-medium"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                                        className="w-full text-center bg-red-600 text-white py-3 rounded-full text-sm font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/sign-in"
                                        className="block text-center text-black text-sm font-medium"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        className="block text-center bg-black text-white py-3 rounded-full text-sm font-medium"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Sign Up / Free Trial
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
        </header>
    );
}
