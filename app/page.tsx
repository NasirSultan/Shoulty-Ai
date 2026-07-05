"use client";
import React, { useRef, useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { RefreshCcw, Image, Film, Zap, Lock } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import Calender from "@/components/calender";
import { fetchImages, fetchIndustries } from "@/api/homeApi";
import { API_ENDPOINTS } from "@/api/configApi";
import {
    streamGeneratePosts,
    generatePromptOnlyImages,
    GeneratedPost,
} from "@/api/postGeneratorApi";
import PostPopup from "@/components/PostPopup";
import { DEMO_POSTS } from "@/data/demo-posts";
import { Testimonials } from "@/components/SocialProof";
import { HomepageFAQ } from "@/components/FAQ";


// Type definitions
interface SubIndustry {
    id: string | number;
    name: string;
}

interface ImageItem {
    id?: string;
    file?: string;
    url?: string;
    name?: string;
    title?: string;
}

interface SubIndustry {
    id: string | number;
    name: string;
}

interface Industry {
    id: string | number;
    name: string;
    subIndustries: SubIndustry[];
}

const MIN_BRAND_DESCRIPTION_CHARS = 30;
const MAX_BRAND_DESCRIPTION_CHARS = 300;
const MAX_REGENERATIONS_PER_DAY = 3;
const REGEN_STORAGE_KEY = "shoutly_regen_limit";
const GENERATE_STORAGE_KEY = "shoutly_generate_limit";
const GENERATED_POSTS_KEY = "shoutly_generated_posts";

const WHO_WE_HELP = [
    { key: "Health", emoji: "💪", title: "Health & Fitness", visible: [{ href: "/GYM.html", label: "Gym / Fitness Studio" }, { href: "/yoga-centre.html", label: "Yoga Centre" }, { href: "/zumba-aerobic-studio.html", label: "Zumba / Aerobic Studio" }, { href: "/Crossfit_Personal-Trainer.html", label: "CrossFit / Personal Trainer" }], extra: [{ href: "/physiotheraphy.html", label: "Physiotherapy Clinic" }, { href: "/Dieticians.html", label: "Dietician / Nutritionist" }, { href: "/wellness-supplements.html", label: "Wellness & Supplements" }, { href: "/weight-loss-body-transformation.html", label: "Weight Loss / Body Transformation" }] },
    { key: "food", emoji: "🍔", title: "Food & Beverage", visible: [{ href: "/veg-multicuisine-restaurant.html", label: "Restaurants (veg / multicuisine)" }, { href: "/NV RESTAURANT.html", label: "Restaurants (non-veg / multicuisine)" }, { href: "/Cafe.html", label: "Cafes & Coffee Shops" }, { href: "/Juicebar_smoothiebar.html", label: "Juice Bars / Smoothie Bars" }], extra: [{ href: "/CAKE.html", label: "Bakery / Cake Shop" }, { href: "/Cloud-Kitchen.html", label: "Cloud Kitchen" }, { href: "/catering_.html", label: "Catering Services" }, { href: "/food-truck.html", label: "Food Trucks" }, { href: "/namkeen.html", label: "Sweets & Namkeen Stores" }, { href: "/organic-food.html", label: "Organic & Healthy Food Brands" }] },
    { key: "fashion", emoji: "👗", title: "Fashion & Lifestyle", visible: [{ href: "/CLOTHING-AND-BOUTIQUE.html", label: "Clothing Store / Boutique" }, { href: "/FASHION-DESIGNER(1).html", label: "Fashion Designer" }, { href: "/textile.html", label: "Footwear" }, { href: "/watches-jewelry.html", label: "Watches / Jewelry" }], extra: [{ href: "/perfume.html", label: "Perfume / Fragrance Brand" }] },
    { key: "real", emoji: "🏗️", title: "Real Estate & Construction", visible: [{ href: "/real-estate.html", label: "Real Estate Agents" }, { href: "/DEVELOPERS_AND_BUILDERS.html", label: "Developers / Builders" }, { href: "/GATED-COMMUNITIES.html", label: "Farm Plots / Gated Communities" }, { href: "/interior.html", label: "Interior Design" }], extra: [{ href: "/Architecture.html", label: "Architecture Firms" }, { href: "/PROPERTY-CONSULTANT.html", label: "Property Consultants" }, { href: "/Construction-materials.html", label: "Home Construction Materials" }] },
    { key: "edu", emoji: "🎓", title: "Education & Coaching", visible: [{ href: "/SCHOOL-AND-CLG.html", label: "Schools & Colleges" }, { href: "/COACHING-INSTITUTE.html", label: "Coaching Institutes (NEET / JEE / UPSC / CAT)" }, { href: "/coding-academy.html", label: "Coding Academy / EdTech" }, { href: "/ONLINE-TUTOR.html", label: "Online Tutors" }, { href: "/Pre-school_Montessori.html", label: "Pre-School / Montessori" }], extra: [{ href: "/training-centers.html", label: "Skill Training Centres" }, { href: "/IELTS.html", label: "IELTS / Language Centres" }] },
    { key: "finance", emoji: "💼", title: "Finance & Business Services", visible: [{ href: "/CA_GST.html", label: "CA / Tax / GST Services" }, { href: "/Insurance.html", label: "Insurance Agents" }, { href: "/mutual-fund.html", label: "Mutual Fund Advisors" }, { href: "/Cripto-and-Trading.html", label: "Stock & Crypto Trading Services" }], extra: [{ href: "/Business-Consultant.html", label: "Business Consultants" }, { href: "/accounting-firm.html", label: "Accounting Firms" }, { href: "/Loan.html", label: "Loan Agents" }] },
    { key: "medical", emoji: "🩺", title: "Medical & Healthcare", visible: [{ href: "/physiotheraphy.html", label: "Hospitals & Clinics" }, { href: "/physiotheraphy.html", label: "Dentists" }, { href: "/physiotheraphy.html", label: "Dermatologists" }, { href: "/physiotheraphy.html", label: "Eye Clinics" }], extra: [{ href: "/physiotheraphy.html", label: "Pharmacy / Medical Stores" }, { href: "/physiotheraphy.html", label: "Diagnostic Laboratories" }, { href: "/physiotheraphy.html", label: "Home Nursing Services" }] },
    { key: "tech", emoji: "💻", title: "Technology & IT Services", visible: [{ href: "/coding-academy.html", label: "SaaS Products" }, { href: "/website-development-social-media-automation.html", label: "Website Development" }, { href: "/coding-academy.html", label: "App Development" }, { href: "/coding-academy.html", label: "Digital Marketing Agencies" }], extra: [{ href: "/coding-academy.html", label: "AI Tools" }, { href: "/coding-academy.html", label: "Cyber Security" }, { href: "/coding-academy.html", label: "Tech Startups" }] },
    { key: "hospitality", emoji: "🏨", title: "Hospitality & Tourism", visible: [{ href: "/hotels-resorts.html", label: "Hotels / Resorts" }, { href: "/travel-agencies.html", label: "Travel Agencies" }, { href: "/tour-packages.html", label: "Tour Packages" }, { href: "/homestays-airbnb-hosts.html", label: "Homestays / Airbnb Hosts" }], extra: [{ href: "/car-rentals.html", label: "Car Rentals" }, { href: "/adventure-tourism.html", label: "Adventure Tourism" }] },
    { key: "auto", emoji: "🚗", title: "Automobile Industry", visible: [{ href: "/car-showrooms.html", label: "Car Showrooms" }, { href: "/two-wheeler-dealers.html", label: "Two-Wheeler Dealers" }, { href: "/auto-repair-workshops.html", label: "Auto Repair Workshops" }, { href: "/car-spa-detailing.html", label: "Car Spa / Detailing" }], extra: [{ href: "/car-accessories-and-parts.html", label: "Car Accessories & Parts" }] },
    { key: "home", emoji: "💅", title: "Home & Lifestyle", visible: [{ href: "/furniture-store.html", label: "Furniture Store" }, { href: "/home-decor-brand.html", label: "Home Decor Brand" }, { href: "/kitchenware.html", label: "Kitchenware" }, { href: "/electronics-and-appliances.html", label: "Electronics & Appliances" }], extra: [{ href: "/cleaning-pest-control.html", label: "Cleaning / Pest Control" }] },
    { key: "events", emoji: "🎉", title: "Events & Entertainment", visible: [{ href: "/catering_.html", label: "Event Planners" }, { href: "/catering_.html", label: "Wedding Photographers" }, { href: "/catering_.html", label: "Videography / Drone Shoots" }, { href: "/catering_.html", label: "DJs / Bands" }], extra: [{ href: "/catering_.html", label: "Stage Decor & Lighting" }, { href: "/catering_.html", label: "Corporate Event Organizers" }] },
    { key: "sports", emoji: "🏔️", title: "Sports & Outdoor", visible: [{ href: "/Crossfit_Personal-Trainer.html", label: "Sports Academies" }, { href: "/Crossfit_Personal-Trainer.html", label: "Cricket Training" }, { href: "/Crossfit_Personal-Trainer.html", label: "Football Clubs" }, { href: "/Crossfit_Personal-Trainer.html", label: "Swimming Schools" }], extra: [{ href: "/Crossfit_Personal-Trainer.html", label: "Trekking & Adventure Gear" }] },
    { key: "retail", emoji: "🛍️", title: "Retail & E-commerce", visible: [{ href: "/textile.html", label: "Accessories (Bags)" }, { href: "/textile.html", label: "Footwear" }, { href: "/textile.html", label: "Gift Shops" }, { href: "/textile.html", label: "Home Appliances" }], extra: [{ href: "/textile.html", label: "Kids Clothing" }, { href: "/textile.html", label: "Laptops & Computers" }, { href: "/textile.html", label: "Men's Clothing" }, { href: "/textile.html", label: "Online Stores" }, { href: "/textile.html", label: "Smartphones" }, { href: "/textile.html", label: "Supermarkets" }, { href: "/textile.html", label: "Toy Stores" }, { href: "/textile.html", label: "Wearables" }, { href: "/textile.html", label: "Women's Clothing" }] },
    { key: "personal", emoji: "👤", title: "Personal Branding", visible: [{ href: "/Business-Consultant.html", label: "Coaches / Trainers" }, { href: "/Business-Consultant.html", label: "Influencers" }, { href: "/Business-Consultant.html", label: "Motivational Speakers" }, { href: "/Business-Consultant.html", label: "Consultants" }], extra: [{ href: "/Business-Consultant.html", label: "Podcasters / Content Creators" }] },
    { key: "ser", emoji: "🏠", title: "Home Services", visible: [{ href: "/interior.html", label: "Electrician / Plumber" }, { href: "/cleaning-pest-control.html", label: "Cleaning Services" }, { href: "/interior.html", label: "Solar Panels" }, { href: "/interior.html", label: "Water Purifier Dealers" }], extra: [{ href: "/interior.html", label: "Interior Woodwork / Modular Kitchen" }] },
    { key: "ngo", emoji: "🤝", title: "NGOs & Foundations", visible: [{ href: "/Business-Consultant.html", label: "Charitable Trusts" }, { href: "/Business-Consultant.html", label: "Women & Child Welfare" }, { href: "/Business-Consultant.html", label: "Environmental Campaigns" }, { href: "/Business-Consultant.html", label: "Social Causes" }], extra: [] },
    { key: "manu", emoji: "🏭", title: "Manufacturing & Industrial", visible: [{ href: "/machinery.html", label: "Machinery Industries" }, { href: "/textile.html", label: "Textile Production" }, { href: "/package.html", label: "Packaging & Printing" }, { href: "/wholesale-distribution.html", label: "Wholesale Distribution" }], extra: [] },
    { key: "beauty", emoji: "✨", title: "Beauty, Salon & Wellness", visible: [{ href: "/perfume.html", label: "Ayurvedic & Holistic" }, { href: "/perfume.html", label: "Beauty Courses" }, { href: "/perfume.html", label: "Grooming Services" }, { href: "/perfume.html", label: "Hair Care Men" }], extra: [{ href: "/perfume.html", label: "Hair Care Women" }, { href: "/perfume.html", label: "Makeup Services" }, { href: "/perfume.html", label: "Nail Care & Art" }, { href: "/perfume.html", label: "Skin Care Services" }, { href: "/perfume.html", label: "Spa & Wellness" }] },
    { key: "entre", emoji: "🚀", title: "Entrepreneurs & Startup Founders", visible: [{ href: "/Business-Consultant.html", label: "Startup Founders" }, { href: "/Business-Consultant.html", label: "Business Owners" }, { href: "/Business-Consultant.html", label: "Solopreneurs" }, { href: "/Business-Consultant.html", label: "Digital Entrepreneurs" }], extra: [{ href: "/Business-Consultant.html", label: "Women Entrepreneurs" }, { href: "/Business-Consultant.html", label: "Young Entrepreneurs" }] },
];

const LOCAL_TEMPLATE_FALLBACKS = [
    "/templates/template-1.jpg",
    "/templates/template-2.jpg",
    "/templates/template-3.jpg",
    "/templates/template-4.jpg",
];

// ── Isolated typing-effect hook (module scope so it doesn't re-render the whole page) ──
function useTypingEffect(words: string[], speed: number = 50, pause: number = 2000) {
    const [index, setIndex] = React.useState(0);
    const [subIndex, setSubIndex] = React.useState(0);
    const [reverse, setReverse] = React.useState(false);

    React.useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        if (subIndex === words[index].length + 1 && !reverse) {
            timeout = setTimeout(() => setReverse(true), pause);
            return () => clearTimeout(timeout);
        }
        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }
        timeout = setTimeout(
            () => setSubIndex((prev) => prev + (reverse ? -1 : 1)),
            reverse ? 1 : 15,
        );
        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, pause]);

    return words[index].substring(0, subIndex);
}

const TYPING_PLACEHOLDERS = [
    "Promote my coffee shop in Bangalore. Cozy vibe, cold brew specialist...",
    "Real estate agent in Austin. Luxury homes, modern architecture...",
    "Personal trainer for busy CEOs. 15-min workouts, high energy...",
];

// Isolated component — only this re-renders on every typing tick, not the whole page
const AnimatedTextarea = React.memo(function AnimatedTextarea({
    value,
    onChange,
    minLength,
    maxLength,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    minLength?: number;
    maxLength?: number;
    className?: string;
}) {
    const placeholder = useTypingEffect(TYPING_PLACEHOLDERS);
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            minLength={minLength}
            maxLength={maxLength}
            className={className}
            placeholder={placeholder}
        />
    );
});

export default function LandingPage() {
    function more(id: string, id2: string, id3: string) {
        document.getElementById(id)!.style.display = "block";
        document.getElementById(id)!.style.animationDuration = "2s";
        document.getElementById(id2)!.style.display = "none";
        document.getElementById(id3)!.style.display = "block";
    }
    function less(id: string, id2: string, id3: string) {
        document.getElementById(id)!.style.display = "none";
        document.getElementById(id)!.style.animationDuration = "2s";
        document.getElementById(id2)!.style.display = "block";
        document.getElementById(id3)!.style.display = "none";
    }
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleVideo = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };
    const scrollToSectionInOneSecond = (sectionId: string) => {
        const target = document.getElementById(sectionId);
        if (!target) return;

        const startY = window.scrollY;
        const targetY = target.getBoundingClientRect().top + window.scrollY;
        const distance = targetY - startY;
        const duration = 1000;
        const startTime = performance.now();

        const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeInOutCubic(progress);

            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };
    const [generateSelectedIndustry, setGenerateSelectedIndustry] =
        useState<string>("");
    const [generateSubIndustries, setGenerateSubIndustries] = useState<
        SubIndustry[]
    >([]);
    const [generateImages, setGenerateImages] = useState<ImageItem[]>([]);
    const [generateLoadingImages, setGenerateLoadingImages] = useState(false);
    const [previewStockImages, setPreviewStockImages] = useState<ImageItem[]>(
        DEMO_POSTS.map(p => ({ id: p.id, url: p.image.imageUrl, name: p.text }))
    );
    const [streamedPosts, setStreamedPosts] = useState<GeneratedPost[]>([]);
    const [streamLoading, setStreamLoading] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [selectedPreviewPost, setSelectedPreviewPost] = useState<{ imageUrl: string; caption?: string } | null>(null);
    const streamAbortRef = useRef<AbortController | null>(null);
    const [generateSelectedSubIndustry, setGenerateSelectedSubIndustry] =
        useState<string | null>(null);
    const [generatePendingSubIndustry, setGeneratePendingSubIndustry] =
        useState<string | null>(null);
    const [brandDescription, setBrandDescription] = useState("");
    const [regenCount, setRegenCount] = useState<number>(0);
    const [hasGeneratedToday, setHasGeneratedToday] = useState<boolean>(false);

    const [libraryShowSubIndustries, setLibraryShowSubIndustries] =
        useState(false);
    const [librarySelectedIndustry, setLibrarySelectedIndustry] =
        useState<string>("");
    const [librarySubIndustries, setLibrarySubIndustries] = useState<
        SubIndustry[]
    >([]);
    const [librarySelectedSubIndustry, setLibrarySelectedSubIndustry] =
        useState<string | null>(null);
    const [libraryImages, setLibraryImages] = useState<ImageItem[]>([]);
    const [libraryLoadingImages, setLibraryLoadingImages] = useState(false);
    const [libraryFilterTerm, setLibraryFilterTerm] = useState("");
    const [activeLibraryImageId, setActiveLibraryImageId] = useState<string | number | null>(null);
    const [libraryContentType, setLibraryContentType] = useState<"photos" | "reels">("photos");
    const [showReelsComingSoon, setShowReelsComingSoon] = useState(false);
    const [showAllIndustries, setShowAllIndustries] = useState(false);
    const imageCacheRef = React.useRef<Record<string, ImageItem[]>>({});
    const imageFetchInFlightRef = React.useRef<Record<string, Promise<ImageItem[]>>>({});

    const [industries, setIndustries] = useState<Industry[]>([]);
    const [loadingIndustries, setLoadingIndustries] = useState(true);
    const handleSelectGenerateIndustry = (id: string) => {
        setGenerateSelectedIndustry(id);
        setGenerateSelectedSubIndustry(null);
        setGeneratePendingSubIndustry(null);
        const selected = industries.find(
            (ind: Industry) => String(ind.id) === String(id),
        );
        setGenerateSubIndustries(selected?.subIndustries || []);
    };
    const [selectedContent, setSelectedContent] = useState<"photos" | "reels" | null>(null);
    const [isRegeneratingBrand, setIsRegeneratingBrand] = useState(false);
    const [regenerateBrandError, setRegenerateBrandError] = useState<string | null>(null);
    const [generateValidationError, setGenerateValidationError] = useState<string | null>(null);
    const regenerateBrandAbortRef = useRef<AbortController | null>(null);
    const getImageCacheKey = (
        type: "generate" | "library",
        subIndustry: string | null,
    ) => `${type}:${subIndustry || "__all__"}`;
    const getPreviewImageIdentity = (img: ImageItem, index: number) =>
        img.id?.toString() ||
        img.file ||
        img.url ||
        `${img.name || img.title || "preview"}-${index}`;
    const getLocalTemplateFallback = (index: number) =>
        LOCAL_TEMPLATE_FALLBACKS[index % LOCAL_TEMPLATE_FALLBACKS.length];
    const getImageUrl = (img?: ImageItem | null) => img?.file || img?.url || "";
    const getSubIndustryFallbackImage = (index: number) => {
        const sourcePool = generateImages.length ? generateImages : previewStockImages;
        if (!sourcePool.length) return getLocalTemplateFallback(index);
        const source = sourcePool[index % sourcePool.length];
        return getImageUrl(source) || getLocalTemplateFallback(index);
    };

    const getImagesWithCache = async (
        type: "generate" | "library",
        subIndustry: string | null,
        setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>,
        setLoading: React.Dispatch<React.SetStateAction<boolean>>,
        forceRefresh = false,
    ) => {
        const cacheKey = getImageCacheKey(type, subIndustry);
        const cached = imageCacheRef.current[cacheKey];

        if (!forceRefresh && cached) {
            setImages(cached);
            setLoading(false);
            return;
        }

        const existingRequest = imageFetchInFlightRef.current[cacheKey];
        if (!forceRefresh && existingRequest) {
            setLoading(true);
            try {
                const data = await existingRequest;
                setImages(data);
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        const requestPromise = fetchImages(subIndustry)
            .then((data) => {
                imageCacheRef.current[cacheKey] = data;
                return data;
            })
            .finally(() => {
                if (imageFetchInFlightRef.current[cacheKey] === requestPromise) {
                    delete imageFetchInFlightRef.current[cacheKey];
                }
            });

        imageFetchInFlightRef.current[cacheKey] = requestPromise;

        try {
            const data = await requestPromise;
            setImages(data);
        } finally {
            setLoading(false);
        }
    };

    const refreshImages = async () => {
        await getImagesWithCache(
            "library",
            librarySelectedSubIndustry,
            setLibraryImages,
            setLibraryLoadingImages,
            true,
        );
    };
    useEffect(() => {
        const today = new Date().toDateString();
        try {
            const stored = JSON.parse(localStorage.getItem(REGEN_STORAGE_KEY) || "{}");
            setRegenCount(stored.date === today ? (stored.count ?? 0) : 0);
        } catch { /* ignore */ }
        try {
            const genStored = JSON.parse(localStorage.getItem(GENERATE_STORAGE_KEY) || "{}");
            if (genStored.date === today) {
                setHasGeneratedToday(true);
                // Restore previously generated posts so user can see them
                const savedPosts = JSON.parse(localStorage.getItem(GENERATED_POSTS_KEY) || "[]");
                if (Array.isArray(savedPosts) && savedPosts.length > 0) {
                    setStreamedPosts(savedPosts);
                }
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const loadGenerateImages = async () => {
            if (!generateSelectedSubIndustry) return;
            await getImagesWithCache(
                "generate",
                generateSelectedSubIndustry,
                setGenerateImages,
                setGenerateLoadingImages,
            );
        };
        loadGenerateImages();
    }, [generateSelectedSubIndustry]);

    useEffect(() => {
        if (!librarySelectedSubIndustry) return;
        setActiveLibraryImageId(null);
        const loadLibraryImages = async () => {
            await getImagesWithCache(
                "library",
                librarySelectedSubIndustry,
                setLibraryImages,
                setLibraryLoadingImages,
            );
        };
        loadLibraryImages();
    }, [librarySelectedSubIndustry]);


    // Filter images locally based on search input
    const libraryFilteredImages = libraryImages.filter((img) => {
        if (!libraryFilterTerm) return true;
        return (
            img.name?.toLowerCase().includes(libraryFilterTerm.toLowerCase()) ||
            img.title?.toLowerCase().includes(libraryFilterTerm.toLowerCase())
        );
    });
    useEffect(() => {
        const seen = new Set<string>();
        const uniqueImages = generateImages.filter((img, index) => {
            const identity = getPreviewImageIdentity(img, index);

            if (seen.has(identity)) return false;
            seen.add(identity);
            return true;
        });

        if (!uniqueImages.length) {
            // If no unique images from API, don't clear. This preserves DEMO_POSTS fallback.
            return;
        }

        const fallbackShuffle = [...uniqueImages];
        for (let i = fallbackShuffle.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [fallbackShuffle[i], fallbackShuffle[j]] = [fallbackShuffle[j], fallbackShuffle[i]];
        }

        if (typeof window === "undefined") {
            setPreviewStockImages(fallbackShuffle.slice(0, 8));
            return;
        }

        const storageKey = `preview-stock-order:${generateSelectedSubIndustry || "__all__"}`;
        const byIdentity = new Map(
            uniqueImages.map((img, index) => [getPreviewImageIdentity(img, index), img]),
        );

        let ordered: ImageItem[] = [];
        try {
            const stored = window.sessionStorage.getItem(storageKey);
            const storedIds = stored ? (JSON.parse(stored) as string[]) : [];
            ordered = storedIds
                .map((id) => byIdentity.get(id))
                .filter((img): img is ImageItem => Boolean(img));
        } catch {
            ordered = [];
        }

        const usedIds = new Set(
            ordered.map((img, index) => getPreviewImageIdentity(img, index)),
        );
        const remaining = fallbackShuffle.filter(
            (img, index) => !usedIds.has(getPreviewImageIdentity(img, index)),
        );
        const nextImages = [...ordered, ...remaining].slice(0, 8);

        try {
            window.sessionStorage.setItem(
                storageKey,
                JSON.stringify(
                    nextImages.map((img, index) => getPreviewImageIdentity(img, index)),
                ),
            );
        } catch {
            // Ignore session storage failures and still use in-memory order.
        }

        setPreviewStockImages(nextImages);
    }, [generateImages, generateSelectedSubIndustry]);

    const previewPrimaryStockImages = previewStockImages.slice(0, 4);
    const previewSecondaryStockImages = previewStockImages.slice(4, 8);
    const shouldShowFirstLoadMsg =
        !streamLoading &&
        streamedPosts.length === 0 &&
        (generateLoadingImages ||
            previewPrimaryStockImages.length < 4 ||
            previewSecondaryStockImages.length < 4);
    const isGenerateReady =
        !!generateSelectedIndustry &&
        !!generatePendingSubIndustry &&
        !!selectedContent &&
        brandDescription.trim().length >= MIN_BRAND_DESCRIPTION_CHARS;

    const getGenerateMissingFields = () => {
        const missing: string[] = [];

        if (!generateSelectedIndustry) missing.push("industry");
        if (!generatePendingSubIndustry) missing.push("sub-industry");
        if (!selectedContent) missing.push("content type (Create Photos or Create Reels)");
        if (brandDescription.trim().length < MIN_BRAND_DESCRIPTION_CHARS) {
            missing.push(`brand description (minimum ${MIN_BRAND_DESCRIPTION_CHARS} characters)`);
        }

        return missing;
    };

    const handleGenerateClick = async () => {
        if (hasGeneratedToday) {
            setGenerateValidationError("You have already generated content today. Come back tomorrow!");
            return;
        }

        const missing = getGenerateMissingFields();
        if (missing.length > 0) {
            setGenerateValidationError(`Please select/fill: ${missing.join(", ")}.`);
            return;
        }

        setGenerateValidationError(null);
        const effectiveIndustryId = generateSelectedIndustry;
        const effectiveSubIndustryId = generatePendingSubIndustry;

        if (!effectiveIndustryId || !effectiveSubIndustryId) {
            setGenerateValidationError("Please select/fill: industry, sub-industry.");
            return;
        }

        const selectedIndustryObj = industries.find(
            (industry: Industry) => String(industry.id) === String(effectiveIndustryId),
        );

        const selectedSubIndustryObj = selectedIndustryObj?.subIndustries.find(
            (sub: SubIndustry) => String(sub.id) === String(effectiveSubIndustryId),
        );

        if (!selectedSubIndustryObj) {
            setGenerateValidationError("Selected sub-industry is invalid. Please select again.");
            return;
        }

        console.log("[Generate] Selected industry:", selectedIndustryObj?.name, "Sub-industry:", selectedSubIndustryObj?.name);

        if (!selectedContent) {
            setSelectedContent("photos");
        }

        setGenerateSubIndustries(selectedIndustryObj?.subIndustries || []);
        setGenerateSelectedSubIndustry(effectiveSubIndustryId);

        // Mark as generated for today
        setHasGeneratedToday(true);
        try {
            localStorage.setItem(GENERATE_STORAGE_KEY, JSON.stringify({ date: new Date().toDateString() }));
        } catch { /* ignore */ }

        scrollToSectionInOneSecond("gcontent");
        await generateStreamPreview(effectiveIndustryId, effectiveSubIndustryId);
    };

    const handleRegenerateBrandDescription = async () => {
        if (isRegeneratingBrand) return;
        if (regenCount >= MAX_REGENERATIONS_PER_DAY) {
            setRegenerateBrandError(`Daily limit reached. You can regenerate ${MAX_REGENERATIONS_PER_DAY} times per day. Try again tomorrow.`);
            return;
        }

        const newCount = regenCount + 1;
        setRegenCount(newCount);
        try {
            localStorage.setItem(REGEN_STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count: newCount }));
        } catch {}

        setRegenerateBrandError(null);
        setIsRegeneratingBrand(true);
        setBrandDescription("");

        regenerateBrandAbortRef.current?.abort();
        const controller = new AbortController();
        regenerateBrandAbortRef.current = controller;

        try {
            const response = await fetch(API_ENDPOINTS.textGeneratorGenerateDirect, {
                method: "POST",
                headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({ prompt: brandDescription.trim() || "Generate a brand description" }),
                signal: controller.signal,
            });

            if (!response.ok || !response.body) {
                throw new Error(`Request failed (${response.status})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let accumulated = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith("data:")) continue;
                    const raw = trimmed.slice(5).trim();
                    if (!raw || raw === "[DONE]") continue;
                    try {
                        const parsed = JSON.parse(raw) as { text?: string; done?: boolean };
                        if (parsed.done) break;
                        if (parsed.text) {
                            accumulated += parsed.text;
                            setBrandDescription(accumulated);
                        }
                    } catch {
                        // skip malformed chunk
                    }
                }
            }

            if (!accumulated) throw new Error("No text received from API.");
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            setRegenerateBrandError(
                error instanceof Error ? error.message : "Could not regenerate. Please try again.",
            );
        } finally {
            if (regenerateBrandAbortRef.current === controller) {
                regenerateBrandAbortRef.current = null;
            }
            setIsRegeneratingBrand(false);
        }
    };

    const generateStreamPreview = async (
        industryIdOverride?: string,
        subIndustryIdOverride?: string,
    ) => {
        console.log("[Stream] Starting dual-stream preview generation...");
        const effectiveIndustryId = industryIdOverride || generateSelectedIndustry;
        const effectiveSubIndustryId = subIndustryIdOverride || generatePendingSubIndustry;
        if (!effectiveIndustryId || !effectiveSubIndustryId) return;

        if (streamAbortRef.current) {
            streamAbortRef.current.abort();
        }
        const controller = new AbortController();
        streamAbortRef.current = controller;

        setStreamLoading(true);
        setStreamedPosts([]);
        setStreamError(null);

        const requestBody = {
            subIndustryId: String(effectiveSubIndustryId),
            prompt: brandDescription.trim(),
        };

        const collectedPosts: GeneratedPost[] = [];
        const completedAttempts = new Set<number>();
        let lastStreamError: string | null = null;

        const handleChunk = (chunk: GeneratedPost & { post?: GeneratedPost }) => {
            console.log("[Stream] Chunk received:", JSON.stringify(chunk).slice(0, 300));

            // Normalise: API may return the post directly at root or nested under "post"
            const rawPost: GeneratedPost = chunk.post ?? chunk;

            if (!rawPost?.image?.imageUrl) return;

            collectedPosts.push(rawPost);
            setStreamedPosts([...collectedPosts]);
            if (collectedPosts.length >= 7) {
                controller.abort();
            }
        };

        const markStreamDone = (attempt: number) => {
            if (completedAttempts.has(attempt)) return;
            completedAttempts.add(attempt);
            setStreamLoading(false);
        };

        const runStream = async (attempt: number) => {
            console.log("[Stream] Starting stream...");
            try {
                await streamGeneratePosts(requestBody, {
                    onChunk: handleChunk,
                    onDone: () => markStreamDone(attempt),
                    signal: controller.signal,
                });
            } catch (error: unknown) {
                if (error instanceof Error && error.name === "AbortError") {
                    console.log("[Stream] Stream aborted (intentional)");
                    markStreamDone(attempt);
                    return;
                }
                const msg = error instanceof Error ? error.message : "Stream error.";
                lastStreamError = msg;
                console.warn(`[Stream] Stream warning (attempt ${attempt}):`, msg);
                markStreamDone(attempt);
            }
        };

        await runStream(1);

        if (collectedPosts.length > 0) {
            setStreamError(null);
        } else {
            const fallbackPrompt = brandDescription.trim() || "Generate social media post ideas for a business";
            const fallbackFromStock = previewStockImages
                .map((img) => img.file || img.url || "")
                .filter(Boolean)
                .slice(0, 4)
                .map((imageUrl, idx) => ({
                    image: { imageUrl },
                    text: `Try this caption style #${idx + 1}: ${fallbackPrompt.slice(0, 140)}`,
                    source: "LLM" as const,
                    index: idx,
                }));

            let fallbackPosts: GeneratedPost[] = fallbackFromStock;

            if (fallbackPosts.length < 4) {
                try {
                    const promptImages = await generatePromptOnlyImages({
                        prompt: fallbackPrompt,
                        count: 4,
                    });

                    fallbackPosts = promptImages
                        .slice(0, 4)
                        .map((item, idx) => ({
                            image: { imageUrl: item.url },
                            text: `AI caption idea #${idx + 1}: ${fallbackPrompt.slice(0, 140)}`,
                            source: "LLM" as const,
                            index: idx,
                        }));
                } catch {
                    // Keep stock fallback if prompt-image fallback fails.
                }
            }

            if (fallbackPosts.length > 0) {
                setStreamedPosts(fallbackPosts);
                setStreamError(null);
            } else if (lastStreamError) {
                setStreamError(lastStreamError);
            }
        }

        console.log(`[Stream] All settled. Final AI posts: ${collectedPosts.length}`);
        // Persist generated posts so they can be restored if the user revisits today
        if (collectedPosts.length > 0) {
            try {
                localStorage.setItem(GENERATED_POSTS_KEY, JSON.stringify(collectedPosts));
            } catch { /* ignore quota errors */ }
        }
        setStreamLoading(false);
    };
    useEffect(() => {
        const loadIndustries = async () => {
            const data = await fetchIndustries();
            setIndustries(data);
            setLoadingIndustries(false);

            // Pre-select "Food & Beverage" for the library to avoid empty state
            const defaultIndustry = data.find((ind: Industry) => ind.name === "Food & Beverage");
            if (defaultIndustry) {
                setLibrarySelectedIndustry(String(defaultIndustry.id));
                const firstSub = defaultIndustry.subIndustries?.[0];
                if (firstSub) {
                    setLibrarySelectedSubIndustry(String(firstSub.id));
                }
            }
        };
        loadIndustries();
    }, []);
    
    // Hero mosaic setup - PERFECTLY MATCHED images with correct titles
const INDUSTRY_PHOTOS = [
  // Healthcare & Medical
  { label: "Healthcare", url: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?w=300&h=200&fit=crop" }, // Doctor with patient
  { label: "Dental Clinic", url: "https://images.pexels.com/photos/3845626/pexels-photo-3845626.jpeg?w=300&h=200&fit=crop" }, // Dentist working
  { label: "Pharmacy", url: "https://images.pexels.com/photos/3683042/pexels-photo-3683042.jpeg?w=300&h=200&fit=crop" }, // Pharmacist
  { label: "Veterinary", url: "https://images.pexels.com/photos/6231768/pexels-photo-6231768.jpeg?w=300&h=200&fit=crop" }, // Vet with dog
  
  // Food & Beverage
  { label: "Restaurant", url: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?w=300&h=200&fit=crop" }, // Pizza
  { label: "Bakery", url: "https://images.pexels.com/photos/5710149/pexels-photo-5710149.jpeg?w=300&h=200&fit=crop" }, // Bread/croissants
  { label: "Coffee Shop", url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=300&h=200&fit=crop" }, // Coffee cup
  
  // Real Estate & Construction
  { label: "Real Estate", url: "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?w=300&h=200&fit=crop" }, // House key
  { label: "Interior Design", url: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=300&h=200&fit=crop" }, // Living room
  { label: "Architecture", url: "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?w=300&h=200&fit=crop" }, // Building exterior
  { label: "Construction", url: "https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg?w=300&h=200&fit=crop" }, // Construction site
  
  // Fitness & Wellness
  { label: "Fitness Gym", url: "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?w=300&h=200&fit=crop" }, // Weights
  { label: "Yoga Studio", url: "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?w=300&h=200&fit=crop" }, // Yoga pose
  { label: "Spa", url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=300&h=200&fit=crop" }, // Massage stones
  
  // Education
  { label: "Education", url: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?w=300&h=200&fit=crop" }, // Kids in classroom
  { label: "University", url: "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?w=300&h=200&fit=crop" }, // Graduation
  
  // Retail & E-commerce
  { label: "E-Commerce", url: "https://images.pexels.com/photos/5632379/pexels-photo-5632379.jpeg?w=300&h=200&fit=crop" }, // Online shopping phone
  { label: "Fashion", url: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=300&h=200&fit=crop" }, // Clothes rack
  
  // Finance & Business - FIXED: Now showing actual accounting/finance images
  { label: "Finance", url: "https://images.pexels.com/photos/4386363/pexels-photo-4386363.jpeg?w=300&h=200&fit=crop" }, // Coins/graph
  { label: "Accounting", url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=300&h=200&fit=crop" }, // Calculator & documents
  
  // Beauty & Salon
  { label: "Hair Salon", url: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?w=300&h=200&fit=crop" }, // Hair cutting
  { label: "Nail Studio", url: "https://plus.unsplash.com/premium_photo-1661290231745-15f1ed6fea88?w=300&h=200&fit=crop" }, // Nail art
  { label: "Barbershop", url: "https://images.pexels.com/photos/247322/pexels-photo-247322.jpeg?w=300&h=200&fit=crop" }, // Barber
  { label: "Skincare", url: "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?w=300&h=200&fit=crop" }, // Face mask
  
  // Travel & Hospitality
  { label: "Travel", url: "https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?w=300&h=200&fit=crop" }, // Beach
  { label: "Hotel", url: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?w=300&h=200&fit=crop" }, // Hotel lobby
  { label: "Resort", url: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?w=300&h=200&fit=crop" }, // Pool resort
  
  // Events & Entertainment
  { label: "Events", url: "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?w=300&h=200&fit=crop" }, // Event setup
  { label: "Weddings", url: "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?w=300&h=200&fit=crop" }, // Wedding rings
  { label: "Music", url: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?w=300&h=200&fit=crop" }, // Guitar
  
  // Technology
  { label: "Tech Startup", url: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?w=300&h=200&fit=crop" }, // Laptop coding
  { label: "Gaming", url: "https://images.pexels.com/photos/316444/pexels-photo-316444.jpeg?w=300&h=200&fit=crop" }, // Gaming setup
  
  // Automotive
  { label: "Automotive", url: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?w=300&h=200&fit=crop" }, // Car engine
  
  // Agriculture
  { label: "Agriculture", url: "https://images.pexels.com/photos/1904716/pexels-photo-1904716.jpeg?w=300&h=200&fit=crop" }, // Tractor field
  
  // Floristry - FIXED: Flower shop image
  { label: "Floristry", url: "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?w=300&h=200&fit=crop" }, // Flower bouquet shop
  
  // Photography
  { label: "Photography", url: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?w=300&h=200&fit=crop" }, // Camera
  
  // Sports
  { label: "Sports", url: "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?w=300&h=200&fit=crop" }, // Soccer ball
];

// Keep the organized order function
const getOrganizedIndustries = () => {
  // Group by category
  const categories = {
    medical: INDUSTRY_PHOTOS.slice(0, 4),
    food: INDUSTRY_PHOTOS.slice(4, 7),
    realEstate: INDUSTRY_PHOTOS.slice(7, 11),
    wellness: INDUSTRY_PHOTOS.slice(11, 14),
    education: INDUSTRY_PHOTOS.slice(14, 16),
    retail: INDUSTRY_PHOTOS.slice(16, 18),
    finance: INDUSTRY_PHOTOS.slice(18, 20),
    beauty: INDUSTRY_PHOTOS.slice(20, 24),
    travel: INDUSTRY_PHOTOS.slice(24, 27),
    events: INDUSTRY_PHOTOS.slice(27, 30),
    tech: INDUSTRY_PHOTOS.slice(30, 32),
    other: INDUSTRY_PHOTOS.slice(32)
  };
  
  // Interleave categories for visual variety
  const result = [];
  const maxLen = Math.max(...Object.values(categories).map(arr => arr.length));
  
  for (let i = 0; i < maxLen; i++) {
    for (const category of Object.values(categories)) {
      if (category[i]) {
        result.push(category[i]);
      }
    }
  }
  
  return result;
};

const [organizedIndustries, setOrganizedIndustries] = useState<any[]>([]);

useEffect(() => {
  // Use organized order instead of random shuffle
  setOrganizedIndustries(getOrganizedIndustries());
}, []);

const columnsCount = 5;
const itemsPerColumn = Math.ceil(organizedIndustries.length / columnsCount);
const directions = ['scrollUp', 'scrollDown', 'scrollUp', 'scrollDown', 'scrollUp'];
const speeds = [120, 160, 110, 150, 130];

    return (
        <div className="relative bg-white font-arial min-h-screen text-gray-900 overflow-hidden">

            {/* HERO SECTION WITH MOSAIC */}
            <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-b from-slate-950 via-slate-900 to-white">
                {/* Orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500 to-red-600 rounded-full blur-3xl opacity-10 -ml-48 -mt-32 animate-pulse" style={{animation: "f1 20s ease-in-out infinite alternate"}}></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full blur-3xl opacity-10 -mr-40 -mt-20 animate-pulse" style={{animation: "f2 24s ease-in-out infinite alternate"}}></div>
                
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",
                    backgroundSize: "52px 52px",
                    WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 100%)",
                    maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 100%)"
                }}></div>

                <div className="relative z-10 w-full max-w-6xl mx-auto px-8 sm:px-12 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                    {/* Left Content */}
                    <div className="flex flex-col gap-6">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">AI Social Media Automation</span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                            One Prompt.<br />
                            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 bg-clip-text text-transparent">365 Days</span>
                            <br />
                            of Content.<br />
                            Zero Effort.
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base text-slate-300 leading-relaxed max-w-md">
                            Shoutly AI generates a full year of on-brand social media content from a single business prompt — scheduled, optimised, and ready to publish across every platform.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button onClick={() => scrollToSectionInOneSecond('industry-cards')} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
                                Start Free Trial
                                <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                                    <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right - Mosaic Gallery with Perfectly Matched Labels */}
<div className="relative">
  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur p-4 h-[340px] sm:h-[400px] lg:h-[480px]">
    {/* Badge */}
    <div className="w-max max-w-[90%] absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 sm:px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span>
      155+ Industries • Authentic Matching Photos
    </div>

    {/* Mosaic Grid */}
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1 h-full overflow-hidden" style={{
      WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 8%, black 90%, transparent 100%)",
      maskImage: "linear-gradient(180deg, transparent 0%, black 8%, black 90%, transparent 100%)"
    }}>
      {Array.from({length: columnsCount}).map((_, colIndex) => {
        const startIdx = colIndex * itemsPerColumn;
        const endIdx = Math.min(startIdx + itemsPerColumn, organizedIndustries.length);
        const columnItems = organizedIndustries.slice(startIdx, endIdx);
        // Repeat for smooth infinite scroll
        const allItems = [...columnItems, ...columnItems, ...columnItems];
        const direction = directions[colIndex];
        const speed = speeds[colIndex];
        const columnVisibility =
          colIndex === 3 ? "hidden sm:flex" : colIndex === 4 ? "hidden lg:flex" : "flex";

        return (
          <div
            key={colIndex}
            className={`${columnVisibility} flex-col gap-1`}
            style={{
              animation: `${direction === 'scrollUp' ? 'scrollUp' : 'scrollDown'} ${speed}s linear infinite`,
            }}
          >
            {allItems.map((item, idx) => (
              <div
                key={`${colIndex}-${idx}`}
                className="relative flex-shrink-0 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 hover:scale-110 transition-all cursor-pointer group h-[60px] sm:h-[75px] lg:h-[90px]"
                style={{zIndex: "auto"}}
              >
                <img 
                  src={item.url} 
                  alt={item.label}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback for any broken images
                    e.currentTarget.src = "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?w=300&h=200&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
                <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold text-white uppercase tracking-wider px-1 drop-shadow-lg" style={{textShadow: '0 1px 4px rgba(0,0,0,.9)'}}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  </div>
</div>
                </div>
            </section>

            <section
                id="generator"
                className="py-16 sm:py-28 text-slate-900 overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, #fff7f0 0%, #ffffff 40%, #fff3ee 100%)" }}
            >
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-3xl -mr-60 -mt-60"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-red-100/20 to-transparent rounded-full blur-3xl -ml-40 -mb-40"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(249,115,22,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-200 mb-5">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            3 Simple Steps
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            Generate Your{" "}
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                Year of Content
                            </span>
                        </h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                            One prompt, 365 days of posts — including local festivals &amp; events.
                        </p>
                    </div>

                    {/* Cards Row */}
                    <div id="industry-cards" className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                        {/* CARD 1 - Industry Selection */}
                        <div className="border border-orange-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-orange-100/40 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-50 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-sm font-black shadow-md shadow-orange-200">
                                    1
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                    Select your industry
                                </h3>
                            </div>

                            <select
                                value={generateSelectedIndustry}
                                // REPLACE WITH:
                                onChange={(e) => handleSelectGenerateIndustry(e.target.value)}
                                className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base font-medium text-slate-700"
                            >
                                <option value="">Choose your industry</option>
                                {loadingIndustries ? (
                                    <option>Loading industries...</option>
                                ) : (
                                    industries.map((industry: Industry) => (
                                        <option
                                            key={industry.id}
                                            value={industry.id}
                                        >
                                            {industry.name}
                                        </option>
                                    ))
                                )}
                            </select>

                            {!loadingIndustries && industries.length > 0 && !generateSelectedIndustry && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    {industries.slice(0, 6).map((industry: Industry, i) => {
                                        const isActive = String(generateSelectedIndustry) === String(industry.id);
                                        return (
                                            <div
                                                key={industry.id}
                                                onClick={() => handleSelectGenerateIndustry(String(industry.id))}
                                                className={`group cursor-pointer relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                                    isActive
                                                        ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg shadow-orange-100"
                                                        : "border-slate-200 bg-white hover:border-orange-300 hover:shadow-md hover:bg-orange-50/40"
                                                }`}
                                            >
                                                {/* Number badge */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                                                        : "bg-slate-100 text-slate-500 group-hover:bg-orange-500 group-hover:text-white"
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                <span className={`text-xs sm:text-sm text-center font-semibold leading-tight transition-colors duration-200 ${
                                                    isActive ? "text-orange-600" : "text-slate-600 group-hover:text-slate-900"
                                                }`}>
                                                    {industry.name}
                                                </span>
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow shadow-orange-300" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {generateSubIndustries.length === 0 ? (
                                    <p className="text-sm text-slate-400 col-span-full text-center py-10 font-medium">
                                        Select an industry to see sub-categories
                                    </p>
                                ) : (
                                    generateSubIndustries.map((sub, i) => {
                                        const isActive = generatePendingSubIndustry === String(sub.id);
                                        return (
                                            <div
                                                key={sub.id || i}
                                                onClick={() => setGeneratePendingSubIndustry(String(sub.id))}
                                                className={`group cursor-pointer relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                                    isActive
                                                        ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg shadow-orange-100"
                                                        : "border-slate-200 bg-white hover:border-orange-300 hover:shadow-md hover:bg-orange-50/40"
                                                }`}
                                            >
                                                {/* Number badge */}
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                                                        : "bg-slate-100 text-slate-500 group-hover:bg-orange-500 group-hover:text-white"
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                <span className={`text-xs sm:text-sm text-center font-semibold leading-tight transition-colors duration-200 ${
                                                    isActive ? "text-orange-600" : "text-slate-600 group-hover:text-slate-900"
                                                }`}>
                                                    {sub.name}
                                                </span>
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 shadow shadow-orange-300" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* CARD 2 - Prompt/Brand Description */}
                        <div className="border border-orange-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-orange-100/40 relative overflow-hidden bg-white">
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-orange-100 to-red-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

                            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-sm font-black shadow-md shadow-orange-200">
                                    2
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                    Describe Your Brand
                                </h3>
                            </div>

                            {/* ... existing code ... */}

                            <AnimatedTextarea
                                value={brandDescription}
                                onChange={setBrandDescription}
                                minLength={MIN_BRAND_DESCRIPTION_CHARS}
                                maxLength={MAX_BRAND_DESCRIPTION_CHARS}
                                className="w-full min-h-[140px] sm:min-h-[180px] p-4 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm sm:text-base mb-3 font-medium text-slate-700 shadow-inner"
                            />

                            {/* Char counter */}
                            <div className="flex items-center justify-between mb-4">
                                <p className={`text-xs font-medium ${brandDescription.trim().length < MIN_BRAND_DESCRIPTION_CHARS ? "text-red-400" : "text-slate-400"}`}>
                                    {brandDescription.trim().length < MIN_BRAND_DESCRIPTION_CHARS
                                        ? `Min ${MIN_BRAND_DESCRIPTION_CHARS} chars (${brandDescription.trim().length}/${MIN_BRAND_DESCRIPTION_CHARS})`
                                        : `${brandDescription.trim().length}/${MAX_BRAND_DESCRIPTION_CHARS}`}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Regenerate: <span className={regenCount >= MAX_REGENERATIONS_PER_DAY ? "text-red-500 font-bold" : "text-orange-500 font-bold"}>{MAX_REGENERATIONS_PER_DAY - regenCount}/{MAX_REGENERATIONS_PER_DAY}</span> left today
                                </p>
                            </div>

                            <div className="mb-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleRegenerateBrandDescription}
                                    disabled={isRegeneratingBrand || brandDescription.trim().length < MIN_BRAND_DESCRIPTION_CHARS || regenCount >= MAX_REGENERATIONS_PER_DAY}
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                        isRegeneratingBrand || brandDescription.trim().length < MIN_BRAND_DESCRIPTION_CHARS || regenCount >= MAX_REGENERATIONS_PER_DAY
                                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                            : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:brightness-110 cursor-pointer shadow-md shadow-orange-200"
                                    }`}
                                >
                                    <RefreshCcw className={`h-4 w-4 ${isRegeneratingBrand ? "animate-spin" : ""}`} />
                                    {isRegeneratingBrand ? "Regenerating..." : regenCount >= MAX_REGENERATIONS_PER_DAY ? "Limit Reached" : "Regenerate"}
                                </button>
                            </div>
                            {regenerateBrandError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
                                    {regenerateBrandError}
                                </div>
                            )}

                            {/* ... rest of the buttons and CTA ... */}

                            <div className="flex gap-3 mb-6">
                                <button
                                    onClick={() => setSelectedContent(selectedContent === "photos" ? null : "photos")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
                                        selectedContent === "photos"
                                            ? "bg-gradient-to-r from-orange-500 to-red-500 border-transparent text-white"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500"
                                    }`}
                                >
                                    <Image className="w-4 h-4" /> Create Photos
                                </button>
                                <button
                                    onClick={() => setShowReelsComingSoon(true)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 bg-white border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-500"
                                >
                                    <Film className="w-4 h-4" /> Create Reels
                                </button>
                            </div>

                            {showReelsComingSoon && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReelsComingSoon(false)}>
                                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                                            🎬
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Coming Soon!</h3>
                                        <p className="text-sm text-gray-500 text-center">Reels generation is under development. Stay tuned for this exciting feature!</p>
                                        <button
                                            onClick={() => setShowReelsComingSoon(false)}
                                            className="mt-2 px-6 py-2 rounded-full text-sm font-semibold text-white"
                                            style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
                                        >
                                            Got it
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                onClick={handleGenerateClick}
                                disabled={hasGeneratedToday}
                                className={`w-full py-4 rounded-2xl text-base font-black tracking-wide transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                                    hasGeneratedToday
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : isGenerateReady
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:brightness-110 cursor-pointer"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                                <Lock className="w-4 h-4" />
                                {hasGeneratedToday ? "Daily Limit Reached — Try Again Tomorrow" : "Generate 7 Days of Content"}
                            </button>
                            {generateValidationError && (
                                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
                                    {generateValidationError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <section id="gcontent" className="py-16 sm:py-28 overflow-hidden relative" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(15,23,42,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    {/* Title */}
                    <div className="text-center mb-12 sm:mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-200 mb-5">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Live AI Preview
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                            AI-Generated Posts for{" "}
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                Your Business
                            </span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                            Real AI-generated images crafted uniquely for your business — powered by advanced AI trained on your industry
                        </p>
                    </div>

                    {shouldShowFirstLoadMsg && (
                        <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-center text-sm font-medium text-orange-700">
                            First time preview load can take up to 60 seconds.
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100">

                        <div className="space-y-8">
                            {streamError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                                    Stream error: {streamError}
                                </div>
                            )}

                            {/* AI Generation Status */}
                            {streamLoading && (
                                <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-8 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-2 h-8 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                            <div className="w-2 h-8 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">🤖 AI is generating your images</p>
                                            <p className="text-xs text-gray-600 mt-0.5">Powered by advanced AI</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stock Templates — shown only before generation starts */}
                            {!streamLoading && streamedPosts.length === 0 && <div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {generateLoadingImages ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div
                                                key={`r2-loading-${i}`}
                                                className="aspect-square rounded-xl bg-gray-100 animate-pulse"
                                            />
                                        ))
                                    ) : previewPrimaryStockImages.length === 0 ? (
                                        <p className="col-span-full text-center text-gray-400 py-10">
                                            No stock templates found
                                        </p>
                                    ) : (
                                        previewPrimaryStockImages.map((img, index) => {
                                            const url = img.file || img.url || "";
                                            const isActiveStock = selectedPreviewPost?.imageUrl === url;
                                            return (
                                            <div
                                                key={img.id || `r2-stock-${index}`}
                                                className={`relative group aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer transition-all duration-200 ${
                                                    isActiveStock
                                                        ? "ring-4 ring-orange-500 ring-offset-2 scale-[1.03]"
                                                        : "hover:ring-2 hover:ring-orange-300 hover:ring-offset-1 hover:scale-[1.02]"
                                                }`}
                                                onClick={() => {
                                                    setSelectedPreviewPost(
                                                        isActiveStock ? null : { imageUrl: url, caption: img.name || img.title || "" }
                                                    );
                                                }}
                                            >
                                                <img
                                                    src={img.file || img.url}
                                                    alt={img.name || img.title || `Stock ${index + 1}`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = getSubIndustryFallbackImage(index);
                                                    }}
                                                />
                                                {isActiveStock && (
                                                    <>
                                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                                        </div>
                                                        <div className="absolute inset-0 bg-orange-500/10 pointer-events-none" />
                                                    </>
                                                )}
                                                <span className="absolute bottom-2 left-2 text-white bg-black/60 backdrop-blur-sm px-2 py-1 text-xs rounded-md font-medium">
                                                    {img.name || img.title || `Stock ${index + 1}`}
                                                </span>
                                            </div>
                                            );
                                        })
                                        )
                                    }
                                </div>
                            </div>}

                            {/* AI Generated Posts — shown below stock, only when streaming or posts available */}
                            {(streamLoading || streamedPosts.length > 0) && (
                            <div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const post = streamedPosts[i];
                                        const imageUrl = post?.image?.imageUrl;

                                        // During streaming show spinner; after done skip empty slots
                                        if (!imageUrl) {
                                            if (!streamLoading) return null;
                                            return (
                                                <div
                                                    key={`r1-loading-${i}`}
                                                    className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-gray-100 via-white to-gray-100 border border-orange-200"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-fast" />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                                        <div className="relative w-12 h-12">
                                                            <svg className="w-full h-full text-orange-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                                                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" />
                                                                <path className="opacity-100" fill="none" stroke="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-bold text-gray-800">Generating</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">AI Magic...</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {[0, 0.2, 0.4].map((delay, d) => (
                                                                <div key={d} className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: `${delay}s` }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Post arrived — show image
                                        const isActivePost = selectedPreviewPost?.imageUrl === imageUrl;
                                        return (
                                            <div
                                                key={`r1-post-${i}`}
                                                className={`relative group aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer transition-all duration-200 ${
                                                    isActivePost
                                                        ? "ring-4 ring-orange-500 ring-offset-2 scale-[1.03]"
                                                        : "hover:ring-2 hover:ring-orange-300 hover:ring-offset-1 hover:scale-[1.02]"
                                                }`}
                                                onClick={() =>
                                                    setSelectedPreviewPost(
                                                        isActivePost ? null : { imageUrl, caption: post.text || "" }
                                                    )
                                                }
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={post.text?.slice(0, 40) || `Post ${i + 1}`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = getSubIndustryFallbackImage(i);
                                                    }}
                                                />
                                                {isActivePost && (
                                                    <>
                                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                                        </div>
                                                        <div className="absolute inset-0 bg-orange-500/10 pointer-events-none" />
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            )}
                        </div>

                    </div>
                </div>
            </section>

            <Calender selectedIndustry={
                industries.find(ind => String(ind.id) === String(generateSelectedIndustry))?.name
            } />

            <section
                id="who-we-help"
                className="py-16 sm:py-28 overflow-hidden relative"
                style={{ background: "linear-gradient(180deg, #fff7f0 0%, #ffffff 60%, #f8fafc 100%)" }}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-100/30 to-transparent rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    {/* Badge */}
                    <div className="flex justify-center mb-5">
                        <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-200">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Built for Every Industry
                        </span>
                    </div>

                    {/* Title + Subtitle */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Who We Help
                    </h2>

                    <p className="text-slate-500 max-w-2xl mx-auto mb-14 text-sm sm:text-base leading-relaxed">
                        Industry-specific content automation for businesses of all sizes
                    </p>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {(showAllIndustries ? WHO_WE_HELP : WHO_WE_HELP.slice(0, 4)).map((item, idx) => {
                            const moreId = `more${idx + 1}`;
                            const lessId = `less${idx + 1}`;
                            return (
                                <div key={item.key} className="group rounded-2xl p-5 bg-white border border-orange-100 text-left relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1 transition-all duration-300">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full pointer-events-none"></div>
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {item.emoji}
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm mb-3">{item.title}</h3>
                                    <ul className="text-xs text-slate-500 space-y-1.5 mb-3">
                                        {item.visible.map((li, i) => (
                                            <li key={i}><a href={li.href} className="hover:text-orange-500 transition-colors">• {li.label}</a></li>
                                        ))}
                                        {item.extra.length > 0 && (
                                            <div style={{ display: "none" }} id={item.key} className="space-y-1.5">
                                                {item.extra.map((li, i) => (
                                                    <li key={i}><a href={li.href} className="hover:text-orange-500 transition-colors">• {li.label}</a></li>
                                                ))}
                                            </div>
                                        )}
                                    </ul>
                                    {item.extra.length > 0 && (
                                        <>
                                            <a id={moreId} onClick={() => more(item.key, moreId, lessId)} className="text-xs font-semibold text-orange-500 hover:text-orange-700 cursor-pointer">+ show more</a>
                                            <a id={lessId} style={{ display: "none" }} onClick={() => less(item.key, moreId, lessId)} className="text-xs font-semibold text-orange-500 hover:text-orange-700 cursor-pointer">− show less</a>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* See more / See less */}
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={() => setShowAllIndustries((prev) => !prev)}
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-semibold text-sm hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:border-transparent transition-all duration-200"
                        >
                            {showAllIndustries ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                    See less
                                </>
                            ) : (
                                <>
                                    See more
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <span className="text-xs opacity-70">({WHO_WE_HELP.length - 4} more industries)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>
            <section
                id="library"
                className="py-16 sm:py-28 overflow-hidden relative"
                style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #fff7f0 100%)" }}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-orange-100/20 to-transparent rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    {/* Badge */}
                    <div className="flex justify-center mb-5">
                        <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-200">
                            <SparklesIcon className="w-3.5 h-3.5" />
                            10,000+ Professional Templates
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-slate-900 tracking-tight mb-4">
                        Browse Our Library
                    </h2>

                    {/* Subtitle */}
                    <p className="text-center text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mb-12 sm:mb-16 px-2 leading-relaxed">
                        Industry-specific templates that update instantly based on your selection
                    </p>

                    {/* Main Card */}
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-orange-100 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-50/80 to-transparent rounded-full pointer-events-none"></div>

                        {/* Top Controls — single row */}
                        <div className="flex items-center gap-3 mb-8 sm:mb-10 relative z-10 flex-wrap">
                            {/* Tabs */}
                            <button
                                onClick={() => { setLibraryContentType("photos"); setActiveLibraryImageId(null); }}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                    libraryContentType === "photos"
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                        : "bg-white text-gray-600 border border-gray-300 hover:border-orange-300 hover:text-orange-500"
                                }`}
                            >
                                Photos
                            </button>
                            <button
                                onClick={() => setShowReelsComingSoon(true)}
                                className="whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 bg-white text-gray-600 border border-gray-300 hover:border-orange-300 hover:text-orange-500"
                            >
                                Reels
                            </button>

                            {/* Spacer pushes dropdown + refresh to right */}
                            <div className="flex-1" />

                            {/* Coming Soon Popup */}
                            {showReelsComingSoon && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReelsComingSoon(false)}>
                                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-xs mx-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                                            🎬
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Coming Soon!</h3>
                                        <p className="text-sm text-gray-500 text-center">Reels generation is under development. Stay tuned for this exciting feature!</p>
                                        <button
                                            onClick={() => setShowReelsComingSoon(false)}
                                            className="mt-2 px-6 py-2 rounded-full text-sm font-semibold text-white"
                                            style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
                                        >
                                            Got it
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Industry Dropdown + Refresh on right */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select
                                value={librarySelectedIndustry}
                                // REPLACE WITH:
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setLibrarySelectedIndustry(id);
                                    setLibrarySelectedSubIndustry(null);
                                    const selected = industries.find(
                                        (ind: Industry) =>
                                            String(ind.id) === String(id),
                                    );
                                    setLibrarySubIndustries(
                                        selected?.subIndustries || [],
                                    );
                                    setLibraryShowSubIndustries(true);
                                }}
                                className="flex-1 min-w-0 sm:flex-none sm:w-auto px-4 py-2 rounded-xl bg-white text-gray-800 border border-gray-300 focus:outline-none text-sm"
                            >
                                <option value="">Choose your industry</option>
                                {loadingIndustries ? (
                                    <option>Loading industries...</option>
                                ) : (
                                    industries.map((industry: Industry) => (
                                        <option
                                            key={industry.id}
                                            value={industry.id}
                                        >
                                            {industry.name}
                                        </option>

                                    ))
                                )}
                            </select>
                           

                                

                                {libraryShowSubIndustries && (
                                    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20 backdrop-blur-sm">
                                        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 w-full max-w-2xl mx-4">
                                            
                                            {/* Close button */}
                                            <button 
                                                onClick={() => setLibraryShowSubIndustries(false)} 
                                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                                            >
                                                ✕
                                            </button>

                                            <h3 className="text-base sm:text-lg font-bold text-slate-700 mb-4 text-center">
                                                Select a Sub-Industry
                                            </h3>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                                {librarySubIndustries.length === 0 ? (
                                                    <p className="text-sm text-slate-400 col-span-full text-center py-10 font-medium">
                                                        Select an industry to see sub-categories
                                                    </p>
                                                ) : (
                                                    librarySubIndustries.map((sub, i) => {
                                                        const isActive = librarySelectedSubIndustry === String(sub.id);
                                                        return (
                                                            <div
                                                                key={sub.id || i}
                                                                onClick={() => {
                                                                    setLibrarySelectedSubIndustry(String(sub.id));
                                                                    setLibraryShowSubIndustries(false);
                                                                }}
                                                                className={`group cursor-pointer relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all duration-300 z-10
                                                                    ${
                                                                        isActive
                                                                            ? "border-orange-500 bg-white shadow-xl shadow-orange-200/70 scale-[1.04] ring-1 ring-orange-500 -translate-y-1"
                                                                            : "border-slate-200 bg-white shadow-md shadow-slate-200/60 hover:border-orange-300 hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 hover:scale-[1.02]"
                                                                    }`}
                                                            >
                                                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 sm:mb-3 mx-auto group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                                                    <span className="text-xs sm:text-sm font-bold">
                                                                        {i + 1}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs sm:text-sm text-center block font-bold text-slate-600 group-hover:text-slate-900">
                                                                    {sub.name}
                                                                </span>
                                                                {isActive && (
                                                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                

                                

                                {/* Refresh Button */}
                                <button
                                    onClick={refreshImages}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-100 hover:shadow-sm transition-all"
                                >
                                    <RefreshCcw
                                        className={`w-4 h-4 text-gray-500 ${libraryLoadingImages ? "animate-spin" : ""}`}
                                    />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Templates Grid */}
                        <div className={`grid gap-4 ${
                            libraryContentType === "reels"
                                ? "grid-cols-2 sm:grid-cols-4 md:grid-cols-8"
                                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-7"
                        }`}>
                            {libraryLoadingImages ? (
                                Array.from({ length: 7 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-full rounded-xl bg-gray-100 animate-pulse ${
                                            libraryContentType === "reels" ? "aspect-[9/16]" : "h-48"
                                        }`}
                                    />
                                ))
                            ) : libraryFilteredImages.length === 0 ? (
                                <p className="col-span-full text-center text-gray-400 py-12">
                                    No images found
                                </p>
                            ) : (
                                libraryFilteredImages.slice(0, 7).map((img, index) => {
                                    const imgId = img.id ?? index;
                                    const isActive = activeLibraryImageId === imgId;
                                    const isReels = libraryContentType === "reels";
                                    const src = img.file || img.url || "";
                                    return (
                                        <div
                                            key={imgId}
                                            onClick={() => setActiveLibraryImageId(isActive ? null : imgId)}
                                            className={`relative w-full rounded-xl overflow-hidden cursor-pointer transition-all duration-200 bg-gray-100 ${
                                                isReels ? "aspect-[9/16]" : "h-48"
                                            } ${
                                                isActive
                                                    ? "ring-4 ring-orange-500 ring-offset-2 scale-[1.03]"
                                                    : "hover:ring-2 hover:ring-orange-300 hover:ring-offset-1 hover:scale-[1.02]"
                                            }`}
                                        >
                                            {src ? (
                                                <img
                                                    src={src}
                                                    alt={img.name || img.title || "Social media template"}
                                                    loading="lazy"
                                                    className={`w-full h-full rounded-xl ${
                                                        isReels ? "object-cover object-top" : "object-cover"
                                                    }`}
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = "none";
                                                        const fallback = target.nextElementSibling as HTMLElement | null;
                                                        if (fallback) fallback.style.display = "flex";
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                style={{ display: src ? "none" : "flex" }}
                                                className="absolute inset-0 flex-col items-center justify-center gap-2 bg-gray-50"
                                            >
                                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                    <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m3 16 5-5 4 4 3-3 6 6"/>
                                                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
                                                </svg>
                                                <span className="text-[10px] text-gray-400 font-medium">No preview</span>
                                            </div>
                                            {isReels && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase tracking-wide">
                                                    Reel
                                                </div>
                                            )}
                                            {isActive && (
                                                <>
                                                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <div className="absolute inset-0 bg-orange-500/10 rounded-xl pointer-events-none" />
                                                </>
                                            )}
                                            {(img.name || img.title) && (
                                                <span className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 text-xs rounded">
                                                    {img.name || img.title}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <div id="pricing" className="bg-[#faf6ef]">
                <PricingSection />
            </div>

            <Testimonials />

            <section className="py-16 sm:py-28 overflow-hidden relative" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 40%, #fff7f0 100%)" }}>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-orange-100/20 via-transparent to-red-100/20 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-200 mb-5">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        How It Works
                    </div>
                    {/* Title */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-10 sm:mb-12">
                        See it in{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Action</span>
                    </h2>

                    {/* Flow Steps */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-12 sm:mb-16">
                        {[
                            { label: "Select Industry", step: "01" },
                            { label: "Enter Prompt", step: "02" },
                            { label: "AI Generates", step: "03" },
                            { label: "Auto Schedule", step: "04" },
                        ].map((step, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-orange-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white shadow-sm">
                                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-[10px] font-black flex items-center justify-center">{step.step}</span>
                                    {step.label}
                                </div>
                                {index !== 3 && (
                                    <div className="hidden sm:inline text-orange-300 text-lg font-bold">→</div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Video Section */}
                    <div className="relative max-w-4xl mx-auto mb-14 sm:mb-20">
                        <div className="absolute -inset-4 bg-gradient-to-r from-orange-200/30 via-transparent to-red-200/30 rounded-3xl blur-2xl pointer-events-none"></div>
                        <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-orange-100 shadow-2xl shadow-orange-100/40 bg-black group">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover cursor-pointer"
                                src="videos/video.mp4"
                                onClick={toggleVideo}
                            />

                            {!isPlaying && (
                                <button
                                    onClick={toggleVideo}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                                >
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white text-black flex items-center justify-center text-xl sm:text-2xl shadow-xl">
                                        ▶
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Feature Cards */}
                </div>
            </section>

            <HomepageFAQ />

            {/* Post Modal */}
            {selectedPreviewPost && (
                <PostPopup
                    isOpen={!!selectedPreviewPost}
                    imageUrl={selectedPreviewPost.imageUrl}
                    initialCaption={selectedPreviewPost.caption}
                    onClose={() => setSelectedPreviewPost(null)}
                />
            )}
        </div>
    );
}
