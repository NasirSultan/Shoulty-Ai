"use client";

import { useState } from "react";

// ── FAQ Data — 28 questions, 5 categories ──────────────────────────────────
const FAQS = [
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
    a: `Yes — we offer a 14-day free trial with full access to all features. No credit card required. You get to experience the full power of ShoutlyAI: AI-generated posts, scheduling across 10 platforms, and unified analytics. Upgrade to the paid plan when you're ready.`,
    cta: { text: "Start free →", href: "/signup" }
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

export function FAQ() {
    const [openId, setOpenId] = useState<number | null>(null);
    const homeFAQs = FAQS.filter(f => [1, 2, 3, 4, 16, 21, 18, 23, 17, 26].includes(f.id));

    return (
        <section className="py-24 bg-[#F8F9FD]">
            <div className="max-w-3xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Sora', sans-serif" }}>Everything you need to know</h2>
                    <p className="mt-4 text-gray-600">
                        Still curious? <a href="/help-center" className="text-blue-600 font-semibold hover:underline">View all 28 FAQs →</a>
                    </p>
                </div>
                <div className="space-y-3">
                    {homeFAQs.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                            <div key={faq.id} className={`bg-white border ${isOpen ? "border-orange-500" : "border-gray-200"} rounded-xl overflow-hidden transition-all duration-200`}>
                                <button
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                                >
                                    <span className="font-semibold text-gray-900 leading-relaxed">{faq.q}</span>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${isOpen ? "bg-orange-500 text-white rotate-45" : "bg-gray-100 text-gray-500"}`}>
                                        +
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 border-t border-gray-100">
                                        <div className="pt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                            {faq.a}
                                        </div>
                                        {faq.cta && (
                                            <a href={faq.cta.href} className="inline-block mt-3 text-sm font-bold text-orange-500 hover:underline">
                                                {faq.cta.text}
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-12">
                    <a 
                        href="/help-center" 
                        className="inline-block border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition"
                    >
                        View all 28 FAQs →
                    </a>
                </div>
            </div>
        </section>
    );
}

const testimonials = [
    {
        quote: "Shoutly has completely saved my sanity. I used to spend Sundays stressed about content for my online store. Now it's all done in 10 minutes.",
        author: "Arjun Kapur",
        role: "E-commerce Founder, Mumbai"
    },
    {
        quote: "The brand voice feature is incredible. It actually sounds like me, not a robot. My real estate agency's engagement has doubled.",
        author: "Vikram Malhotra",
        role: "Real Estate Consultant, Delhi"
    },
    {
        quote: "I manage 5 clients for my agency and Shoutly is the only reason I can sleep at night. Best investment for Indian marketers.",
        author: "Priya Iyer",
        role: "Agency Founder, Bangalore"
    }
];

function TestimonialAvatar() {
    return (
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
            </svg>
        </div>
    );
}

export function Testimonials() {
    return (
        <section className="py-24 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">Loved by Creators</h2>
                    <p className="mt-4 text-gray-600">Don&apos;t just take our word for it.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-1 mb-6 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>
                            <p className="text-lg text-gray-700 mb-6 italic">&quot;{t.quote}&quot;</p>
                            <div className="flex items-center gap-4">
                                <TestimonialAvatar />
                                <div>
                                    <h4 className="font-bold text-gray-900">{t.author}</h4>
                                    <p className="text-sm text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
