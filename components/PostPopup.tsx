"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import {
  DashboardCalendarPost,
  DashboardPlatKey,
  DashboardPostType,
  DashboardStatus,
  DashboardTimeSlot,
  saveDashboardCalendarPost,
} from "@/app/dashboards/calendarSync";
import { upsertCalendarPostToBackend } from "@/api/calendarPostsApi";
import { streamGenerateTexts } from "@/api/textGeneratorApi";

type Props = {
  isOpen: boolean;
  imageUrl: string;
  initialCaption?: string;
  onClose: () => void;
  onSaved?: (post: DashboardCalendarPost) => void;
};

const PLATFORMS: DashboardPlatKey[] = ["ig", "fb", "li", "tw", "tk", "yt", "th"];
const PLATFORM_LABELS: Record<DashboardPlatKey, string> = {
  ig: "Instagram",
  fb: "Facebook",
  li: "LinkedIn",
  tw: "X",
  tk: "TikTok",
  yt: "YouTube",
  th: "Threads",
};

const PLATFORM_ICONS: Record<DashboardPlatKey, IconType> = {
  ig: FaInstagram,
  fb: FaFacebookF,
  li: FaLinkedinIn,
  tw: FaXTwitter,
  tk: FaTiktok,
  yt: FaYoutube,
  th: FaThreads,
};

const PLATFORM_COLORS: Record<DashboardPlatKey, string> = {
  ig: "#E1306C",
  li: "#0A66C2",
  tw: "#1DA1F2",
  fb: "#1877F2",
  tk: "#111111",
  yt: "#FF0000",
  th: "#555555",
};

const DEFAULT_TIMES: DashboardTimeSlot[] = [
  { t: "9:00 AM", e: "7.6%", best: false },
  { t: "12:30 PM", e: "8.2%", best: true },
  { t: "5:45 PM", e: "9.8%", best: true },
  { t: "8:30 PM", e: "7.1%", best: false },
];

const DEFAULT_HASHTAGS = [
  "#Startup",
  "#Entrepreneurship",
  "#VentureCapital",
  "#Founder",
  "#TechStartup",
];

const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

export default function PostPopup({ isOpen, imageUrl, initialCaption, onClose, onSaved }: Props) {
  const [caption, setCaption] = useState(initialCaption || "");
  const [hashtags, setHashtags] = useState<string[]>(DEFAULT_HASHTAGS);
  const [tagInput, setTagInput] = useState("");
  const [postType, setPostType] = useState<DashboardPostType>("image");
  const [platforms, setPlatforms] = useState<DashboardPlatKey[]>(["ig"]);
  const [dateVal, setDateVal] = useState(toInputDate(new Date()));
  const [selectedTime, setSelectedTime] = useState(DEFAULT_TIMES[2].t);
  const [image, setImage] = useState(imageUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRewritingCaption, setIsRewritingCaption] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [rewriteError, setRewriteError] = useState("");
  const [imageSuccessMessage, setImageSuccessMessage] = useState("");
  const [showCaptionPromptPopup, setShowCaptionPromptPopup] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showImagePreviewPopup, setShowImagePreviewPopup] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const successTimerRef = useRef<number | null>(null);
  const rewriteAbortRef = useRef<AbortController | null>(null);

  const score = 92;

  const clampZoom = (value: number) => Math.min(4, Math.max(1, value));

  const resetImageView = () => {
    setImageZoom(1);
    setImagePan({ x: 0, y: 0 });
    setIsPanningImage(false);
  };

  const zoomInImage = () => {
    setImageZoom((prev) => clampZoom(prev + 0.25));
  };

  const zoomOutImage = () => {
    setImageZoom((prev) => {
      const next = clampZoom(prev - 0.25);
      if (next === 1) {
        setImagePan({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const onPreviewMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (imageZoom <= 1) return;
    event.preventDefault();
    setIsPanningImage(true);
    panStartRef.current = { x: event.clientX, y: event.clientY };
    panOriginRef.current = { ...imagePan };
  };

  const onPreviewMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanningImage || imageZoom <= 1) return;
    event.preventDefault();
    const dx = event.clientX - panStartRef.current.x;
    const dy = event.clientY - panStartRef.current.y;
    setImagePan({
      x: panOriginRef.current.x + dx,
      y: panOriginRef.current.y + dy,
    });
  };

  const stopImagePanning = () => {
    if (!isPanningImage) return;
    setIsPanningImage(false);
  };

  const postDate = useMemo(() => {
    const parsed = new Date(dateVal);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [dateVal]);

  useEffect(() => {
    return () => {
      rewriteAbortRef.current?.abort();
      rewriteAbortRef.current = null;
    };
  }, []);

  if (!isOpen) return null;

  const togglePlatform = (pl: DashboardPlatKey) => {
    setPlatforms((prev) =>
      prev.includes(pl) ? prev.filter((item) => item !== pl) : [...prev, pl]
    );
  };

  const onTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const cleaned = tagInput.trim().replace(/^#+/, "");
    if (!cleaned) return;

    const tag = `#${cleaned}`;
    if (!hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    setTagInput("");
  };

  const onRefreshTags = () => {
    const words = caption
      .split(/\W+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 4)
      .slice(0, 5)
      .map((word) => `#${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);

    const next = Array.from(new Set([...words, ...DEFAULT_HASHTAGS])).slice(0, 10);
    setHashtags(next.length ? next : DEFAULT_HASHTAGS);
  };

  const onRewrite = async () => {
    if (isRewritingCaption) return;

    const localRewrite = () => {
      const base =
        caption.trim() || "Write a concise high-converting post for this image.";
      return `🔥 ${base}\n\nWhat do you think? Drop your view below and follow for more insights.`;
    };

    setRewriteError("");
    setIsRewritingCaption(true);

    rewriteAbortRef.current?.abort();
    const controller = new AbortController();
    rewriteAbortRef.current = controller;

    const prompt = [
      "Rewrite the following social media caption.",
      caption.trim()
        ? `Caption: \"${caption.trim()}\"`
        : "Create a concise high-converting social caption for a business audience.",
      "Tone: bold, modern, brand-safe.",
      "Include one clear CTA.",
      "Max length: 280 characters.",
      "Return plain caption text only.",
    ].join(" ");

    const byIndex = new Map<number, string>();

    try {
      await streamGenerateTexts(
        { prompt },
        {
          signal: controller.signal,
          onChunk: (chunk) => {
            const text = typeof chunk?.text === "string" ? chunk.text.trim() : "";
            if (!text) return;

            byIndex.set(chunk.index, text);
            const first = [...byIndex.entries()].sort((a, b) => a[0] - b[0])[0]?.[1];
            if (first) {
              setCaption(first.slice(0, 2200));
            }
          },
        }
      );

      const finalText = [...byIndex.entries()].sort((a, b) => a[0] - b[0])[0]?.[1];
      if (!finalText) {
        throw new Error("No caption text received from text generator.");
      }
      setCaption(finalText.slice(0, 2200));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      const fallback = localRewrite().slice(0, 2200);
      setCaption(fallback);
      setRewriteError(
        error instanceof Error
          ? `${error.message} Using fallback rewrite.`
          : "Rewrite failed. Using fallback rewrite."
      );
    } finally {
      if (rewriteAbortRef.current === controller) {
        rewriteAbortRef.current = null;
      }
      setIsRewritingCaption(false);
    }
  };

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setImage(objectUrl);
    event.target.value = "";
  };

  const onGenerateAnother = async () => {
    const prompt = caption.trim();
    if (!prompt) {
      setShowCaptionPromptPopup(true);
      setImageSuccessMessage("");
      return;
    }

    setIsGeneratingImage(true);
    setSaveError("");
    setImageSuccessMessage("");

    try {
      const response = await fetch("/api/gemeini-image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        let parsed: any = null;
        try {
          parsed = text ? JSON.parse(text) : null;
        } catch {
          parsed = null;
        }

        throw new Error(
          parsed?.message ||
            text ||
            `Image generation failed (${response.status}).`
        );
      }

      const data = (await response.json()) as
        | {
            imageUrl?: string;
            url?: string;
            image?: { imageUrl?: string; url?: string };
            data?: { imageUrl?: string; url?: string };
          }
        | undefined;

      const nextImage =
        data?.imageUrl ||
        data?.url ||
        data?.image?.imageUrl ||
        data?.image?.url ||
        data?.data?.imageUrl ||
        data?.data?.url;

      if (!nextImage) {
        throw new Error("No image URL returned from image generation API.");
      }

      setImage(nextImage);
      setImageSuccessMessage("Image generated successfully.");
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = window.setTimeout(() => {
        setImageSuccessMessage("");
      }, 2200);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not generate image. Please try again."
      );
      setImageSuccessMessage("");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const onSave = async () => {
    await savePost("scheduled");
  };

  const onPostNow = async () => {
    await savePost("published");
  };

  const savePost = async (forcedStatus?: DashboardStatus) => {
    if (!caption.trim()) {
      setValidationMessage("Caption is required.");
      setShowValidationPopup(true);
      return;
    }

    const finalPlatforms: DashboardPlatKey[] = platforms.length
      ? platforms
      : (["ig"] as DashboardPlatKey[]);

    const post: DashboardCalendarPost = {
      id: Date.now(),
      date: postDate,
      caption: caption.trim(),
      hashtags,
      plats: finalPlatforms,
      type: postType,
      timeStr: selectedTime,
      timesOptions: DEFAULT_TIMES,
      img: image,
      score,
      status: forcedStatus || "scheduled",
      reach: 0,
      engRate: "8.2%",
      isAI: true,
    };

    setIsSaving(true);
    setSaveError("");

    try {
      saveDashboardCalendarPost(post);
      await upsertCalendarPostToBackend(post);
      onSaved?.(post);
      onClose();
    } catch (error) {
      console.error("Failed to save post:", error);
      setSaveError("Could not save to backend. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">New Post</h2>
            <p className="text-sm text-slate-500">Fill in details below</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100">X</button>
        </div>

        <div className="grid flex-1 min-h-0 grid-cols-1 overflow-y-auto lg:grid-cols-[260px_1fr]">
          <div className="border-r border-slate-200 bg-slate-50 my-2">
            <div className="relative h-60 w-full overflow-hidden bg-white p-2">
              <img
                src={image}
                alt="post"
                className="h-full w-full cursor-zoom-in rounded-lg object-contain"
                onClick={() => setShowImagePreviewPopup(true)}
              />
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-md bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                Click to Preview
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700">
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              </label>
              <button
                onClick={onGenerateAnother}
                disabled={isGeneratingImage}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingImage ? "Generating..." : "Generate Another"}
              </button>
            </div>

            <div className="border-t border-slate-200 px-3 py-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((pl) => {
                  const selected = platforms.includes(pl);
                  const Icon = PLATFORM_ICONS[pl];
                  return (
                    <button
                      key={pl}
                      title={PLATFORM_LABELS[pl]}
                      onClick={() => togglePlatform(pl)}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold"
                      style={{
                        border: `1.5px solid ${selected ? PLATFORM_COLORS[pl] : "#E2E8F0"}`,
                        background: selected ? PLATFORM_COLORS[pl] : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{pl.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="space-y-4 p-5 min-h-0 my-2">
            <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Engagement Prediction</p>
                <p className="text-xs text-slate-500">AI score for this post</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-emerald-600">{score}</p>
                <p className="text-xs font-semibold text-emerald-700">🔥 Excellent</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
              <p className="text-sm text-slate-700"><span className="font-bold text-indigo-700">AI Rewrite</span> - Optimise caption for your brand</p>
              <button onClick={onRewrite} disabled={isRewritingCaption} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isRewritingCaption ? "Rewriting..." : "Rewrite"}</button>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Caption</p>
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Write your caption here..."
                className="h-28 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400"
              />
              <p className="mt-1 text-right text-xs text-slate-500">{caption.length} / 2200</p>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hashtags</p>
                <button onClick={onRefreshTags} className="text-xs font-semibold text-indigo-700">✦ Refresh</button>
              </div>
              <div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                {hashtags.map((tag, idx) => (
                  <span key={`${tag}-${idx}`} className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                    {tag}
                    <button onClick={() => setHashtags((prev) => prev.filter((_, i) => i !== idx))}>x</button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={onTagKeyDown}
                  placeholder="Type tag + Enter..."
                  className="min-w-28 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Date</p>
                <input type="date" value={dateVal} onChange={(event) => setDateVal(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Post Type</p>
                <select value={postType} onChange={(event) => setPostType(event.target.value as DashboardPostType)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400">
                  <option value="image">📸 Image</option>
                  <option value="reel">🎬 Reel</option>
                  <option value="carousel">🎠 Carousel</option>
                  <option value="story">📖 Story</option>
                </select>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Best Posting Times</p>
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">AI Powered</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DEFAULT_TIMES.map((slot) => {
                  const selected = slot.t === selectedTime;
                  return (
                    <button
                      key={slot.t}
                      onClick={() => setSelectedTime(slot.t)}
                      className={`rounded-lg border px-2 py-2 text-center ${selected ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
                    >
                      <p className="text-xs font-bold text-slate-900">{slot.t}</p>
                      <p className="text-[11px] text-slate-600">{slot.e}</p>
                      {slot.best ? <p className="text-[10px] font-bold text-emerald-600">⚡ Best</p> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            {rewriteError ? <p className="text-sm text-amber-600">{rewriteError}</p> : null}
            {imageSuccessMessage ? (
              <p className="text-sm text-emerald-600">{imageSuccessMessage}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button
            onClick={onPostNow}
            disabled={isSaving}
            className="rounded-lg border border-emerald-300 bg-emerald-500 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Post"}
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save & Schedule"}
          </button>
        </div>
      </div>

      {showCaptionPromptPopup && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowCaptionPromptPopup(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">Caption Required</h4>
            <p className="mt-2 text-sm text-slate-600">
              Add a caption first so we can generate an image from it.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowCaptionPromptPopup(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showValidationPopup && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/35"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowValidationPopup(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-rose-200 bg-white p-5 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">Validation Error</h4>
            <p className="mt-2 text-sm text-slate-600">
              {validationMessage || "Please check required fields."}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowValidationPopup(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showImagePreviewPopup && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowImagePreviewPopup(false);
              resetImageView();
            }
          }}
        >
          <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <h4 className="text-sm font-bold text-slate-900">Image Preview</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOutImage}
                  disabled={imageZoom <= 1}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Zoom -
                </button>
                <button
                  onClick={zoomInImage}
                  disabled={imageZoom >= 4}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Zoom +
                </button>
                <button
                  onClick={resetImageView}
                  className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
                >
                  Reset
                </button>
                <span className="min-w-14 text-center font-mono text-xs font-bold text-indigo-700">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button
                  onClick={() => {
                    setShowImagePreviewPopup(false);
                    resetImageView();
                  }}
                  className="h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-500"
                  aria-label="Close image preview"
                >
                  x
                </button>
              </div>
            </div>

            <div
              className="flex flex-1 items-center justify-center overflow-hidden bg-slate-100 p-4"
              onMouseDown={onPreviewMouseDown}
              onMouseMove={onPreviewMouseMove}
              onMouseUp={stopImagePanning}
              onMouseLeave={stopImagePanning}
              style={{ cursor: imageZoom > 1 ? (isPanningImage ? "grabbing" : "grab") : "default" }}
            >
              <img
                src={image}
                alt="Preview"
                draggable={false}
                className="max-h-full max-w-full select-none rounded-lg border border-slate-200 bg-white object-contain"
                style={{
                  transform: `translate(${imagePan.x}px, ${imagePan.y}px) scale(${imageZoom})`,
                  transformOrigin: "center center",
                  transition: isPanningImage ? "none" : "transform 150ms ease",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
