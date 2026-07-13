"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    ChevronDown, Menu, X, Search,
    LayoutGrid, Sparkles, Volume2,
    Store, Utensils, ShoppingBag, HeartPulse, Dumbbell, Building2, Users, Rocket, Briefcase, Landmark,
    Image as ImageIcon, Clapperboard, MessageSquare, Hash, Clock, Calendar, Share2, ListChecks,
    BarChart3, Palette, FolderOpen, CheckSquare, Plug,
    ArrowLeftRight, RotateCcw,
    CreditCard, Columns3, HelpCircle, CalendarCheck,
    Handshake, ShieldCheck, FileText, Mail, Scale, UserCircle,
} from "lucide-react";
import {
    FaXTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok,
    FaThreads, FaBluesky, FaYoutube, FaPinterest, FaGoogle,
} from "react-icons/fa6";
import { logout } from "@/api/authApi";

interface UserProfile {
    name?: string;
    email?: string;
    picture?: string;
}

type MenuItem = {
    label: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    desc?: string;
    badge?: string;
    external?: boolean;
};

type MenuColumn = {
    title: string;
    items: MenuItem[];
};

type MegaMenu = {
    label: string;
    href?: string;
    columns: MenuColumn[];
    featured: {
        eyebrow: string;
        title: string;
        desc: string;
        cta: string;
        href?: string;
    };
};

// ── Mega menu content ────────────────────────────────────────────────────
// Items with a real page/anchor in this app get an href; everything else is
// left without one and renders as an inactive "coming soon" row.
const MEGA_MENUS: MegaMenu[] = [
    {
        label: "Home",
        href: "/",
        columns: [
            {
                title: "Get oriented",
                items: [
                    { label: "Overview", href: "/", icon: LayoutGrid, desc: "See how the whole platform fits together." },
                    { label: "Why Shoutly AI", href: "/#who-we-help", icon: Sparkles, desc: "What makes it different from a scheduler." },
                    { label: "What's new", icon: Volume2, desc: "Latest releases, shipped weekly.", badge: "NEW" },
                ],
            },
        ],
        featured: {
            eyebrow: "FEATURED",
            title: "A month of posts in one sitting",
            desc: "Describe your business once. Shoutly drafts, designs, and schedules a full content calendar you can edit.",
            cta: "Try the generator",
            href: "/#generator",
        },
    },
    {
        label: "Solutions",
        columns: [
            {
                title: "By industry",
                items: [
                    { label: "Local Businesses", icon: Store },
                    { label: "Restaurants", href: "/for/restaurants", icon: Utensils },
                    { label: "Retail", icon: ShoppingBag },
                    { label: "Healthcare", icon: HeartPulse },
                    { label: "Fitness", href: "/for/fitness-studios", icon: Dumbbell },
                    { label: "Real Estate", href: "/for/real-estate", icon: Building2 },
                    { label: "Agencies", icon: Users },
                    { label: "Startups", icon: Rocket },
                    { label: "Professional Services", icon: Briefcase },
                    { label: "Enterprise", icon: Landmark },
                ],
            },
            {
                title: "By channel",
                items: [
                    { label: "X", icon: FaXTwitter },
                    { label: "Instagram", icon: FaInstagram },
                    { label: "Facebook", icon: FaFacebook },
                    { label: "Bluesky", icon: FaBluesky },
                    { label: "LinkedIn", icon: FaLinkedin },
                    { label: "TikTok", icon: FaTiktok },
                    { label: "Threads", icon: FaThreads },
                    { label: "YouTube", icon: FaYoutube },
                    { label: "Pinterest", icon: FaPinterest },
                    { label: "Google Biz", icon: FaGoogle },
                ],
            },
        ],
        featured: {
            eyebrow: "POPULAR",
            title: "Built for one-person marketing teams",
            desc: "Local businesses publish to six channels a week on Shoutly — without hiring an agency.",
            cta: "See how it works",
            href: "/#who-we-help",
        },
    },
    {
        label: "Features",
        columns: [
            {
                title: "AI creation",
                items: [
                    { label: "AI Content Generator", href: "/#generator", icon: Sparkles, desc: "Turn one prompt into a week of posts.", badge: "POPULAR" },
                    { label: "AI Image Generator", href: "/#generator", icon: ImageIcon, desc: "On-brand visuals in your colors and fonts." },
                    { label: "AI Reel Generator", href: "/#generator", icon: Clapperboard, desc: "Short-form video from a script or a URL.", badge: "NEW" },
                    { label: "AI Caption Generator", icon: MessageSquare, desc: "Captions tuned per platform, not copy-pasted." },
                    { label: "AI Hashtag Generator", icon: Hash, desc: "Tags ranked by reach, not by volume." },
                ],
            },
            {
                title: "Publishing",
                items: [
                    { label: "Social Media Scheduler", icon: Clock, desc: "Queue posts for the times your audience shows up." },
                    { label: "Content Calendar", href: "/free-editorial", icon: Calendar, desc: "Every channel on one drag-and-drop grid." },
                    { label: "Multi-Platform Publishing", icon: Share2, desc: "Write once, reformat for each network." },
                    { label: "Bulk Scheduling", icon: ListChecks, desc: "Upload a CSV, fill the whole quarter." },
                ],
            },
            {
                title: "Management",
                items: [
                    { label: "Analytics Dashboard", icon: BarChart3, desc: "See what earned reach, and what didn't." },
                    { label: "Brand Kit", icon: Palette, desc: "Lock your colors, fonts, and voice." },
                    { label: "Media Library", href: "/#library", icon: FolderOpen, desc: "Every asset, searchable and reusable." },
                    { label: "Team Collaboration", icon: Users, desc: "Comment, assign, and hand off in place." },
                    { label: "Approval Workflow", icon: CheckSquare, desc: "Nothing ships until the right person signs off." },
                    { label: "Integrations", icon: Plug, desc: "Canva, Drive, Slack, Zapier, and more." },
                ],
            },
        ],
        featured: {
            eyebrow: "NEW THIS MONTH",
            title: "AI Reel Generator",
            desc: "Paste a product URL. Shoutly writes the script, cuts the clips, adds captions, and queues it to Reels, TikTok, and Shorts.",
            cta: "Generate a reel",
            href: "/#generator",
        },
    },
    {
        label: "Compare",
        columns: [
            {
                title: "Popular comparisons",
                items: [
                    { label: "Buffer vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "Hootsuite vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "Later vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "SocialPilot vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "Metricool vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "Publer vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "Canva vs Shoutly AI", icon: ArrowLeftRight },
                    { label: "Sprout Social vs Shoutly AI", icon: ArrowLeftRight },
                ],
            },
            {
                title: "Alternatives",
                items: [
                    { label: "Buffer Alternative", icon: RotateCcw },
                    { label: "Hootsuite Alternative", icon: RotateCcw },
                    { label: "Later Alternative", icon: RotateCcw },
                    { label: "SocialPilot Alternative", icon: RotateCcw },
                    { label: "Metricool Alternative", icon: RotateCcw },
                    { label: "Canva Alternative", icon: RotateCcw },
                    { label: "Sprout Social Alternative", icon: RotateCcw },
                ],
            },
        ],
        featured: {
            eyebrow: "SIDE BY SIDE",
            title: "Every tool, one table",
            desc: "Features, limits, and real pricing across eight platforms — no marketing math.",
            cta: "View all comparisons",
        },
    },
    {
        label: "Pricing",
        href: "/pricing",
        columns: [
            {
                title: "Plans & billing",
                items: [
                    { label: "Pricing Plans", href: "/pricing", icon: CreditCard, desc: "Start free. Upgrade when you outgrow it." },
                    { label: "Compare Plans", href: "/pricing", icon: Columns3, desc: "Every limit and feature, line by line." },
                    { label: "Enterprise", icon: Landmark, desc: "SSO, SLAs, and a named contact." },
                    { label: "FAQs", href: "/pricing", icon: HelpCircle, desc: "Billing, seats, limits, and cancellation." },
                    { label: "Book a Demo", icon: CalendarCheck, desc: "30 minutes with a product specialist." },
                ],
            },
        ],
        featured: {
            eyebrow: "FREE FOREVER",
            title: "Three channels, no card",
            desc: "Generate, schedule, and publish on the free plan for as long as you like.",
            cta: "Start free trial",
            href: "/sign-up",
        },
    },
    {
        label: "Company",
        columns: [
            {
                title: "Company & resources",
                items: [
                    { label: "About Us", href: "/about-us", icon: UserCircle, desc: "Who we are and why we built this." },
                    { label: "Partners", icon: Handshake, desc: "Agencies and resellers building on Shoutly." },
                    { label: "Help Center", href: "/help-center", icon: HelpCircle, desc: "Guides, troubleshooting, and API docs." },
                    { label: "Security", href: "/security", icon: ShieldCheck, desc: "How we protect your accounts and data." },
                    { label: "Careers", href: "/careers", icon: Briefcase, desc: "Open roles across product and growth.", badge: "HIRING" },
                    { label: "Blog", href: "https://blog.shoutlyai.com/", icon: FileText, desc: "Playbooks, teardowns, and benchmarks.", external: true },
                    { label: "Contact", href: "/contact-us", icon: Mail, desc: "Talk to sales or support." },
                    { label: "Legal Hub", icon: Scale, desc: "Privacy, terms, GDPR, DPDP, and more." },
                ],
            },
        ],
        featured: {
            eyebrow: "TRUST",
            title: "Enterprise-ready by default",
            desc: "SSL, GDPR, CCPA, and DPDP compliant. 99.9% uptime, hosted on AWS.",
            cta: "Read the security brief",
            href: "/security",
        },
    },
];

const GRAD = "linear-gradient(115deg,#F97316,#EA580C)";

function MegaMenuItemRow({ item }: { item: MenuItem }) {
    const Icon = item.icon;
    const body = (
        <div className={`flex ${item.desc ? "items-start" : "items-center"} gap-2.5 rounded-lg px-2.5 py-1.5 -mx-2.5 transition-colors group/item`}>
            <span
                className={`${item.desc ? "mt-0.5" : ""} w-[26px] h-[26px] rounded-md flex items-center justify-center flex-shrink-0 ${
                    item.href ? "bg-orange-50 text-orange-600 group-hover/item:bg-orange-100" : "bg-gray-50 text-gray-300"
                }`}
            >
                <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="min-w-0">
                <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${item.href ? "text-gray-900" : "text-gray-400"}`}>
                    {item.label}
                    {item.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                            {item.badge}
                        </span>
                    )}
                </span>
                {item.desc && (
                    <span className={`block text-[11px] mt-0.5 leading-snug ${item.href ? "text-gray-500" : "text-gray-300"}`}>
                        {item.desc}
                    </span>
                )}
            </span>
        </div>
    );

    if (!item.href) {
        return (
            <div className="cursor-not-allowed select-none" title="Coming soon">
                {body}
            </div>
        );
    }

    if (item.external) {
        return (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="block hover:bg-orange-50/60 rounded-lg -mx-0">
                {body}
            </a>
        );
    }

    return (
        <Link href={item.href} className="block hover:bg-orange-50/60 rounded-lg -mx-0">
            {body}
        </Link>
    );
}

function MegaMenuPanel({ menu }: { menu: MegaMenu }) {
    return (
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[90%] bg-white border border-gray-100 shadow-xl rounded-b-2xl">
            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-10">
                <div className={`flex-1 grid gap-8`} style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0,1fr))` }}>
                    {menu.columns.map((col) => (
                        <div key={col.title}>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{col.title}</div>
                            <div className={col.items.length > 6 ? "grid grid-cols-2 gap-x-8 gap-y-0.5 max-w-md" : "space-y-0.5"}>
                                {col.items.map((item) => (
                                    <MegaMenuItemRow key={item.label} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Featured card */}
                <div className="w-72 flex-shrink-0 rounded-2xl p-5 bg-orange-50 border border-orange-100">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-orange-600 mb-2">
                        {menu.featured.eyebrow}
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-2 leading-snug">{menu.featured.title}</div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">{menu.featured.desc}</p>
                    {menu.featured.href ? (
                        <Link href={menu.featured.href} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700">
                            {menu.featured.cta} <span aria-hidden>→</span>
                        </Link>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-300 cursor-not-allowed" title="Coming soon">
                            {menu.featured.cta} <span aria-hidden>→</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [activeLink, setActiveLink] = useState<string>("/");
    const pathname = usePathname();
    const router = useRouter();
    const profileRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);

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

        setUser(null);
    };

    // Keep header state in sync with login/logout and route changes
    useEffect(() => {
        refreshAuthState();
    }, [pathname]);

    useEffect(() => {
        const handler = () => refreshAuthState();
        window.addEventListener("storage", handler);
        window.addEventListener("auth-changed", handler);

        return () => {
            window.removeEventListener("storage", handler);
            window.removeEventListener("auth-changed", handler);
        };
    }, []);

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

    // Sync activeLink when pathname changes (for real page navigations)
    useEffect(() => {
        setActiveLink(pathname);
    }, [pathname]);

    const isActive = (href: string) => {
        // Once a hash link is clicked, match only by activeLink (ignore pathname for home)
        if (activeLink.includes("#") || href.includes("#")) return activeLink === href;
        if (href === "/" && pathname !== "/") return false;
        return activeLink === href || pathname === href;
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
        <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200${isScrolled ? " shadow-sm" : ""}`}>
            <div
                ref={navRef}
                onMouseLeave={() => setOpenMenu(null)}
                className="relative"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center">
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
                    <div className="hidden min-[930px]:flex items-center gap-1 text-sm font-medium text-black h-full ml-8">
                        {MEGA_MENUS.map((menu) => {
                            const open = openMenu === menu.label;
                            const active = menu.href ? isActive(menu.href) : false;
                            return (
                                <button
                                    key={menu.label}
                                    onMouseEnter={() => setOpenMenu(menu.label)}
                                    onClick={() => {
                                        if (menu.href) {
                                            setActiveLink(menu.href);
                                            setOpenMenu(null);
                                            router.push(menu.href);
                                        } else {
                                            setOpenMenu(open ? null : menu.label);
                                        }
                                    }}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        open || active ? "bg-orange-50 text-orange-600" : "text-black hover:text-orange-500"
                                    }`}
                                >
                                    {menu.label}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Right side (Desktop only) */}
                    <div className="hidden min-[930px]:flex text-black items-center gap-4 ml-auto">
                        <button
                            className="text-gray-300 cursor-not-allowed p-1.5"
                            title="Search — coming soon"
                            aria-label="Search (coming soon)"
                        >
                            <Search className="w-[18px] h-[18px]" />
                        </button>

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
                                    Log in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="px-5 py-2 text-white rounded-full text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
                                    style={{ background: GRAD }}
                                >
                                    Start free trial
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger (Mobile only) */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="min-[930px]:hidden ml-auto p-2 -mr-2 text-black rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Desktop mega-menu panel */}
                {openMenu && (
                    <MegaMenuPanel menu={MEGA_MENUS.find((m) => m.label === openMenu)!} />
                )}
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="min-[930px]:hidden bg-white border-t px-5 py-5 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
                    {MEGA_MENUS.map((menu) => {
                        const expanded = mobileAccordion === menu.label;

                        if (menu.href && menu.columns.length === 1 && menu.columns[0].items.length <= 1) {
                            return (
                                <Link
                                    key={menu.label}
                                    href={menu.href}
                                    className={`block text-base font-medium ${isActive(menu.href) ? "text-orange-500" : "text-black"}`}
                                    onClick={() => { setActiveLink(menu.href!); setMenuOpen(false); }}
                                >
                                    {menu.label}
                                </Link>
                            );
                        }

                        return (
                            <div key={menu.label} className="border border-gray-100 bg-gray-50 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setMobileAccordion(expanded ? null : menu.label)}
                                    className="w-full flex items-center justify-between px-4 py-3 font-semibold text-black text-sm"
                                >
                                    {menu.label}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                                </button>
                                {expanded && (
                                    <div className="px-4 pb-3 space-y-3">
                                        {menu.href && (
                                            <Link
                                                href={menu.href}
                                                className="block text-sm font-semibold text-orange-600"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                Go to {menu.label} →
                                            </Link>
                                        )}
                                        {menu.columns.map((col) => (
                                            <div key={col.title}>
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">{col.title}</p>
                                                <div className="space-y-1">
                                                    {col.items.map((item) =>
                                                        item.href ? (
                                                            item.external ? (
                                                                <a
                                                                    key={item.label}
                                                                    href={item.href}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block text-sm text-gray-700 py-1"
                                                                    onClick={() => setMenuOpen(false)}
                                                                >
                                                                    {item.label}
                                                                </a>
                                                            ) : (
                                                                <Link
                                                                    key={item.label}
                                                                    href={item.href}
                                                                    className="block text-sm text-gray-700 py-1"
                                                                    onClick={() => setMenuOpen(false)}
                                                                >
                                                                    {item.label}
                                                                </Link>
                                                            )
                                                        ) : (
                                                            <span key={item.label} className="block text-sm text-gray-300 py-1 cursor-not-allowed">
                                                                {item.label}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

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
                                    Log in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="block text-center text-white py-3 rounded-xl text-sm font-medium active:opacity-80"
                                    style={{ background: GRAD }}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Start free trial
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
