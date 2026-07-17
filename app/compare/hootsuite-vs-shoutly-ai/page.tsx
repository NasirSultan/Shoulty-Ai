import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hootsuite vs Shoutly AI: Which Should You Buy in 2026?",
  description:
    "Compare Hootsuite and Shoutly AI across enterprise scheduling, AI content creation, team workflow, and time to publish.",
};

const summaryCards = [
  {
    title: "Buy Hootsuite if",
    subtitle: "You need governance and established enterprise workflows",
    points: [
      "You need mature enterprise scheduling processes",
      "Your team already has writers, designers, and approvers in place",
      "You are optimizing around operational controls and structured handoffs",
      "Content creation happens outside the social platform",
    ],
  },
  {
    title: "Buy Shoutly AI if",
    subtitle: "You want faster creation-to-publish execution",
    points: [
      "You need AI-assisted post generation and campaign planning",
      "You want to reduce the number of tools in the workflow",
      "Your team is lean and needs speed more than process overhead",
      "You want one prompt to become a usable content calendar",
    ],
  },
];

const highlights = [
  {
    title: "Creation",
    hootsuite: "Content is prepared elsewhere and brought in for publishing",
    shoutly: "AI-assisted creation happens inside the workflow",
  },
  {
    title: "Scheduling",
    hootsuite: "Strong traditional scheduling and approvals",
    shoutly: "Scheduling plus content planning in the same system",
  },
  {
    title: "Team fit",
    hootsuite: "Larger teams with established functions",
    shoutly: "Founders, local teams, agencies, and lean marketers",
  },
  {
    title: "Time to publish",
    hootsuite: "Depends on manual prep across tools",
    shoutly: "Compressed from brief to scheduled calendar",
  },
];

const faqs = [
  {
    q: "Does Hootsuite still make sense?",
    a: "Yes, especially for larger organizations that already have content operations and mainly need publishing controls and workflow structure.",
  },
  {
    q: "Why would a team choose Shoutly AI instead?",
    a: "Because the main bottleneck is often not scheduling. It is generating enough good content quickly enough to keep channels active.",
  },
  {
    q: "Is this comparison mainly about price?",
    a: "Not really. The more important trade-off is enterprise process depth versus AI-assisted speed from ideation to publishing.",
  },
];

export default function HootsuiteVsShoutlyPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-gradient-to-br from-orange-50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">Compare</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Hootsuite vs Shoutly AI
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mb-10">
            Hootsuite is built around mature scheduling and team operations. Shoutly AI is built to
            reduce the work required before you even have something ready to schedule.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {summaryCards.map((item, index) => (
              <div
                key={item.title}
                className={index === 0
                  ? "rounded-3xl border border-slate-200 bg-white p-8"
                  : "rounded-3xl border border-orange-200 bg-orange-50 p-8"}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-3">
                  {item.title}
                </p>
                <h2 className="text-2xl font-bold mb-2">{item.subtitle}</h2>
                <ul className="space-y-3 text-slate-600">
                  {item.points.map((point) => (
                    <li key={point} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
          Side-by-side
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
          Different tools for different bottlenecks
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {highlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 p-5">
              <h2 className="text-lg font-semibold mb-3">{item.title}</h2>
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-semibold text-slate-800">Hootsuite:</span> {item.hootsuite}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">Shoutly AI:</span> {item.shoutly}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">The short version</h2>
          <ul className="space-y-2 text-slate-200 mb-6">
            <li>Choose Hootsuite when you need structured enterprise publishing operations.</li>
            <li>Choose Shoutly AI when you need to create and schedule content faster with a smaller team.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors font-semibold"
            >
              Try Shoutly AI
            </Link>
            <Link href="/contact-us" className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-600 text-white font-semibold">
              Talk to our team
            </Link>
          </div>
        </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold mb-2">Need a side-by-side demo?</h2>
          <p className="text-slate-600 mb-4">
            See how quickly your team can go from one brief to a full content calendar.
          </p>
          <Link href="/contact-us" className="text-orange-600 font-semibold hover:text-orange-700">
            Talk to our team {"->"}
          </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">FAQ</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
          Frequently asked questions about Hootsuite vs Shoutly AI
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
