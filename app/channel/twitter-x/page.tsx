import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X (Twitter) Post Generator & Scheduler — AI-Powered | Shoutly AI",
  description:
    "Generate tweets, threads, replies and X posts with AI. Auto-schedule and publish daily with Shoutly AI.",
};

const stats = [
  { value: "280", label: "Characters optimized per post" },
  { value: "10", label: "Networks supported in one workflow" },
  { value: "365", label: "Days of X content from one brief" },
  { value: "15+ hrs", label: "Saved each week on writing and planning" },
];

const features = [
  "Single-post ideas for daily visibility",
  "Multi-tweet thread generation with opening hooks",
  "Offer and launch copy tuned for short-form attention",
  "Thought-leadership, commentary, and engagement prompts",
  "Weekly scheduling queues for consistent publishing",
  "Performance-informed iteration across themes and tones",
];

const outputs = [
  "Thought-leadership threads",
  "Launch announcements",
  "Quick educational tweets",
  "Poll and conversation starters",
  "Founder commentary",
  "Brand voice replies and follow-ups",
  "Trend reactions",
  "Community engagement prompts",
  "Offer-led CTAs",
  "Repurposed blog snippets",
];

const sections = [
  {
    title: "Write less, ship more",
    body: "Shoutly AI compresses ideation, draft writing, and thread structuring into a single workflow so you can stay active on X without writing every post from scratch.",
  },
  {
    title: "Built for short-form attention",
    body: "Hooks, pacing, and content structure are tuned for a platform where first-line clarity determines whether people keep reading or move on.",
  },
  {
    title: "Thread-ready workflows",
    body: "Turn one topic into a multi-post thread with a strong opener, supporting points, and a closing CTA that still sounds like your brand.",
  },
  {
    title: "Queue a full week at once",
    body: "Plan recurring themes, stagger thought leadership, and keep your audience warm without manually assembling a content plan every day.",
  },
];

const faqs = [
  {
    q: "Can Shoutly AI write Twitter threads?",
    a: "Yes. It can generate hook-first thread structures, supporting tweet sequences, and closing CTAs aligned to the 280-character format.",
  },
  {
    q: "Can it auto-publish to X?",
    a: "Yes. You can prepare posts and push them into a scheduling workflow for consistent daily publishing.",
  },
  {
    q: "Does it work for brands as well as founders?",
    a: "Yes. It supports brand campaigns, founder commentary, product launches, educational content, and engagement-first posts.",
  },
  {
    q: "Can I generate a year of X content with one prompt?",
    a: "Yes. Shoutly AI is built to take a niche, voice, and offer brief and expand it into long-range publishing direction.",
  },
];

export default function TwitterXChannelPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-gradient-to-br from-slate-100 via-white to-orange-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
            By Channel
          </p>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                X (Twitter) Post Generator & Scheduler
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mb-8">
                Generate tweets, threads, replies, and daily content queues with AI. Shoutly AI helps
                businesses and personal brands stay consistent on X without spending hours writing
                every post manually.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/sign-up" className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors">
                  Start free trial
                </Link>
                <Link href="/pricing" className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-300 hover:border-orange-300 text-slate-800 font-semibold transition-colors">
                  See plans
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 text-white p-8 shadow-xl">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-300 mb-3">
                Publishing outputs
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {outputs.slice(0, 6).map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
          Why X needs a different workflow
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
          Short-form posting rewards clarity, speed, and consistency.
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
            Core capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
            The original X landing page covered writing, threading, and scheduling. This route keeps that scope.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-14">
            {features.map((feature) => (
              <div key={feature} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="font-medium text-slate-800">{feature}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Turn one topic into a full thread</h2>
            <p className="text-slate-200 max-w-2xl mb-8">
              Draft a topic once and expand it into a multi-post thread, short supporting posts,
              repurposed commentary, and a weekly queue that keeps your brand active.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Start with a sharp opening line that earns the next click.",
                "Expand into structured points that stay readable and concise.",
                "Close with a clear prompt, offer, or next step for the audience.",
              ].map((step, index) => (
                <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="text-orange-300 text-sm font-semibold mb-2">Part {index + 1}</div>
                  <p className="text-sm text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">Output library</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">What you can publish on X</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-16">
          {outputs.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-medium bg-white">
              {item}
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-orange-50 border border-orange-200 p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Built for daily consistency</h2>
          <p className="text-slate-700 max-w-3xl leading-relaxed">
            This restores the long-form positioning from the deleted HTML page while keeping the route
            native to the app and easy to maintain.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
            Frequently asked questions about X publishing with AI
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Build your next week of X content in one sitting
          </h2>
          <p className="text-slate-200 text-lg max-w-2xl mb-8">
            Keep the original intent of the deleted HTML page, but run it as a maintainable app route.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/sign-up" className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors">
              Try Shoutly AI
            </Link>
            <Link href="/contact-us" className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-600 text-white font-semibold">
              Talk to our team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
