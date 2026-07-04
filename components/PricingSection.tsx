"use client";

import React, { useState, useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

// Platform data — mirrors the provided design.
const PLATFORMS = [
  { name: "X", bg: "#000000", svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
  { name: "LinkedIn", bg: "#0A66C2", svg: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
  { name: "Instagram", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 0 } },
  { name: "TikTok", bg: "#000000", svg: <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
  { name: "Facebook", bg: "#1877F2", svg: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
  { name: "Threads", bg: "#000000", svg: <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.746-1.757-.51-.586-1.3-.883-2.345-.89h-.043c-.708 0-1.67.195-2.282 1.106l-1.737-1.21c.823-1.222 2.169-1.894 3.79-1.894h.064c2.709.017 4.322 1.674 4.482 4.553.092.039.183.077.272.117 1.255.589 2.18 1.494 2.674 2.616.687 1.56.75 4.106-1.317 6.13-1.578 1.55-3.494 2.244-6.226 2.264Z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
  { name: "Bluesky", bg: "#0285FF", svg: <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 0 } },
  { name: "YouTube", bg: "#FF0000", svg: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
  { name: "Pinterest", bg: "#BD081C", svg: <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.756-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592.001 12.017.001z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 0 } },
  { name: "Google Biz", bg: "#4285F4", svg: <path d="M12.04 2C7.69 2 4.14 5.54 4.14 9.91c0 .03 0 .06.01.09L2.5 9.91v4.18l1.66-.09c.34 4.06 3.72 7.27 7.88 7.27 4.39 0 7.96-3.57 7.96-7.96 0-.54-.05-1.06-.15-1.57h-7.81v3.18h4.47c-.19 1-.78 1.85-1.66 2.42v2.01h2.69c1.57-1.45 2.48-3.58 2.48-6.12 0-4.37-3.55-7.91-7.92-7.91z" />, caps: { post: 1, schedule: 1, analytics: 1, media: 1, comments: 1 } },
];

const ORDER = ["post", "schedule", "analytics", "media", "comments"];

const DATA: Record<string, any> = {
  INR: {
    sym: "₹",
    m: { amt: "10,000", per: "/mo", sub: "billed monthly", usd: "≈ $119/mo in USD", flag: "FLEXIBLE — CANCEL ANYTIME", cta: "Get started — Monthly" },
    y: { amt: "8,000", per: "/mo", sub: "billed annually at ₹96,000", usd: "≈ $95/mo in USD", flag: "BEST VALUE — SAVE 20% · RATE LOCKED 12 MONTHS", cta: "Get started — Yearly" },
    save: "You save ₹24,000 a year — 20% off, that's 2.4 months free",
    pay: "UPI · Net Banking · Cards · GST invoice included"
  },
  USD: {
    sym: "$",
    m: { amt: "119", per: "/mo", sub: "billed monthly", usd: "≈ ₹10,000/mo in INR", flag: "FLEXIBLE — CANCEL ANYTIME", cta: "Get started — Monthly" },
    y: { amt: "95", per: "/mo", sub: "billed annually at $1,143", usd: "≈ ₹8,000/mo in INR", flag: "BEST VALUE — SAVE 20% · RATE LOCKED 12 MONTHS", cta: "Get started — Yearly" },
    save: "You save $286 a year — 20% off, that's 2.4 months free",
    pay: "Visa · Mastercard · Amex · PayPal"
  }
};

export default function PricingSection() {
  const [billing, setBilling] = useState<'m' | 'y'>('m');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    setFlip(true);
    const timer = setTimeout(() => setFlip(false), 250);
    return () => clearTimeout(timer);
  }, [billing, currency]);

  const d = DATA[currency];
  const p = d[billing];

  return (
    <div className={`${plusJakartaSans.variable} font-sans`}>
      <style jsx global>{`
        :root {
          --bg: #faf6ef;
          --bg-2: #f3ede2;
          --card: #ffffff;
          --ink: #1a1714;
          --ink-soft: #5c554c;
          --ink-mute: #928a7e;
          --line: #e7dfd2;
          --line-2: #d8cfbe;
          --accent: #0f0e0d;
          --green: #1c8a4e;
          --green-soft: #e6f4ec;
          --chip: #efe9dd;
          --chip-off: #f6f2ea;
          --radius: 18px;
        }

        .pricing-wrapper {
          background: var(--bg);
          color: var(--ink);
          line-height: 1.5;
          padding-bottom: 90px;
          font-family: var(--font-plus-jakarta), sans-serif;
        }

        .wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
        }

        /* HERO */
        .hero {
          text-align: center;
          padding: 92px 0 14px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: .02em;
          color: var(--green);
          background: var(--green-soft);
          border: 1px solid #cde7d6;
          padding: 7px 15px;
          border-radius: 999px;
        }

        .hero h1 {
          font-size: clamp(34px, 5.4vw, 62px);
          font-weight: 800;
          letter-spacing: -.025em;
          line-height: 1.04;
          margin: 22px 0 0;
        }

        .hero h1 .u {
          position: relative;
          white-space: nowrap;
        }

        .hero h1 .u::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: .06em;
          height: .14em;
          background: #f4c84b;
          border-radius: 4px;
          z-index: -1;
          opacity: .85;
        }

        .hero .sub {
          color: var(--ink-soft);
          font-size: clamp(15px, 1.6vw, 19px);
          max-width: 640px;
          margin: 20px auto 0;
        }

        /* PLATFORM LINE */
        .platline {
          max-width: 920px;
          margin: 30px auto 0;
          text-align: center;
          color: var(--ink-soft);
          font-size: 15.5px;
          font-weight: 600;
        }

        .platline b {
          color: var(--ink);
        }

        .platstrip {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 11px;
          margin-top: 18px;
        }

        .ps {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: .22s;
          box-shadow: 0 2px 8px -3px rgba(40, 30, 15, .35);
        }

        .ps:hover {
          transform: translateY(-3px) scale(1.06);
        }

        .ps svg {
          width: 22px;
          height: 22px;
          fill: #fff;
        }

        /* BILLING PANEL */
        .billing {
          position: relative;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 0;
          background: linear-gradient(160deg, #fffdf9 0%, #fbf6ec 100%);
          border: 1px solid var(--line-2);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 40px 80px -50px rgba(60, 45, 20, .45), 0 1px 0 rgba(255, 255, 255, .6) inset;
          margin-top: 48px;
        }

        .billing-glow {
          position: absolute;
          top: -40%;
          left: -10%;
          width: 60%;
          height: 140%;
          background: radial-gradient(circle, rgba(244, 200, 75, .18), transparent 60%);
          pointer-events: none;
          filter: blur(20px);
        }

        .bill-left {
          position: relative;
          z-index: 1;
          padding: 44px 46px;
        }

        .bill-right {
          position: relative;
          z-index: 1;
          padding: 44px 46px;
          background: rgba(26, 23, 20, .025);
          border-left: 1px solid var(--line);
        }

        .seg-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 34px;
        }

        .seg {
          position: relative;
          display: inline-flex;
          background: #efe7d8;
          border: 1px solid var(--line-2);
          border-radius: 999px;
          padding: 5px;
        }

        .seg-pill {
          position: absolute;
          top: 5px;
          left: 5px;
          height: calc(100% - 10px);
          width: calc(50% - 5px);
          background: var(--ink);
          border-radius: 999px;
          transition: transform .34s cubic-bezier(.65, .05, .25, 1);
          z-index: 0;
          box-shadow: 0 4px 12px -4px rgba(0, 0, 0, .4);
        }

        .seg.y .seg-pill {
          transform: translateX(100%);
        }

        .seg-btn {
          position: relative;
          z-index: 1;
          font-family: var(--font-plus-jakarta);
          font-size: 14px;
          font-weight: 700;
          color: var(--ink-soft);
          background: transparent;
          border: 0;
          cursor: pointer;
          padding: 9px 20px;
          border-radius: 999px;
          transition: color .3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .seg-btn.active {
          color: #fff;
        }

        .seg-save {
          font-size: 11px;
          font-weight: 800;
          background: #f4c84b;
          color: #1a1714;
          padding: 2px 7px;
          border-radius: 999px;
        }

        .seg-btn.active .seg-save {
          background: var(--green);
          color: #fff;
        }

        .cur-seg {
          display: inline-flex;
          background: #efe7d8;
          border: 1px solid var(--line-2);
          border-radius: 999px;
          padding: 5px;
          gap: 3px;
        }

        .cur-seg button {
          width: 34px;
          height: 32px;
          font-family: var(--font-plus-jakarta);
          font-size: 15px;
          font-weight: 800;
          color: var(--ink-soft);
          background: transparent;
          border: 0;
          border-radius: 999px;
          cursor: pointer;
          transition: .22s;
        }

        .cur-seg button.active {
          background: var(--green);
          color: #fff;
        }

        .plan-flag {
          font-size: 11.5px;
          letter-spacing: .16em;
          font-weight: 800;
          color: var(--green);
          margin-bottom: 14px;
          transition: .3s;
        }

        .big-price {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          line-height: 1;
        }

        .bp-cur {
          font-size: 34px;
          font-weight: 700;
          color: var(--ink-soft);
          margin-top: 10px;
        }

        .bp-amt {
          font-size: 84px;
          font-weight: 800;
          letter-spacing: -.04em;
          line-height: .9;
          background: linear-gradient(180deg, #1a1714, #4a423a);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: opacity .25s, transform .25s;
        }

        .bp-amt.flip {
          opacity: 0;
          transform: translateY(6px);
        }

        .bp-per {
          font-size: 18px;
          font-weight: 600;
          color: var(--ink-mute);
          align-self: flex-end;
          margin-bottom: 14px;
        }

        .bp-sub {
          font-size: 14.5px;
          color: var(--ink-soft);
          font-weight: 600;
          margin-top: 12px;
        }

        .bp-usd {
          font-size: 13px;
          color: var(--ink-mute);
          font-weight: 500;
          margin-top: 3px;
        }

        .save-ribbon {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-top: 18px;
          background: var(--green-soft);
          border: 1px solid #bfe4cd;
          color: #0f6e3a;
          font-size: 13.5px;
          font-weight: 700;
          padding: 9px 15px;
          border-radius: 12px;
          animation: popin .4s cubic-bezier(.2, .8, .3, 1.2);
        }

        @keyframes popin {
          from {
            opacity: 0;
            transform: scale(.92) translateY(4px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .sr-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 0 4px rgba(28, 138, 78, .18);
        }

        .bill-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
          text-decoration: none;
          background: var(--ink);
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          padding: 17px 24px;
          border-radius: 14px;
          transition: .25s;
          box-shadow: 0 14px 30px -14px rgba(26, 23, 20, .7);
        }

        .bill-cta:hover {
          background: #000;
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -16px rgba(26, 23, 20, .8);
        }

        .bill-cta svg {
          width: 19px;
          height: 19px;
          stroke: #fff;
          fill: none;
          stroke-width: 2.4;
          transition: transform .25s;
        }

        .bill-cta:hover svg {
          transform: translateX(4px);
        }

        .bill-pay {
          font-size: 13px;
          color: var(--ink-mute);
          font-weight: 600;
          margin-top: 16px;
          text-align: center;
        }

        .br-head {
          margin-bottom: 26px;
        }

        .br-kicker {
          font-size: 11.5px;
          letter-spacing: .16em;
          font-weight: 800;
          color: var(--ink-mute);
        }

        .br-head h3 {
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -.02em;
          margin-top: 8px;
        }

        .br-feats {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .br-feats li {
          display: flex;
          gap: 13px;
          align-items: flex-start;
        }

        .br-feats li svg {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
          stroke: #fff;
          fill: none;
          stroke-width: 3;
          background: var(--green);
          border-radius: 50%;
          padding: 3px;
          box-sizing: border-box;
        }

        .br-feats li div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .br-feats li b {
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }

        .br-feats li span {
          font-size: 13px;
          color: var(--ink-soft);
          line-height: 1.45;
        }

        .br-feats li em {
          font-style: normal;
          color: var(--green);
          font-weight: 700;
        }

        .yearly-only {
          opacity: .5;
          transition: .3s;
        }

        .yearly-only.lit {
          opacity: 1;
        }

        /* PLATFORM GRID */
        .section {
          margin: 96px 0 0;
        }

        .sec-head {
          text-align: center;
          margin-bottom: 44px;
        }

        .sec-head h2 {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          letter-spacing: -.02em;
        }

        .sec-head h2 .acc {
          color: var(--green);
        }

        .sec-head p {
          color: var(--ink-soft);
          margin-top: 12px;
          font-size: 16px;
          max-width: 620px;
          margin-left: auto;
          margin-right: auto;
        }

        .plat-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
        }

        .pl {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 22px 20px;
          transition: .25s;
        }

        .pl:hover {
          transform: translateY(-3px);
          border-color: var(--line-2);
          box-shadow: 0 14px 32px -20px rgba(60, 45, 20, .3);
        }

        .pl-head {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 16px;
        }

        .pl-ico {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ink);
          flex-shrink: 0;
          overflow: hidden;
        }

        .pl-ico svg {
          width: 19px;
          height: 19px;
          fill: #fff;
        }

        .pl-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -.01em;
        }

        .caps {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .cap {
          font-size: 12px;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 7px;
          background: var(--chip);
          color: var(--ink-soft);
          border: 1px solid transparent;
        }

        .cap.off {
          background: var(--chip-off);
          color: #c3bbac;
          border: 1px dashed var(--line-2);
          text-decoration: line-through;
        }

        .legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 30px;
          flex-wrap: wrap;
          font-size: 13.5px;
          color: var(--ink-soft);
          font-weight: 600;
        }

        .legend span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend .sw {
          width: 26px;
          height: 16px;
          border-radius: 5px;
          background: var(--chip);
          border: 1px solid transparent;
        }

        .legend .sw.off {
          background: var(--chip-off);
          border: 1px dashed var(--line-2);
        }

        .ent {
          margin: 70px 0 0;
          background: var(--ink);
          color: #fff;
          border-radius: var(--radius);
          padding: 42px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
        }

        .ent h3 {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.01em;
        }

        .ent p {
          color: rgba(255, 255, 255, .72);
          font-size: 15px;
          margin-top: 8px;
          max-width: 560px;
        }

        .ent .cta {
          margin: 0;
          background: #fff;
          color: var(--ink);
          white-space: nowrap;
          text-decoration: none;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 12px;
          transition: .22s;
        }

        .ent .cta:hover {
          background: #f4c84b;
        }

        .trust {
          display: flex;
          justify-content: center;
          gap: 28px;
          flex-wrap: wrap;
          margin: 30px 0 90px;
          color: var(--ink-mute);
          font-size: 13.5px;
          font-weight: 600;
        }

        .trust span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .trust svg {
          width: 15px;
          height: 15px;
          stroke: var(--green);
          fill: none;
          stroke-width: 2.6;
        }

        @media (max-width: 980px) {
          .plat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 840px) {
          .billing {
            grid-template-columns: 1fr;
          }
          .bill-right {
            border-left: 0;
            border-top: 1px solid var(--line);
          }
        }
        @media (max-width: 760px) {
          .plat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ent {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }
          .bp-amt {
            font-size: 64px;
          }
          .bill-left, .bill-right {
            padding: 34px 28px;
          }
        }
        @media (max-width: 460px) {
          .plat-grid {
            grid-template-columns: 1fr;
          }
          .bp-amt {
            font-size: 46px;
          }
          .bp-cur {
            font-size: 24px;
            margin-top: 6px;
          }
          .bp-per {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="pricing-wrapper">
        <div className="wrap">
          {/* HERO */}
          <section className="hero">
            <span className="eyebrow">💰 Investment — Not an Expense</span>
            <h1>Ten Platforms. <span className="u">One Integration.</span></h1>
            <p className="sub">Post, schedule, analyze, manage media and comments across every major network — from a single dashboard. One transparent price, everything included.</p>
          </section>

          <div className="platline">
            Built for all ten — natively
            <div className="platstrip">
              {PLATFORMS.map((p, idx) => (
                <div key={idx} className="ps" title={p.name} style={{ background: p.bg }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">{p.svg}</svg>
                </div>
              ))}
            </div>
          </div>

          {/* BILLING PANEL */}
          <section className="billing">
            <div className="billing-glow"></div>

            {/* left: controls + price */}
            <div className="bill-left">
              <div className="seg-wrap">
                <div className={`seg ${billing === 'y' ? 'y' : ''}`}>
                  <div className="seg-pill"></div>
                  <button className={`seg-btn ${billing === 'm' ? 'active' : ''}`} onClick={() => setBilling('m')}>Monthly</button>
                  <button className={`seg-btn ${billing === 'y' ? 'active' : ''}`} onClick={() => setBilling('y')}>
                    Yearly <span className="seg-save">−20%</span>
                  </button>
                </div>
                <div className="cur-seg">
                  <button className={currency === 'INR' ? 'active' : ''} onClick={() => setCurrency('INR')}>₹</button>
                  <button className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')}>$</button>
                </div>
              </div>

              <div className="plan-flag">{p.flag}</div>

              <div className="big-price">
                <span className="bp-cur">{d.sym}</span>
                <span className={`bp-amt ${flip ? 'flip' : ''}`}>{p.amt}</span>
                <span className="bp-per">{p.per}</span>
              </div>

              <div className="bp-sub">{p.sub}</div>
              <div className="bp-usd">{p.usd}</div>

              {billing === 'y' && (
                <div className="save-ribbon">
                  <span className="sr-dot"></span>
                  <span>{d.save}</span>
                </div>
              )}

              <a href="/signup" className="bill-cta">
                <span>{p.cta}</span>
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </a>

              <div className="bill-pay">{d.pay}</div>
            </div>

            {/* right: what's included */}
            <div className="bill-right">
              <div className="br-head">
                <span className="br-kicker">EVERYTHING, INCLUDED</span>
                <h3>One plan. Zero feature gates.</h3>
              </div>
              <ul className="br-feats">
                <li><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div><b>All 10 platforms</b><span>X, LinkedIn, Instagram, TikTok, Facebook, Threads, Bluesky, YouTube, Pinterest, Google Biz</span></div></li>
                <li><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div><b>Unlimited posting &amp; scheduling</b><span>No caps on posts, queues, or connected accounts</span></div></li>
                <li><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div><b>Full analytics &amp; reporting</b><span>Unified cross-channel metrics in one dashboard</span></div></li>
                <li><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div><b>Media library &amp; comments inbox</b><span>Central assets and one place to reply to everything</span></div></li>
                <li className={`yearly-only ${billing === 'y' ? 'lit' : ''}`}><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div><b>Priority support &amp; API access</b><span>Faster onboarding, locked-in rate, advanced API <em>— Yearly</em></span></div></li>
              </ul>
            </div>
          </section>

          {/* CAPABILITY MATRIX */}
          <section className="section">
            <div style={{ textAlign: "center", marginBottom: "44px" }}>
              {/* Badge */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "6px 20px", borderRadius: "999px",
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                  color: "#fff", fontSize: "11px", fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                  </svg>
                  Platform Matrix
                </span>
              </div>
              {/* Heading */}
              <h2 style={{
                fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 800,
                letterSpacing: "-0.025em", lineHeight: 1.08,
                color: "#0f172a", marginBottom: "14px",
              }}>
                {"What's included, "}
                <span style={{
                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>per platform</span>
              </h2>
              {/* Subtitle */}
              <p style={{
                color: "#64748b", fontSize: "clamp(14px,1.5vw,17px)",
                maxWidth: "600px", margin: "0 auto", lineHeight: 1.6,
              }}>
                Every plan unlocks the full capability set across all ten networks — post, schedule, analytics, media, and comments.
              </p>
            </div>

            <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid #f1f1f1" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f5f5f5" }}>
                    <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700, color: "#888", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", minWidth: "110px", background: "#fafafa" }}>
                      Feature
                    </th>
                    {PLATFORMS.map((p) => (
                      <th key={p.name} style={{ padding: "14px 10px", textAlign: "center", background: "#fafafa", minWidth: "72px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, background: p.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 16, height: 16, fill: "#fff" }}>{p.svg}</svg>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: "11px", color: "#444", whiteSpace: "nowrap" }}>{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDER.map((cap, rowIdx) => {
                    const labels: Record<string, { label: string; desc: string }> = {
                      post:      { label: "Post",      desc: "Publish AI-generated posts" },
                      schedule:  { label: "Schedule",  desc: "Auto-schedule to best times" },
                      analytics: { label: "Analytics", desc: "Reach, clicks & engagement" },
                      media:     { label: "Media",     desc: "Images, videos & carousels" },
                      comments:  { label: "Comments",  desc: "Monitor & reply to comments" },
                    };
                    return (
                      <tr key={cap} style={{ borderBottom: rowIdx < ORDER.length - 1 ? "1px solid #f5f5f5" : "none", background: rowIdx % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 600, color: "#222", marginBottom: 2 }}>{labels[cap].label}</div>
                          <div style={{ fontSize: "11px", color: "#999" }}>{labels[cap].desc}</div>
                        </td>
                        {PLATFORMS.map((p) => {
                          const supported = !!(p.caps as any)[cap];
                          return (
                            <td key={p.name} style={{ textAlign: "center", padding: "14px 10px" }}>
                              {supported ? (
                                <span style={{
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  width: 24, height: 24, borderRadius: "50%",
                                  background: "linear-gradient(135deg,#f97316,#ef4444)",
                                }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                                    <path d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              ) : (
                                <span style={{ color: "#d1d5db", fontSize: "18px", fontWeight: 300 }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: "24px", marginTop: "16px", fontSize: "12px", color: "#888", justifyContent: "flex-end", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}><path d="M5 13l4 4L19 7"/></svg>
                </span>
                Included
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "#d1d5db", fontSize: "16px" }}>—</span>
                Not yet supported by platform API
              </span>
            </div>
          </section>

          {/* ENTERPRISE */}
          <section className="ent">
            <div>
              <h3>Need volume, SSO or a custom SLA?</h3>
              <p>Talk to our team about enterprise deployments, dedicated infrastructure, custom integrations and procurement-ready contracts.</p>
            </div>
            <a href="/contact-us" className="cta">Contact Sales →</a>
          </section>

          <div className="trust">
            <span><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> 14-day money-back guarantee</span>
            <span><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> No setup fees, ever</span>
            <span><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> Cancel anytime</span>
            <span><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg> SOC 2-aligned security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
