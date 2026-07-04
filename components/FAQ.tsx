"use client";

import { useState, useMemo } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
export interface FAQItem {
  id: number;
  cat: string;
  q: string;
  a: string;
  cta?: { text: string; href: string };
}

export interface Category {
  id: string;
  label: string;
  count: number;
}

// ── FAQ Data — 28 questions, 5 categories ──────────────────────────────────
export const FAQS: FAQItem[] = [
  // ── GETTING STARTED (6) ───────────────────────────────────────────────────
  {
    id: 1, cat: "start",
    q: "What is ShoutlyAI and how does it work?",
    a: `ShoutlyAI is an AI-powered social media automation tool built specifically for Indian businesses. You type one prompt describing your brand — e.g. "A premium gym in Koramangala, Bangalore focused on weight loss" — and ShoutlyAI generates a full year of social media posts, captions, hashtags, and a posting schedule. Posts are matched to your industry from our library of 10,000+ professional poster templates and automatically tuned to Indian festivals and occasions.`,
    cta: { text: "Start your 14-day free trial →", href: "/signup" }
  },
  {
    id: 2, cat: "start",
    q: "Is there a free trial? Do I need a credit card?",
    a: `No, we currently do not offer a free trial. You can choose the plan that best fits your needs and get started immediately. There are no hidden charges, and you'll have instant access to ShoutlyAI's powerful features, including AI-generated content, scheduling across 10+ social media platforms, and unified analytics.\n\nIf you're unsure which plan is right for you, our team is happy to help you choose the best option for your business.`,
  },
  {
    id: 3, cat: "start",
    q: "How long does it take to set up?",
    a: `Under 5 minutes. You select your industry, describe your brand in 2–3 sentences, choose your posting frequency, and click Generate. ShoutlyAI creates your full content calendar immediately. No design skills, no copywriting experience, and no social media knowledge needed.`
  },
  {
    id: 4, cat: "start",
    q: "Which types of businesses does ShoutlyAI work best for?",
    a: `ShoutlyAI works best for Indian SMBs, local businesses, and professionals who need consistent social media content but don't have time to create it. Our 45+ supported industries include restaurants, gyms, real estate agents, clinics, CA firms, retail stores, educational institutes, salons, and more. If you run a business in India and need daily social media posts, ShoutlyAI is built for you.`
  },
  {
    id: 5, cat: "start",
    q: "Does ShoutlyAI support Hindi and regional Indian languages?",
    a: `Currently, captions are generated in English with Indian context (local city names, Indian occasions, etc.). Hindi and regional language support — Tamil, Telugu, Marathi, Kannada — is on our roadmap for Q3 2026. You can manually edit any caption in any language after generation.`
  },
  {
    id: 6, cat: "start",
    q: "Do I need any design or social media experience?",
    a: `None at all. ShoutlyAI handles design (matching professional poster templates to your brand), copywriting (generating captions and hashtags), and scheduling (posting at optimal times). If you can describe your business in a few sentences, ShoutlyAI does everything else.`
  },

  // ── PRICING & BILLING (7) ─────────────────────────────────────────────────
  {
    id: 7, cat: "billing",
    q: "What is the pricing model? How much does it cost?",
    a: `ShoutlyAI offers one simple, all-inclusive plan with transparent pricing in INR:\n\n• Monthly: ₹10,000/mo\n• Yearly: ₹8,000/mo (billed annually at ₹96,000)\n\nAnnual billing saves you 20% — equivalent to 2.4 months free. Every feature and all 10 platforms are included in this one plan. No feature gates, no hidden fees.`,
    cta: { text: "See pricing details →", href: "/pricing" }
  },
  {
    id: 8, cat: "billing",
    q: "How can I pay? Do you accept Indian payment methods?",
    a: `Yes. We accept UPI, Net Banking, Indian Debit cards, Indian Credit cards (Visa, Mastercard, RuPay), and international cards. All prices are displayed in INR. A GST-compliant invoice is generated automatically for every payment — just add your GSTIN during checkout to have it included.`
  },
  {
    id: 9, cat: "billing",
    q: "Can I cancel anytime? What is the refund policy?",
    a: `Yes — cancel anytime from Account Settings with one click. No questions asked, no lock-in, no cancellation fees.\n\nWe offer a 14-day money-back guarantee. If you're not satisfied within your first 14 days of a paid subscription, we'll refund you in full. For monthly plans after the guarantee period, cancellation takes effect at the end of your current billing period.`,
  },
  {
    id: 10, cat: "billing",
    q: "What is the difference between monthly and annual billing?",
    a: `Annual billing saves you 20% compared to monthly — equivalent to getting 2.4 months free per year. Annual plans are billed upfront for the full year. Monthly plans are billed each month and offer more flexibility.\n\nAnnual plans also include priority support and advanced API access.`,
  },
  {
    id: 11, cat: "billing",
    q: "Do you provide GST invoices for business expenses?",
    a: `Yes. Every payment generates a GST-compliant invoice automatically sent to your registered email. Add your GSTIN in Account → Billing → Tax Details to have it included on all future invoices. ShoutlyAI is GST-registered and all invoices include our GSTIN for your records.`
  },
  {
    id: 12, cat: "billing",
    q: "Can I manage multiple brands under one account?",
    a: `Our standard plan is built for one main brand with unlimited posting across all 10 platforms. If you need to manage multiple brands or need white-label capabilities for an agency, please contact our sales team for custom enterprise options.`,
    cta: { text: "Contact Sales →", href: "/contact-us" }
  },
  {
    id: 13, cat: "billing",
    q: "Are there any hidden fees or extra costs for extra platforms?",
    a: `None. One price unlocks everything. Unlike other tools that charge extra for LinkedIn or TikTok, ShoutlyAI includes all 10 supported platforms (Instagram, Facebook, X, LinkedIn, TikTok, Threads, Bluesky, YouTube, Pinterest, Google Biz) in the base price.`
  },

  // ── FEATURES & PLATFORMS (7) ──────────────────────────────────────────────
  {
    id: 14, cat: "features",
    q: "Which social media platforms does ShoutlyAI support?",
    a: `We support 10 major networks: Instagram, Facebook, X/Twitter, LinkedIn, TikTok, Threads, Bluesky, YouTube, Pinterest, and Google My Business.\n\nAll 10 are included in your plan from day one. Direct publishing and scheduling are supported across all networks.`
  },
  {
    id: 15, cat: "features",
    q: "Does ShoutlyAI create Reels and video content?",
    a: `Yes, unlimited Reels are included in the plan. Reels are generated as high-engagement video-style posts with animated text, cover images, and trending music suggestions.\n\nFull AI video production (generative video) is on our Q4 2026 roadmap.`
  },
  {
    id: 16, cat: "features",
    q: "How does the India festival calendar work?",
    a: `ShoutlyAI's AI is trained on India's complete festival and occasion calendar — Holi, Diwali, Ganesh Chaturthi, Eid, Dussehra, Independence Day, Republic Day, Gandhi Jayanti, Durgapuja, Onam, Pongal, Christmas, New Year, and 40+ more.\n\nWhen generating your calendar, the AI automatically selects festival-appropriate poster templates and writes occasion-specific captions for your brand — without you needing to manually specify any festivals.`
  },
  {
    id: 17, cat: "features",
    q: "Does ShoutlyAI post automatically, or do I need to approve each post?",
    a: `Both options are available. You can set posts to auto-publish at the scheduled time with no manual action required. Or you can use approval mode, where every post waits for your one-click approval before going live.\n\nMost users start in approval mode for the first month, then switch to auto-publish once they are confident in the content quality.`
  },
  {
    id: 18, cat: "features",
    q: "Can I edit the AI-generated captions and change poster images?",
    a: `Yes — every post is fully editable before it goes live. You can rewrite captions, regenerate captions with one click, swap the poster image from our library of 10,000+ templates, add or remove hashtags, change the posting time, or skip a day entirely. You are always in control.`
  },
  {
    id: 19, cat: "features",
    q: "Does ShoutlyAI show analytics on how my posts perform?",
    a: `Yes, full analytics and reporting are included. You can see engagement metrics (likes, comments, reach), best-performing content types, and audience growth across all connected platforms in one unified dashboard.`
  },
  {
    id: 20, cat: "features",
    q: "How many industries and business types are supported?",
    a: `ShoutlyAI currently supports 45+ industries with dedicated poster libraries and AI-tuned content: health & fitness, food & beverage, fashion, real estate, education, finance, medical, technology, hospitality, automobile, home lifestyle, events, sports, retail, personal branding, beauty & wellness, home services, NGOs, manufacturing, and more.\n\nIf your exact industry is not listed, select the closest match — the AI adapts well to sub-niches.`
  },

  // ── YOUR CONTENT (5) ──────────────────────────────────────────────────────
  {
    id: 21, cat: "content",
    q: "Will the content look professional and on-brand for my business?",
    a: `Yes. ShoutlyAI matches your brand description to industry-specific professional poster templates, writes captions in your chosen tone (professional, casual, or energetic), includes your location and city context, and adapts to your target audience.\n\nThe more detail you put into your brand description, the more personalised the output.`
  },
  {
    id: 22, cat: "content",
    q: "How can one prompt generate 365 posts? Do they repeat?",
    a: `The AI builds variety into the calendar automatically — rotating between post types (promotional, educational, festive, motivational, behind-the-scenes), mixing short and long captions, and cycling through different poster styles. Posts do not repeat.\n\nSeasonal content adds natural variety across the year. Each day gets a unique combination of image, caption, and hashtags.`
  },
  {
    id: 23, cat: "content",
    q: "Will there be a ShoutlyAI watermark on my posts?",
    a: `No. All content is clean, watermark-free, and ready to post under your brand name. You own the content completely.`
  },
  {
    id: 24, cat: "content",
    q: "Can I download and export my posts?",
    a: `Yes. Every generated post can be downloaded as a high-resolution image and the caption can be copied to clipboard.\n\nYou can also export your full monthly calendar as a PDF content plan. Downloaded posts can be used on any platform — including ones ShoutlyAI does not yet directly integrate with, like WhatsApp Status.`
  },
  {
    id: 25, cat: "content",
    q: "What if I don't like a generated caption or image?",
    a: `Every post has a Regenerate Caption button — click it and the AI writes a completely different caption in seconds. You can also swap the poster image from the library browser, which shows matching templates for your industry.`,
  },

  // ── ACCOUNT & DATA (3) ────────────────────────────────────────────────────
  {
    id: 26, cat: "account",
    q: "Is my data safe? What is your privacy and security policy?",
    a: `ShoutlyAI stores all data on AWS (Mumbai region ap-south-1) with enterprise-grade encryption at rest and in transit. We are compliant with India's DPDP Act 2023, GDPR (for EU users), and CCPA (for US users).\n\nWe never sell your data to third parties. Your social media credentials are encrypted and never stored in plain text. We conduct quarterly security audits.`,
    cta: { text: "Read our Privacy Policy →", href: "/privacy" }
  },
  {
    id: 27, cat: "account",
    q: "What happens to my data if I cancel my account?",
    a: `When you cancel, your account remains accessible until the end of your billing period. After that, you have 30 days to download or export all your content before it is permanently deleted.\n\nWe send 3 reminder emails before deletion. If you resubscribe within 30 days, all your data is fully restored. To request immediate deletion, email privacy@shoutlyai.com.`
  },
  {
    id: 28, cat: "account",
    q: "How do I connect my social media accounts?",
    a: `Go to Settings → Connected Accounts and click the platform you want to connect. You will be redirected to that platform's official OAuth login — ShoutlyAI never sees or stores your social media password.\n\nYou can connect, disconnect, or reconnect any account at any time. Disconnecting an account moves your scheduled posts to draft status — they can be rescheduled when you reconnect.`
  },
];

export const CATEGORIES: Category[] = [
  { id: "all",      label: "All",                 count: 28 },
  { id: "start",    label: "Getting Started",      count: 6  },
  { id: "billing",  label: "Pricing & Billing",    count: 7  },
  { id: "features", label: "Features & Platforms", count: 7  },
  { id: "content",  label: "Your Content",         count: 5  },
  { id: "account",  label: "Account & Data",       count: 3  },
];

// ── FAQ Schema markup
export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

// ── Global FAQ Components ─────────────────────────────────────────────────

export function FAQSection() {
  const [activeCat, setActiveCat]   = useState("all");
  const [openId, setOpenId]         = useState<number | null>(null);
  const [search, setSearch]         = useState("");

  const visible = useMemo(() => {
    return FAQS.filter((f: FAQItem) => {
      const catMatch = activeCat === "all" || f.cat === activeCat;
      const searchMatch = search === "" ||
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [activeCat, search]);

  const toggle = (id: number) => setOpenId(prev => prev === id ? null : id);

  return (
    <div style={{ fontFamily: "'Sora','DM Sans',system-ui,sans-serif", background: "#F8F9FD", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .faq-item { transition: border-color .15s; }
        .faq-icon { transition: transform .2s, background .15s, color .15s; }
        .cat-btn { transition: all .15s; font-family: inherit; }
        .faq-a-inner { white-space: pre-line; }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1B2A4A 60%,#0F2A5A 100%)", padding: "64px 24px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 50%,rgba(37,99,235,.16) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(124,58,237,.12) 0%,transparent 40%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "rgba(37,99,235,.2)", border: "1px solid rgba(37,99,235,.4)", color: "#93C5FD", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 18 }}>Help Centre</div>
          <h1 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, color: "#fff", marginBottom: 10, lineHeight: 1.15 }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Everything you need to know about ShoutlyAI.{" "}
            <a href="/contact" style={{ color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>Can't find your answer? Chat with us →</a>
          </p>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "12px 18px", maxWidth: 440, margin: "0 auto", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              type="text"
              placeholder="Search questions... e.g. 'cancel subscription' or 'UPI payment'"
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveCat("all"); }}
              style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", width: "100%", fontFamily: "inherit", background: "transparent" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "transparent", color: "#9CA3AF", fontSize: 16, cursor: "pointer", padding: 0 }}>✕</button>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Category tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {CATEGORIES.map((cat: Category) => (
            <button
              key={cat.id}
              className="cat-btn"
              onClick={() => { setActiveCat(cat.id); setSearch(""); setOpenId(null); }}
              style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: activeCat === cat.id ? "#2563EB" : "#fff",
                color: activeCat === cat.id ? "#fff" : "#6B7280",
                border: `1.5px solid ${activeCat === cat.id ? "#2563EB" : "#E5E7EB"}`,
              }}
            >
              {cat.label}
              <span style={{ marginLeft: 6, fontSize: 10, background: activeCat === cat.id ? "rgba(255,255,255,.25)" : "#F3F4F6", color: activeCat === cat.id ? "#fff" : "#6B7280", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results count */}
        {search && (
          <div style={{ fontSize: 12, color: "#6B7280", textAlign: "center", marginBottom: 16 }}>
            {visible.length} result{visible.length !== 1 ? "s" : ""} for <strong style={{ color: "#111827" }}>"{search}"</strong>
          </div>
        )}

        {/* FAQ Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visible.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              No questions found for <strong>"{search}"</strong><br />
              <a href="/contact" style={{ color: "#2563EB", fontWeight: 600 }}>Ask us directly →</a>
            </div>
          ) : visible.map((faq: FAQItem) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="faq-item"
                style={{ background: "#fff", border: `1.5px solid ${isOpen ? "#2563EB" : "#E5E7EB"}`, borderRadius: 12, overflow: "hidden" }}
              >
                {/* Question row */}
                <div
                  onClick={() => toggle(faq.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", cursor: "pointer", gap: 14 }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{faq.q}</div>
                  <div
                    className="faq-icon"
                    style={{ width: 22, height: 22, borderRadius: "50%", background: isOpen ? "#2563EB" : "#F3F4F6", color: isOpen ? "#fff" : "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </div>
                </div>

                {/* Answer */}
                {isOpen && (
                  <div style={{ padding: "0 18px 16px", borderTop: "1px solid #F3F4F6" }}>
                    <div className="faq-a-inner" style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.75, marginTop: 12 }}>
                      {faq.a}
                    </div>
                    {faq.cta && (
                      <a href={faq.cta.href} style={{ display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 700, color: "#2563EB", textDecoration: "none" }}>
                        {faq.cta.text}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Block */}
        <div style={{ marginTop: 48, background: "linear-gradient(135deg,#1B2A4A,#0F172A)", borderRadius: 20, padding: "40px 32px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "#60A5FA", textTransform: "uppercase", marginBottom: 10 }}>Still have questions?</div>
          <div style={{ fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 800, marginBottom: 8 }}>Our team is here to help</div>
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24, lineHeight: 1.6 }}>We typically respond within 2 hours on business days (Mon–Sat, 9am–7pm IST)</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>💬 Chat with us</button>
            <button style={{ background: "transparent", color: "#94A3B8", border: "1.5px solid rgba(255,255,255,.15)", borderRadius: 10, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>📧 Email support</button>
            <a href="/signup" style={{ display: "inline-block", background: "#059669", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>🚀 Start free trial</a>
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>No credit card required &nbsp;·&nbsp; 14 days free &nbsp;·&nbsp; Cancel anytime</div>
        </div>
      </div>
    </div>
  );
}

export function PricingFAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const pricingFAQs = FAQS.filter(f => [7, 2, 9, 8, 10, 11, 12, 13].includes(f.id));

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 60px" }}>
      <h2 style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: "#111827", textAlign: "center", marginBottom: 6 }}>Common questions about pricing</h2>
      <p style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 28 }}>Every question that might stop you from starting. Answered.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pricingFAQs.map((faq: FAQItem) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} style={{ background: "#fff", border: `1.5px solid ${isOpen ? "#2563EB" : "#E5E7EB"}`, borderRadius: 12, overflow: "hidden", fontFamily: "'Sora',system-ui,sans-serif" }}>
              <div onClick={() => setOpenId(prev => prev === faq.id ? null : faq.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px", cursor: "pointer", gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{faq.q}</div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: isOpen ? "#2563EB" : "#F3F4F6", color: isOpen ? "#fff" : "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none", transition: "all .2s" }}>+</div>
              </div>
              {isOpen && (
                <div style={{ padding: "0 18px 14px", borderTop: "1px solid #F3F4F6" }}>
                  <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.75, marginTop: 10, whiteSpace: "pre-line" }}>{faq.a}</div>
                  {faq.cta && <a href={faq.cta.href} style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 700, color: "#2563EB", textDecoration: "none" }}>{faq.cta.text}</a>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomepageFAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const homeFAQs = FAQS.filter(f => [1, 2, 3, 4, 16].includes(f.id));

  return (
    <div style={{ background: "#F8F9FD", padding: "64px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Sora',system-ui,sans-serif", fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: "#111827", textAlign: "center", marginBottom: 36 }}>Everything you need to know</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {homeFAQs.map((faq: FAQItem) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} style={{ background: "#fff", border: `1.5px solid ${isOpen ? "#2563EB" : "#E5E7EB"}`, borderRadius: 12, overflow: "hidden", fontFamily: "'Sora',system-ui,sans-serif" }}>
                <div onClick={() => setOpenId(prev => prev === faq.id ? null : faq.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 18px", cursor: "pointer", gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{faq.q}</div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: isOpen ? "#2563EB" : "#F3F4F6", color: isOpen ? "#fff" : "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none", transition: "all .2s" }}>+</div>
                </div>
                {isOpen && (
                  <div style={{ padding: "0 18px 14px", borderTop: "1px solid #F3F4F6" }}>
                    <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.75, marginTop: 10, whiteSpace: "pre-line" }}>{faq.a}</div>
                    {faq.cta && <a href={faq.cta.href} style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 700, color: "#2563EB", textDecoration: "none" }}>{faq.cta.text}</a>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/help-center" style={{ display: "inline-block", border: "1.5px solid #2563EB", color: "#2563EB", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Sora',system-ui,sans-serif" }}>View all FAQs →</a>
        </div>
      </div>
    </div>
  );
}
