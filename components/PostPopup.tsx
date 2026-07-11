"use client";

import { useMemo, useState } from "react";
import { X, Hash, Calendar, CheckCircle2 } from "lucide-react";
import {
  FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube,
} from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import { IconType } from "react-icons";
import {
  DashboardCalendarPost, DashboardPlatKey, DashboardPostType,
  DashboardStatus, DashboardTimeSlot, saveDashboardCalendarPost,
} from "@/app/dashboards/calendarSync";

type Props = {
  isOpen: boolean;
  imageUrl: string;
  initialCaption?: string;
  onClose: () => void;
  onSaved?: (post: DashboardCalendarPost) => void;
};

const PLATFORMS: DashboardPlatKey[] = ["ig", "fb", "li", "tw", "tk", "yt", "th"];
const PLATFORM_LABELS: Record<DashboardPlatKey, string> = {
  ig: "IG", fb: "FB", li: "LI", tw: "TW", tk: "TK", yt: "YT", th: "TH",
};
const PLATFORM_ICONS: Record<DashboardPlatKey, IconType> = {
  ig: FaInstagram, fb: FaFacebookF, li: FaLinkedinIn,
  tw: FaXTwitter, tk: FaTiktok, yt: FaYoutube, th: FaThreads,
};
const PLATFORM_COLORS: Record<DashboardPlatKey, string> = {
  ig: "#E1306C", li: "#0A66C2", tw: "#1DA1F2",
  fb: "#1877F2", tk: "#111111", yt: "#FF0000", th: "#555555",
};

const DEFAULT_HASHTAGS = ["#Startup", "#Entrepreneurship", "#VentureCapital", "#Founder", "#TechStartup"];
const DEFAULT_TIMES: DashboardTimeSlot[] = [
  { t: "9:00 AM", e: "7.6%", best: false },
  { t: "12:30 PM", e: "8.2%", best: true },
  { t: "5:45 PM", e: "9.8%", best: true },
  { t: "8:30 PM", e: "7.1%", best: false },
];
const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

export default function PostPopup({ isOpen, imageUrl, initialCaption, onClose, onSaved }: Props) {
  const [caption, setCaption] = useState(initialCaption || "");
  const [hashtags, setHashtags] = useState<string[]>(DEFAULT_HASHTAGS);
  const [tagInput, setTagInput] = useState("");
  const [platforms, setPlatforms] = useState<DashboardPlatKey[]>(["ig"]);
  const [dateVal, setDateVal] = useState(toInputDate(new Date()));
  const [selectedTime] = useState(DEFAULT_TIMES[2].t);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const postDate = useMemo(() => {
    const parsed = new Date(dateVal);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [dateVal]);

  if (!isOpen) return null;

  const togglePlatform = (pl: DashboardPlatKey) => {
    setPlatforms((prev) => prev.includes(pl) ? prev.filter((p) => p !== pl) : [...prev, pl]);
  };

  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const cleaned = tagInput.trim().replace(/^#+/, "");
    if (!cleaned) return;
    const tag = `#${cleaned}`;
    if (!hashtags.includes(tag)) setHashtags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const savePost = async (status: DashboardStatus) => {
    if (!caption.trim()) { setSaveError("Caption is required."); return; }
    const post: DashboardCalendarPost = {
      id: Date.now(),
      date: postDate,
      caption: caption.trim(),
      hashtags,
      plats: platforms.length ? platforms : ["ig"],
      type: "image" as DashboardPostType,
      timeStr: selectedTime,
      timesOptions: DEFAULT_TIMES,
      img: imageUrl,
      score: 92,
      status,
      reach: 0,
      engRate: "8.2%",
      isAI: true,
    };
    setIsSaving(true);
    setSaveError("");
    try {
      saveDashboardCalendarPost(post);
      onSaved?.(post);
      setSaved(true);
      setTimeout(() => onClose(), 800);
    } catch {
      setSaveError("Could not save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
          <div>
            <h2 className="text-base font-bold text-white">Post Preview</h2>
            <p className="text-xs text-white/70">Review and schedule your post</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-orange-100 bg-gray-50 flex items-center justify-center" style={{ maxHeight: 260 }}>
            <img src={imageUrl} alt="post" className="w-full object-contain" style={{ maxHeight: 260 }} />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption here..."
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{caption.length} / 2200</p>
          </div>

          {/* Hashtags */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Hash size={13} className="text-orange-500" />
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hashtags</label>
            </div>
            <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 min-h-[48px]">
              {hashtags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200">
                  {tag}
                  <button onClick={() => setHashtags((prev) => prev.filter((_, idx) => idx !== i))} className="text-orange-400 hover:text-red-500 ml-0.5">×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown}
                placeholder="Add tag + Enter"
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-24 flex-1"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((pl) => {
                const selected = platforms.includes(pl);
                const Icon = PLATFORM_ICONS[pl];
                return (
                  <button
                    key={pl}
                    onClick={() => togglePlatform(pl)}
                    title={pl.toUpperCase()}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                    style={{
                      border: `2px solid ${selected ? PLATFORM_COLORS[pl] : "#E5E7EB"}`,
                      background: selected ? PLATFORM_COLORS[pl] : "#fff",
                      color: selected ? "#fff" : "#6B7280",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {PLATFORM_LABELS[pl]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar size={13} className="text-orange-500" />
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Schedule Date</label>
            </div>
            <input
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{saveError}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-100 transition">
            Cancel
          </button>
          <button
            onClick={() => savePost("scheduled")}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}
          >
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : isSaving ? "Saving..." : "Save & Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
