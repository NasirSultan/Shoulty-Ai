"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { RefreshCcw } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import Calender from "@/components/calender";
import { fetchImages, fetchIndustries } from "@/api/homeApi";
import {
    streamGeneratePosts,
    generatePromptOnlyImages,
    GeneratedPost,
} from "@/api/postGeneratorApi";
import { streamGenerateTexts } from "@/api/textGeneratorApi";
import PostPopup from "@/components/PostPopup";

import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaLinkedinIn,
    FaYoutube,
    FaTiktok,
    FaPinterest,
    FaSnapchatGhost,
    FaRedditAlien,
    FaTelegramPlane,
    FaWhatsapp,
    FaDiscord,
} from "react-icons/fa";

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

const MIN_BRAND_DESCRIPTION_CHARS = 10;
const LOCAL_TEMPLATE_FALLBACKS = [
    "/templates/template-1.jpg",
    "/templates/template-2.jpg",
    "/templates/template-3.jpg",
    "/templates/template-4.jpg",
];

export default function LandingPage() {
    const icons = [
        FaFacebookF,
        FaInstagram,
        FaTwitter,
        FaLinkedinIn,
        FaYoutube,
        FaTiktok,
        FaPinterest,
        FaSnapchatGhost,
        FaRedditAlien,
        FaTelegramPlane,
        FaWhatsapp,
        FaDiscord,
    ];
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
    function useTypingEffect(
        words: string[],
        speed: number = 50,
        pause: number = 2000,
    ) {
        const [index, setIndex] = React.useState(0);
        const [subIndex, setSubIndex] = React.useState(0);
        const [reverse, setReverse] = React.useState(false);

        // Typing logic
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
                () => {
                    setSubIndex((prev) => prev + (reverse ? -1 : 1));
                },
                reverse ? 1 : 15,
            );

            return () => clearTimeout(timeout);
        }, [subIndex, index, reverse, words, speed, pause]);

        return words[index].substring(0, subIndex);
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
    const [previewStockImages, setPreviewStockImages] = useState<ImageItem[]>([]);
    const [streamedPosts, setStreamedPosts] = useState<GeneratedPost[]>([]);
    const [streamLoading, setStreamLoading] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [selectedPreviewPost, setSelectedPreviewPost] = useState<{ imageUrl: string; caption?: string } | null>(null);
    const streamAbortRef = useRef<AbortController | null>(null);
    const [generateSelectedSubIndustry, setGenerateSelectedSubIndustry] =
        useState<string | null>(null);
    const [generatePendingSubIndustry, setGeneratePendingSubIndustry] =
        useState<string | null>(null);

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
    const imageCacheRef = React.useRef<Record<string, ImageItem[]>>({});
    const imageFetchInFlightRef = React.useRef<Record<string, Promise<ImageItem[]>>>({});

    const [industries, setIndustries] = useState<Industry[]>([]);
    const [loadingIndustries, setLoadingIndustries] = useState(true);
    const [brandDescription, setBrandDescription] = useState<string>("");
    const [isRegeneratingBrand, setIsRegeneratingBrand] = useState(false);
    const [regenerateBrandError, setRegenerateBrandError] = useState<string | null>(null);
    const [selectedContent, setSelectedContent] = useState<"photos" | "reels" | null>(null);
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
        const loadGenerateImages = async () => {
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
            setPreviewStockImages([]);
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

        if (!selectedContent) {
            setSelectedContent("photos");
        }

        setGenerateSubIndustries(selectedIndustryObj?.subIndustries || []);
        setGenerateSelectedSubIndustry(effectiveSubIndustryId);
        scrollToSectionInOneSecond("gcontent");
        await generateStreamPreview(effectiveIndustryId, effectiveSubIndustryId);
    };

    const handleRegenerateBrandDescription = async () => {
        if (isRegeneratingBrand) return;

        setRegenerateBrandError(null);
        setIsRegeneratingBrand(true);

        regenerateBrandAbortRef.current?.abort();
        const controller = new AbortController();
        regenerateBrandAbortRef.current = controller;

        const selectedIndustryObj = industries.find(
            (industry: Industry) => String(industry.id) === String(generateSelectedIndustry),
        );
        const selectedSubIndustryObj = selectedIndustryObj?.subIndustries.find(
            (sub: SubIndustry) => String(sub.id) === String(generatePendingSubIndustry),
        );

        const normalizedBrandContext = brandDescription.replace(/\s+/g, " ").trim();
        const fullPrompt = [
            "Generate one concise brand description for social media content planning.",
            selectedIndustryObj?.name ? `Industry: ${selectedIndustryObj.name}.` : "",
            selectedSubIndustryObj?.name ? `Sub-industry: ${selectedSubIndustryObj.name}.` : "",
            selectedContent ? `Content preference: ${selectedContent}.` : "",
            normalizedBrandContext
                ? `Use this as context and improve it: \"${normalizedBrandContext.slice(0, 260)}\".`
                : "No prior description provided by user.",
            `Length: ${MIN_BRAND_DESCRIPTION_CHARS} to 220 characters.`,
            "Tone: clear, marketing-ready, brand-safe.",
            "Return plain text only.",
        ]
            .filter(Boolean)
            .join(" ");

        const compactPrompt = [
            "Write one brand description.",
            selectedIndustryObj?.name ? `Industry: ${selectedIndustryObj.name}.` : "",
            selectedSubIndustryObj?.name ? `Sub-industry: ${selectedSubIndustryObj.name}.` : "",
            `Length: ${MIN_BRAND_DESCRIPTION_CHARS} to 180 characters.`,
            "Return plain text only.",
        ]
            .filter(Boolean)
            .join(" ");

        const runPrompt = async (promptText: string) => {
            const byIndex = new Map<number, string>();

            await streamGenerateTexts(
                { prompt: promptText },
                {
                    signal: controller.signal,
                    onChunk: (chunk) => {
                        const text = typeof chunk?.text === "string" ? chunk.text.trim() : "";
                        if (!text) return;

                        byIndex.set(chunk.index, text);
                        const first = [...byIndex.entries()].sort((a, b) => a[0] - b[0])[0]?.[1];
                        if (first) {
                            setBrandDescription(first.slice(0, 220));
                        }
                    },
                },
            );

            const finalText = [...byIndex.entries()].sort((a, b) => a[0] - b[0])[0]?.[1];
            if (!finalText) {
                throw new Error("No regenerated brand description received.");
            }

            return finalText.slice(0, 220);
        };

        try {
            let regenerated: string;
            try {
                regenerated = await runPrompt(fullPrompt);
            } catch (firstError) {
                if (firstError instanceof Error && firstError.name === "AbortError") {
                    throw firstError;
                }
                regenerated = await runPrompt(compactPrompt);
            }

            setBrandDescription(regenerated);
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }

            setRegenerateBrandError(
                error instanceof Error
                    ? error.message
                    : "Could not regenerate brand description. Please try again.",
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
            industryId: String(effectiveIndustryId),
            subIndustryId: String(effectiveSubIndustryId),
            prompt: brandDescription.trim(),
        };

        // Collect LLM (AI) posts using up to 2 stream attempts.
        // Running attempts sequentially avoids backend overload from simultaneous requests.
        const collectedAI: GeneratedPost[] = [];
        const completedAttempts = new Set<number>();
        let lastStreamError: string | null = null;

        const handleChunk = (chunk: { post: GeneratedPost }) => {
            // Only collect LLM (AI) posts — skip DB posts
            if (chunk.post?.source !== "LLM") {
                console.log("[Stream] Skipping DB post, waiting for LLM...");
                return;
            }
            
            collectedAI.push(chunk.post);
            console.log(`[Stream] AI post collected (${collectedAI.length}/4): hasImage=${!!chunk.post?.image?.imageUrl}`);
            setStreamedPosts([...collectedAI]);
            
            if (collectedAI.length >= 4) {
                console.log("[Stream] Got 4 AI posts, aborting both streams");
                controller.abort();
            }
        };

        const markStreamDone = (attempt: number) => {
            if (completedAttempts.has(attempt)) return;
            completedAttempts.add(attempt);
            const completedStreams = completedAttempts.size;
            console.log(`[Stream] Stream done (${completedStreams}/2), AI posts so far: ${collectedAI.length}`);
            if (completedStreams >= 2) {
                console.log(`[Stream] Both streams done. Final AI posts: ${collectedAI.length}`);
                setStreamLoading(false);
            }
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
        if (!controller.signal.aborted && collectedAI.length < 4) {
            await runStream(2);
        }

        if (collectedAI.length > 0) {
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

        console.log(`[Stream] All settled. Final AI posts: ${collectedAI.length}`);
        setStreamLoading(false);
    };
    // REPLACE WITH:
    useEffect(() => {
        const loadIndustries = async () => {
            const data = await fetchIndustries();
            setIndustries(data);
            setLoadingIndustries(false);
        };
        loadIndustries();
    }, []);
    const placeholderOptions = [
        "Promote my coffee shop in Bangalore. Cozy vibe, cold brew specialist...",
        "Real estate agent in Austin. Luxury homes, modern architecture...",
        "Personal trainer for busy CEOs. 15-min workouts, high energy...",
    ];

    const animatedPlaceholder = useTypingEffect(placeholderOptions);
    return (
        <div className="relative bg-white dark:bg-gray-950 font-arial min-h-screen text-gray-900 dark:text-white selection:text-white overflow-hidden">
            {/* GLOBAL FLOATING AI + SOCIAL MEDIA BUBBLES */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {icons.map((Icon, i) => {
                    return (
                        <div key={i} className="absolute">
                            <div className="text-gray-400/30 text-2xl md:text-3xl bg-white/40 backdrop-blur-md p-4 rounded-full shadow-lg">
                                <Icon />
                            </div>
                        </div>
                    );
                })}

                {/* AI SPARK BUBBLES */}
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="absolute">
                        <div className="p-3 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30 backdrop-blur-md">
                            <SparklesIcon className="w-6 h-6 text-purple-500/40" />
                        </div>
                    </div>
                ))}
            </div>

            <section
                id="generator"
                className="py-14 sm:py-24 bg-white text-slate-900 overflow-hidden relative"
            >
                {/* Background Banner */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100/40 to-red-100/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100/30 to-purple-100/20 rounded-full blur-3xl -ml-40 -mb-40"></div>
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">
                        <defs>
                            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(100,116,139,0.05)" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="1200" height="600" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="banner relative rounded-3xl px-8 py-10 sm:py-12 mb-8 overflow-hidden border border-slate-300/40 shadow-[0_24px_60px_rgba(10,20,35,0.28)] transition-all duration-300">
                        <div className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: "url('/images/banner.png')" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-cyan-950/65 to-teal-900/75" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px] opacity-35" />
                            <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
                            <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
                            <div className="absolute inset-0 rounded-3xl border border-white/10" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-center mb-6 sm:mb-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/30 bg-cyan-100/10 px-5 py-2.5 text-xs sm:text-sm font-black tracking-[0.18em] uppercase text-cyan-50 shadow-lg backdrop-blur-md">
                                    <span>3 Simple Steps</span>
                                </div>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-6xl text-center mb-4 sm:mb-5 font-black tracking-tighter text-white">
                                Generate Your{" "}
                                <span className="bg-gradient-to-r from-cyan-100 via-amber-100 to-lime-100 bg-clip-text text-transparent">
                                    Year of Content
                                </span>
                            </h1>

                            <p className="text-center text-cyan-50 text-sm sm:text-base max-w-2xl mx-auto mb-3 px-2 font-semibold">
                                One prompt, 365 days of posts. Including local festivals
                                & events.
                            </p>

                            <p className="text-center text-slate-100/90 text-sm sm:text-base max-w-4xl mx-auto mb-2 px-2 leading-relaxed">
                                Shoutly AI is a social media automation and AI content generator that helps you build a complete social media calendar with branded posts, reels, captions, and hashtags in minutes.
                            </p>
                        </div>
                    </div>

                    {/* Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                        {/* CARD 1 - Industry Selection */}
                        <div className="border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden bg-slate-50/50">
                            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                {/* Step Number - Changed to Brand Slate */}
                                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                                    1
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                    Select your industry
                                </h3>
                            </div>

                            <select
                                value={generateSelectedIndustry}
                                // REPLACE WITH:
                                onChange={(e) => {
                                    const id = e.target.value;
                                    setGenerateSelectedIndustry(id);
                                    setGenerateSelectedSubIndustry(null);
                                    setGeneratePendingSubIndustry(null);
                                    const selected = industries.find(
                                        (ind: Industry) =>
                                            String(ind.id) === String(id),
                                    );
                                    setGenerateSubIndustries(
                                        selected?.subIndustries || [],
                                    );
                                }}
                                className="w-full mb-6 sm:mb-8 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base font-medium text-slate-700"
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

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {generateSubIndustries.length === 0 ? (
                                    <p className="text-sm text-slate-400 col-span-full text-center py-10 font-medium">
                                        Select an industry to see sub-categories
                                    </p>
                                ) : (
                                    generateSubIndustries.map((sub, i) => {
                                        const isActive =
                                            generatePendingSubIndustry ===
                                            String(sub.id);
                                        return (
                                            <div
                                                key={sub.id || i}
                                                onClick={() => {
                                                    setGeneratePendingSubIndustry(String(sub.id));
                                                    
                                                }}
                                                className={`group cursor-pointer relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all duration-300
                                                ${
                                                    isActive
                                                        ? "border-orange-500 bg-white shadow-lg shadow-orange-100 scale-[1.02] ring-1 ring-orange-500"
                                                        : "border-slate-200 bg-white hover:border-orange-300 hover:shadow-md"
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

                        {/* CARD 2 - Prompt/Brand Description */}
                        <div className="border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm bg-slate-50 relative overflow-hidden">
                            {/* Subtle Brand Glow */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-200 rounded-full blur-3xl opacity-20" />

                            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                                    2
                                </span>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                    Describe Your Brand
                                </h3>
                            </div>

                            {/* ... existing code ... */}

                            <textarea
                                value={brandDescription}
                                onChange={(e) => setBrandDescription(e.target.value)}
                                minLength={MIN_BRAND_DESCRIPTION_CHARS}
                                className="w-full min-h-[140px] sm:min-h-[180px] p-4 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm sm:text-base mb-4 font-medium text-slate-700 shadow-inner"
                                placeholder={animatedPlaceholder}
                            />

                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                    Minimum {MIN_BRAND_DESCRIPTION_CHARS} characters required ({brandDescription.trim().length}/{MIN_BRAND_DESCRIPTION_CHARS})
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRegenerateBrandDescription}
                                    disabled={isRegeneratingBrand}
                                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm font-bold transition-all ${
                                        isRegeneratingBrand
                                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-orange-500 hover:text-orange-600"
                                    }`}
                                >
                                    <RefreshCcw className={`h-4 w-4 ${isRegeneratingBrand ? "animate-spin" : ""}`} />
                                    {isRegeneratingBrand ? "Regenerating..." : "Regenerate"}
                                </button>
                            </div>
                            {regenerateBrandError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">
                                    {regenerateBrandError}
                                </div>
                            )}

                            {/* ... rest of the buttons and CTA ... */}

                            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                <button
                                    onClick={() => setSelectedContent(selectedContent === "photos" ? null : "photos")}
                                    className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                                        selectedContent === "photos"
                                            ? "bg-orange-500 border-orange-500 text-white"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-500"
                                    }`}
                                >
                                    Create Photos
                                </button>
                                <button
                                    onClick={() => setSelectedContent(selectedContent === "reels" ? null : "reels")}
                                    className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-bold transition-all ${
                                        selectedContent === "reels"
                                            ? "bg-orange-500 border-orange-500 text-white"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-500"
                                    }`}
                                >
                                    Create Reels
                                </button>
                            </div>
                            <p className="text-center text-xs sm:text-sm text-slate-900 mb-8 font-medium">
                                No credit card required • 2-min setup <br />
                                100+ founders already automating
                            </p>

                            {/* Power CTA Button - Changed to Brand Black/Orange */}
                            <button 
                                onClick={handleGenerateClick}
                                className={`w-full py-3 sm:py-4 rounded-2xl text-white text-base sm:text-lg font-black tracking-tight transition-all active:scale-95 shadow-xl uppercase ${
                                    isGenerateReady
                                        ? "bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-110 cursor-pointer"
                                        : "bg-slate-500 hover:bg-slate-600 cursor-pointer"
                                }`}
                            >
                                Generate 365 Days of Content
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
            <section id="gcontent" className="py-14 sm:py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl md:text-5xl text-center text-black mb-3 sm:mb-4">
                        Preview AI-Generated Posts Tailored for Your Business
                    </h2>

                    {/* Subtitle */}
                    <p className="text-center text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-10 sm:mb-16 px-2">
                        Industry-specific templates that update instantly based
                        on your selection
                    </p>

                    {shouldShowFirstLoadMsg && (
                        <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-center text-sm font-medium text-orange-700">
                            First time preview load can take up to 60 seconds.
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg border border-gray-100">
                        {/* Top Controls */}
                        <div className="flex flex-col gap-6 mb-8 sm:mb-10">
                            {/* Tabs */}
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {[
                                    { label: "Photos", value: "photos" },
                                    { label: "Reels", value: "reels" },
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() =>
                                            setSelectedContent(
                                                selectedContent === tab.value
                                                    ? null
                                                    : (tab.value as
                                                          | "photos"
                                                          | "reels"),
                                            )
                                        }
                                        className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200
                                            ${
                                                selectedContent === tab.value
                                                    ? "bg-black text-white shadow-md"
                                                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

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

                            {/* Row 1 — first 4 streamed posts (arrival order) */}
                            <div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => {
                                        const post = streamedPosts[i];
                                        const imageUrl = post?.image?.imageUrl;

                                        // Before stream starts: show stock placeholders (use different images than row 2)
                                        if (!streamLoading && streamedPosts.length === 0) {
                                            const fallback = previewSecondaryStockImages[i];
                                            if (!fallback) {
                                                return (
                                                    <div
                                                        key={`r1-empty-${i}`}
                                                        className="aspect-square rounded-xl bg-gray-50"
                                                    />
                                                );
                                            }
                                            return (
                                                <div
                                                    key={fallback.id || `r1-stock-${i}`}
                                                    className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                                                    onClick={() => {
                                                        const url = fallback.file || fallback.url || "";
                                                        setSelectedPreviewPost({
                                                            imageUrl: url,
                                                            caption: fallback.name || fallback.title || "",
                                                        });
                                                    }}
                                                >
                                                    <img
                                                        src={fallback.file || fallback.url}
                                                        alt={fallback.name || fallback.title || `Stock ${i + 5}`}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = getSubIndustryFallbackImage(i + 4);
                                                        }}
                                                    />
                                                    <span className="absolute bottom-2 left-2 text-white bg-black/60 backdrop-blur-sm px-2 py-1 text-xs rounded-md font-medium">
                                                        {fallback.name || fallback.title || `Stock ${i + 5}`}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        // Slot not yet filled — enhanced loading skeleton
                                        if (!imageUrl) {
                                            return (
                                                <div
                                                    key={`r1-loading-${i}`}
                                                    className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 border border-orange-200"
                                                >
                                                    {/* Animated Background Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-fast"></div>
                                                    
                                                    {/* Loading Content */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/20">
                                                        {/* Animated Spinner */}
                                                        <div className="relative w-12 h-12">
                                                            <svg className="w-full h-full text-orange-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                                                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                                                <path className="opacity-100" fill="none" stroke="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        </div>
                                                        
                                                        {/* Text Label */}
                                                        <div className="text-center">
                                                            <p className="text-sm font-bold text-gray-800">Generating</p>
                                                            <p className="text-xs text-gray-600 mt-0.5">AI Magic...</p>
                                                        </div>
                                                        
                                                        {/* Animated Dots */}
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Post arrived — show image
                                        return (
                                            <div
                                                key={`r1-post-${i}`}
                                                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                                                onClick={() =>
                                                    setSelectedPreviewPost({
                                                        imageUrl,
                                                        caption: post.text || "",
                                                    })
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
                                                {post.source && (
                                                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full ${post.source === "LLM" ? "bg-orange-500 text-white" : "bg-black/60 text-white"}`}>
                                                        {post.source === "LLM" ? "AI" : "Stock"}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Row 2 — always 4 stock images */}
                            <div>
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
                                        previewPrimaryStockImages.map((img, index) => (
                                            <div
                                                key={img.id || `r2-stock-${index}`}
                                                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all"
                                                onClick={() => {
                                                    const url = img.file || img.url || "";
                                                    setSelectedPreviewPost({
                                                        imageUrl: url,
                                                        caption: img.name || img.title || "",
                                                    });
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
                                                <span className="absolute bottom-2 left-2 text-white bg-black/60 backdrop-blur-sm px-2 py-1 text-xs rounded-md font-medium">
                                                    {img.name || img.title || `Stock ${index + 1}`}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/*<AIPapersSection />*/}
            {/* See It In Action Section */}
            <section className="py-14 sm:py-20 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                        {[
                            { emoji: "⚡", title: "2-Minutes Setup" },
                            { emoji: "🎨", title: "Auto-Branded" },
                            { emoji: "📅", title: "365 Days Filled" },
                            { emoji: "🌍", title: "Multi-Platform" },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="bg-gray-100 border border-gray-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                                    {item.emoji}
                                </div>

                                <h3 className="text-base sm:text-lg font-semibold text-black">
                                    {item.title}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Calender />

            <section
                id="who-we-help"
                className="py-12 bg-white overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-6 text-center">
                    {/* Gradient Badge with Floating Particle Motion */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow-lg">
                            <div>
                                <SparklesIcon className="w-4 h-4 text-white" />
                            </div>
                            Built for Every Industry
                        </span>
                    </div>

                    {/* Title + Subtitle */}
                    <h2 className="text-4xl md:text-5xl text-black mb-4">
                        Who We Help
                    </h2>

                    <p className="text-gray-600 max-w-2xl mx-auto mb-16">
                        Industry-specific content automation for businesses of
                        all sizes
                    </p>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {/*[
                            { title: "Health & Fitness", emoji: "💪" },
                            { title: "Food & Beverage", emoji: "🍔" },
                            { title: "Fashion & Lifestyle", emoji: "👗" },
                            { title: "Real Estate & Construction", emoji: "🏗️" },
                            { title: "Education & Coaching", emoji: "🎓" },
                            { title: "Finance & Business Services", emoji: "💼" },
                            { title: "Medical & Healthcare", emoji: "🩺" },
                            { title: "Technology & IT Services", emoji: "💻" },
                            { title: "Hospitality & Tourism", emoji: "🏨" },
                            { title: "Automobile Industry", emoji: "🚗" },
                            { title: "Beauty, Salon & Wellness", emoji: "💅" },
                            { title: "Retail & E-Commerce", emoji: "🛒" },
                        ].map((item, index) => (
                            <div key={item.title || index*/}

                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                💪
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Health & Fitness
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Gym / Fitness Studio</li>
                                <li>• Yoga Centre</li>
                                <li>• Zumba / Aerobic Studio</li>
                                <li>• CrossFit / Personal Trainer</li>
                                <div
                                    style={{ display: "none" }}
                                    id="Health"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Physiotherapy Clinic</li>
                                    <li>• Dietician / Nutritionist</li>
                                    <li>• Wellness & Supplements</li>
                                    <li>• Weight Loss / Body Transformation</li>
                                </div>
                            </ul>
                            {/* More Link */}
                            <a
                                id="more1"
                                onClick={() => more("Health", "more1", "less1")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less1"
                                style={{ display: "none" }}
                                onClick={() => less("Health", "more1", "less1")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🍔
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Food & Beverage
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Restaurants (veg / multicuisine)</li>
                                <li>• Restaurants (non-veg / multicuisine)</li>
                                <li>• Cafes & Coffee Shops</li>
                                <li>• Juice Bars / Smoothie Bars</li>
                                <div
                                    style={{ display: "none" }}
                                    id="food"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Bakery / Cake Shop</li>
                                    <li>• Cloud Kitchen</li>
                                    <li>• Catering Services</li>
                                    <li>• Food Trucks</li>
                                    <li>• Sweets & Namkeen Stores</li>
                                    <li>• Organic & Healthy Food Brands</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more2"
                                onClick={() => more("food", "more2", "less2")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less2"
                                style={{ display: "none" }}
                                onClick={() => less("food", "more2", "less2")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 3rd item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                👗
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Fashion & Lifestyle
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Clothing Store / Boutique</li>
                                <li>• Fashion Designer</li>
                                <li>• Footwear</li>
                                <li>• Watches / Jewelry</li>
                                <div
                                    style={{ display: "none" }}
                                    id="fashion"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Perfume / Fragrance Brand</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more3"
                                onClick={() =>
                                    more("fashion", "more3", "less3")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less3"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("fashion", "more3", "less3")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 4th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🏗️
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Real Estate & Construction
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Real Estate Agents</li>
                                <li>• Developers / Builders</li>
                                <li>• Farm Plots / Gated Communities</li>
                                <li>• Interior Design</li>
                                <div
                                    style={{ display: "none" }}
                                    id="real"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Architecture Firms</li>
                                    <li>• Property Consultants</li>
                                    <li>• Home Construction Materials</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more4"
                                onClick={() => more("real", "more4", "less4")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less4"
                                style={{ display: "none" }}
                                onClick={() => less("real", "more4", "less4")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 5th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🎓
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Education & Coaching
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Schools & Colleges</li>
                                <li>
                                    • Coaching Institutes (NEET / JEE / UPSC /
                                    CAT etc.)
                                </li>
                                <li>• Coding Academy / EdTech</li>
                                <li>• Online Tutors</li>
                                <li>• Pre-School / Montessori</li>
                                <div
                                    style={{ display: "none" }}
                                    id="edu"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Skill Training Centres</li>
                                    <li>• IELTS / Language Centres</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more5"
                                onClick={() => more("edu", "more5", "less5")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less5"
                                style={{ display: "none" }}
                                onClick={() => less("edu", "more5", "less5")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 6th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                💼
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Finance & Business Services
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• CA / Tax / GST Services</li>
                                <li>• Insurance Agents</li>
                                <li>• Mutual Fund Advisors</li>
                                <li>• Stock & Crypto Trading Services</li>
                                <div
                                    style={{ display: "none" }}
                                    id="finance"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Business Consultants</li>
                                    <li>• Accounting Firms</li>
                                    <li>• Loan Agents</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more6"
                                onClick={() =>
                                    more("finance", "more6", "less6")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less6"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("finance", "more6", "less6")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 7th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🩺
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Medical & Healthcare
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Hospitals & Clinics</li>
                                <li>• Dentists</li>
                                <li>• Dermatologists</li>
                                <li>• Eye Clinics</li>
                                <div
                                    style={{ display: "none" }}
                                    id="medical"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Pharmacy / Medical Stores</li>
                                    <li>• Diagnostic Laboratories</li>
                                    <li>• Home Nursing Services</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more7"
                                onClick={() =>
                                    more("medical", "more7", "less7")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less7"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("medical", "more7", "less7")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 8th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                💻
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Technology & IT Services
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• SaaS Products</li>
                                <li>• Website Development</li>
                                <li>• App Development</li>
                                <li>• Digital Marketing Agencies</li>
                                <div
                                    style={{ display: "none" }}
                                    id="tech"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• AI Tools</li>
                                    <li>• Cyber Security</li>
                                    <li>• Tech Startups</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more8"
                                onClick={() => more("tech", "more8", "less8")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less8"
                                style={{ display: "none" }}
                                onClick={() => less("tech", "more8", "less8")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 9th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🏨
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Hospitality & Tourism
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Hotels / Resorts</li>
                                <li>• Travel Agencies</li>
                                <li>• Tour Packages</li>
                                <li>• Homestays / Airbnb Hosts</li>
                                <div
                                    style={{ display: "none" }}
                                    id="hospitality"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Car Rentals</li>
                                    <li>• Adventure Tourism</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more9"
                                onClick={() =>
                                    more("hospitality", "more9", "less9")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less9"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("hospitality", "more9", "less9")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 10th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🚗
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Automobile Industry
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Car Showrooms</li>
                                <li>• Two-Wheeler Dealers</li>
                                <li>• Auto Repair Workshops</li>
                                <li>• Car Spa / Detailing</li>
                                <div
                                    style={{ display: "none" }}
                                    id="auto"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Car Accessories & Parts</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more10"
                                onClick={() => more("auto", "more10", "less10")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less10"
                                style={{ display: "none" }}
                                onClick={() => less("auto", "more10", "less10")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 11th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                💅
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Home & Lifestyle
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Furniture Store</li>
                                <li>• Home Decor Brand</li>
                                <li>• Kitchenware</li>
                                <li>• Electronics & Appliances</li>
                                <div
                                    style={{ display: "none" }}
                                    id="home"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Cleaning / Pest Control</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more11"
                                onClick={() => more("home", "more11", "less11")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less11"
                                style={{ display: "none" }}
                                onClick={() => less("home", "more11", "less11")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 12th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🎉
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Events & Entertainment
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Event Planners</li>
                                <li>• Wedding Photographers</li>
                                <li>• Videography / Drone Shoots</li>
                                <li>• DJs / Bands</li>
                                <div
                                    style={{ display: "none" }}
                                    id="events"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Stage Decor & Lighting</li>
                                    <li>• Corporate Event Organizers</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more12"
                                onClick={() =>
                                    more("events", "more12", "less12")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less12"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("events", "more12", "less12")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>

                        {/* 13th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🏔️
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Sports & Outdoor
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Sports Academies</li>
                                <li>• Cricket Training</li>
                                <li>• Football Clubs</li>
                                <li>• Swimming Schools</li>
                                <div
                                    style={{ display: "none" }}
                                    id="sports"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Trekking & Adventure Gear</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more13"
                                onClick={() =>
                                    more("sports", "more13", "less13")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less13"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("sports", "more13", "less13")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 14th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🛍️
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Retail & E-commerce
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Accessories (Bags)</li>
                                <li>• Footwear</li>
                                <li>• Gift Shops</li>
                                <li>• Home Appliances</li>
                                <div
                                    style={{ display: "none" }}
                                    id="retail"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Kids Clothing</li>
                                    <li>• Laptops & Computers</li>
                                    <li>• Men&apos;s Clothing</li>
                                    <li>• Online Stores</li>
                                    <li>• Smartphones</li>
                                    <li>• Supermarkets</li>
                                    <li>• Toy Stores</li>
                                    <li>• Wearables</li>
                                    <li>• Women&apos;s Clothing</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more14"
                                onClick={() =>
                                    more("retail", "more14", "less14")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less14"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("retail", "more14", "less14")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 15th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                👤
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Personal Branding
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Coaches / Trainers</li>
                                <li>• Influencers</li>
                                <li>• Motivational Speakers</li>
                                <li>• Consultants</li>
                                <div
                                    style={{ display: "none" }}
                                    id="personal"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Podcasters / Content Creators</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more15"
                                onClick={() =>
                                    more("personal", "more15", "less15")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less15"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("personal", "more15", "less15")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 16th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🏠
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Home Services
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Electrician / Plumber</li>
                                <li>• Cleaning Services</li>
                                <li>• Solar Panels</li>
                                <li>• Water Purifier Dealers</li>
                                <div
                                    style={{ display: "none" }}
                                    id="ser"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>
                                        • Interior Woodwork / Modular Kitchen
                                    </li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more16"
                                onClick={() => more("ser", "more16", "less16")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less16"
                                style={{ display: "none" }}
                                onClick={() => less("ser", "more16", "less16")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 17th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🤝
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                NGOs & Foundations
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Charitable Trusts</li>
                                <li>• Women & Child Welfare</li>
                                <li>• Environmental Campaigns</li>
                                <li>• Social Causes</li>
                                <div
                                    style={{ display: "none" }}
                                    id="ngo"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                ></div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more17"
                                style={{ display: "none" }}
                                onClick={() => more("ngo", "more17", "less17")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less17"
                                style={{ display: "none" }}
                                onClick={() => less("ngo", "more17", "less17")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 18th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🏭
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Manufacturing & Industrial
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Machinery Industries</li>
                                <li>• Textile Production</li>
                                <li>• Packaging & Printing</li>
                                <li>• Wholesale Distribution</li>
                                <div
                                    style={{ display: "none" }}
                                    id="manu"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                ></div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more18"
                                style={{ display: "none" }}
                                onClick={() => more("manu", "more18", "less18")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less18"
                                style={{ display: "none" }}
                                onClick={() => less("manu", "more18", "less18")}
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 19th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}✨
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Beauty, Salon and Wellness
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Ayurvedic & Holis</li>
                                <li>• Beauty Courses</li>
                                <li>• Grooming Services</li>
                                <li>• Hair Care Men</li>
                                <div
                                    style={{ display: "none" }}
                                    id="beauty"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Hair Care Women</li>
                                    <li>• Makeup Services</li>
                                    <li>• Nail Care & Art</li>
                                    <li>• Skin Care Services</li>
                                    <li>• Spa & Welness</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more19"
                                onClick={() =>
                                    more("beauty", "more19", "less19")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less19"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("beauty", "more19", "less19")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>
                        {/* 20th item */}
                        <div className="rounded-3xl p-6 bg-white border border-gray-200 text-left cursor-pointer relative overflow-hidden">
                            {/* Emoji with micro-pulse */}
                            <div className="text-4xl mb-4">
                                {/*item.emoji*/}
                                🚀
                            </div>

                            {/* Title */}
                            <h3 className="text-black mb-4">
                                {/*item.title*/}
                                Entrepreneurs & Startup Founders
                            </h3>

                            {/* List */}
                            <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                <li>• Startup Founders</li>
                                <li>• Business Owners</li>
                                <li>• Solopreneurs</li>
                                <li>• Digital Entrepreneurs</li>
                                <div
                                    style={{ display: "none" }}
                                    id="entre"
                                    className="text-sm text-gray-600 space-y-2 mb-4"
                                >
                                    <li>• Women Entrepreneurs</li>
                                    <li>• Young Entrepreneurs</li>
                                </div>
                            </ul>

                            {/* More Link */}
                            <a
                                id="more20"
                                onClick={() =>
                                    more("entre", "more20", "less20")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show more
                            </a>
                            <a
                                id="less20"
                                style={{ display: "none" }}
                                onClick={() =>
                                    less("entre", "more20", "less20")
                                }
                                className="text-sm font-medium text-blue-500 hover:text-black-600"
                            >
                                show less
                            </a>
                        </div>

                        {/*))*/}
                    </div>
                </div>
            </section>
            <section
                id="library"
                className="pt-2 pb-5 sm:pt-2 sm:pb-5 bg-white overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Floating Badge */}
                    <div className="flex justify-center mb-5 sm:mb-6">
                        <span className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs sm:text-sm font-semibold shadow-lg">
                            <SparklesIcon className="w-4 h-4 text-white" />
                            10,000+ Professional Templates
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl md:text-5xl text-center text-black mb-3 sm:mb-4">
                        Browse Our Library
                    </h2>

                    {/* Subtitle */}
                    <p className="text-center text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-10 sm:mb-16 px-2">
                        Industry-specific templates that update instantly based
                        on your selection
                    </p>

                    {/* Main Card */}
                    <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                        {/* Top Controls */}
                        <div className="flex flex-col gap-6 mb-8 sm:mb-10 relative z-10">
                            {/* Tabs */}
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {[
                                    { label: "Photos", value: "photos" },
                                    { label: "Reels", value: "reels" },
                                ].map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() =>
                                            setSelectedContent(
                                                selectedContent === tab.value
                                                    ? null
                                                    : (tab.value as
                                                          | "photos"
                                                          | "reels"),
                                            )
                                        }
                                        className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition
                    ${
                        selectedContent === tab.value
                            ? "bg-black text-white shadow-lg"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search + Dropdown */}
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <input
                                    type="text"
                                    placeholder="Search templates"
                                    className="w-full px-4 py-2 rounded-xl bg-white text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                    value={libraryFilterTerm}
                                    onChange={(e) =>
                                        setLibraryFilterTerm(e.target.value)
                                    }
                                />

                                

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
                                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-gray-800 border border-gray-300 focus:outline-none text-sm"
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 gap-4">
                            {libraryLoadingImages ? (
                                <p className="col-span-full text-center text-gray-400 py-12">
                                    Loading templates... (may take up to 60s on
                                    first load)
                                </p>
                            ) : libraryFilteredImages.length === 0 ? (
                                <p className="col-span-full text-center text-gray-400 py-12">
                                    No images found
                                </p>
                            ) : (
                                libraryFilteredImages.slice(0, 8).map((img, index) => (
                                    <div
                                        key={img.id || index}
                                        className="relative w-full h-48 rounded-xl overflow-hidden"
                                    >
                                        <img
                                            src={img.file || img.url}
                                            alt={`${img.name || img.title || "Social media content"} library template preview for ${librarySelectedIndustry || "your industry"}`}
                                            className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                                        />
                                        <span className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 text-xs rounded">
                                            {img.name}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <div id="pricing">
                {/* Assuming PricingSection is robust, otherwise wrap it */}
                <PricingSection />
            </div>

            <section className="py-14 sm:py-20 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    {/* Title */}
                    <div className="text-2xl sm:text-3xl md:text-5xl text-black font-arial mb-10 sm:mb-12">
                        See it in Action
                    </div>

                    {/* Flow Steps */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-12 sm:mb-16">
                        {[
                            { label: "Select Industry", color: "bg-blue-500" },
                            { label: "Enter Prompt", color: "bg-violet-500" },
                            { label: "AI Generates", color: "bg-pink-500" },
                            { label: "Auto Schedule", color: "bg-green-500" },
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-xs sm:text-sm font-medium text-black bg-gray-100 shadow-sm backdrop-blur-md">
                                    {/* Animated Dot */}
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full ${step.color}`}
                                    />

                                    {step.label}
                                </div>

                                {/* Animated Arrow */}
                                {index !== 3 && (
                                    <div className="hidden sm:inline text-gray-400 text-xl">
                                        →
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Video Section */}
                    <div className="relative max-w-4xl mx-auto mb-14 sm:mb-20">
                        <div className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-black group">
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
