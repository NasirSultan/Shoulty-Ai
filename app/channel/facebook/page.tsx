import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facebook Post Generator & Scheduler — AI-Powered | Shoutly AI",
  description:
    "Generate, schedule and auto-publish Facebook posts, reels, carousels and images with AI. Save 20+ hours/week with Shoutly AI.",
};

const stats = [
  { value: "41k+", label: "Businesses using AI workflows" },
  { value: "365", label: "Days of content from one brief" },
  { value: "20+ hrs", label: "Saved each week on planning" },
  { value: "1", label: "Workflow for copy, visuals, and scheduling" },
];

const painPoints = [
  {
    title: "Blank-page publishing pressure",
    body: "Teams lose time deciding what to post, how to position it, and how to adapt it for Facebook feed behavior.",
  },
  {
    title: "Inconsistent posting",
    body: "Momentum drops when campaign ideas, captions, and graphics depend on manual prep every day.",
  },
  {
    title: "Weak brand consistency",
    body: "Visuals, captions, and offers drift when content is assembled ad hoc across multiple contributors.",
  },
  {
    title: "Manual scheduling overhead",
    body: "Even when copy is ready, selecting times, organizing campaigns, and keeping pages active becomes operational drag.",
  },
];

const solutions = [
  {
    tag: "Creation",
    title: "Facebook post generator",
    body: "Turn one business prompt into post ideas, captions, offers, educational posts, and engagement content tailored for Facebook audiences.",
  },
  {
    tag: "Visuals",
    title: "Image and creative direction",
    body: "Generate branded concepts for banners, quote cards, festive creatives, testimonials, and promotional posts without chasing a designer.",
  },
  {
    tag: "Video",
    title: "Reels and short-form ideas",
    body: "Draft hooks, reel outlines, and supporting captions built for scroll-stopping Facebook video content.",
  },
  {
    tag: "Planning",
    title: "Campaign calendar",
    body: "Organize weekly launches, seasonal offers, and recurring content pillars into a schedule your team can actually maintain.",
  },
  {
    tag: "Publishing",
    title: "Auto scheduling",
    body: "Queue posts at the right cadence and keep your page active without needing a separate content spreadsheet and scheduler.",
  },
  {
    tag: "Operations",
    title: "Multi-page workflow",
    body: "Manage page-specific messaging, approvals, and publishing from one system when you support multiple brands or locations.",
  },
];

const features = [
  ["Facebook post generation", "Generate post ideas, captions, offers, proof posts, and educational content from one brief."],
  ["Caption variants", "Create tone-specific caption options for promotions, reels, launches, and day-to-day engagement."],
  ["Branded creative workflow", "Translate copy into visual directions for image posts, carousels, and promotional graphics."],
  ["Reel content support", "Draft reel hooks, sequence ideas, cover text, and CTA copy for short-form content."],
  ["Scheduling calendar", "Organize weekly and monthly campaigns with publishing slots that reduce manual coordination."],
  ["Analytics feedback loop", "Review what performed and feed those insights back into your next content batch."],
];

const workflow = [
  "Describe your business, offer, and audience once.",
  "Generate Facebook-ready themes, captions, and campaigns.",
  "Choose or refine creative directions and post types.",
  "Build a calendar for feed posts, reels, and promotions.",
  "Schedule content for the times your audience is active.",
  "Publish consistently and improve using engagement signals.",
];

const contentTypes = [
  "Promotional offers",
  "Educational posts",
  "Testimonial creatives",
  "Product launches",
  "Event announcements",
  "Festival campaigns",
  "FAQ content",
  "Carousel sequences",
  "Reel ideas",
  "Community posts",
];

const faqs = [
  {
    q: "Can Shoutly AI schedule Facebook posts automatically?",
    a: "Yes. You can generate posts and queue them into a publishing calendar so your Facebook page stays active without manual day-by-day scheduling.",
  },
  {
    q: "Can I manage multiple Facebook pages?",
    a: "Yes. Shoutly AI is designed for teams and operators managing one or more brands, locations, or client pages from a central workflow.",
  },
  {
    q: "Does it support Facebook reels?",
    a: "Yes. You can generate reel concepts, short hooks, supporting captions, and campaign angles for short-form Facebook content.",
  },
  {
    q: "Can I create a full year of content?",
    a: "Yes. The platform is built to turn a business brief into long-range content planning, including 365-day content direction and campaign batching.",
  },
];

export default function FacebookChannelPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-gradient-to-br from-orange-50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
            By Channel
          </p>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_.8fr] items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                Facebook Post Generator & Scheduler
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mb-8">
                Generate, plan, and schedule Facebook posts, reels, carousels, offers, and branded
                campaigns from one workflow. Shoutly AI helps small teams publish faster without
                sacrificing quality or consistency.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/sign-up" className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors">
                  Start free trial
                </Link>
                <Link href="/pricing" className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-300 hover:border-orange-300 text-slate-800 font-semibold transition-colors">
                  View pricing
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
                What you get
              </p>
              <div className="space-y-4">
                {features.slice(0, 4).map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <h2 className="font-semibold mb-1">{title}</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
          Why teams switch
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
          The real bottleneck is not posting. It is creating the right content fast enough.
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mb-10 leading-relaxed">
          Facebook performance depends on consistent campaigns, recognizable branding, and clear
          offers. Shoutly AI reduces content friction across creation, visual planning, and scheduling.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {painPoints.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
            Core workflow
          </p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
            Everything the original page promised, now in a native app route
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-14">
            {solutions.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-3">
                  {item.tag}
                </p>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">From brief to full content calendar</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {workflow.map((step, index) => (
                <div key={step} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="text-orange-300 text-sm font-semibold mb-2">Step {index + 1}</div>
                  <p className="text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
          Content output
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6">
          Content types you can generate for Facebook
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-16">
          {contentTypes.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 px-4 py-4 text-sm font-medium bg-white">
              {item}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Capability</th>
                <th className="px-5 py-3 text-left font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody>
              {features.map(([title, description]) => (
                <tr key={title} className="border-t border-slate-200">
                  <td className="px-5 py-4 font-medium text-slate-900">{title}</td>
                  <td className="px-5 py-4 text-slate-600">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
            Frequently asked questions about Facebook content automation
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
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Create and schedule your next month of Facebook content
          </h2>
          <p className="text-orange-50 text-lg max-w-2xl mb-8">
            This restores the long-form sales content that was lost when the HTML page was replaced,
            while keeping it as a maintainable native Next.js route.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/sign-up" className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-orange-600 font-semibold">
              Start free
            </Link>
            <Link href="/contact-us" className="inline-flex items-center px-6 py-3 rounded-xl border border-orange-200 text-white font-semibold">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
