import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Buffer vs Shoutly AI: Which Social Media Platform Is Better in 2026?",
  description:
    "Compare Buffer and Shoutly AI honestly across scheduling, AI content creation, workflow speed, and team fit.",
};

const verdict = [
  {
    title: "Choose Buffer if",
    subtitle: "You already have content ready",
    points: [
      "You mainly need scheduling, queue management, and publishing",
      "Your team already writes captions and produces creatives elsewhere",
      "You want a familiar lightweight publishing workflow",
      "You are optimizing for simple manual scheduling",
    ],
  },
  {
    title: "Choose Shoutly AI if",
    subtitle: "You need content creation and scheduling together",
    points: [
      "You want AI-generated posts, themes, and campaign structures",
      "You need one brief to turn into a month of content",
      "Your team wants faster execution with fewer tools and handoffs",
      "You want branded creative direction alongside scheduling",
    ],
  },
];

const rows = [
  ["AI content generation", "Limited", "Built-in"],
  ["Post scheduling", "Yes", "Yes"],
  ["Caption variants", "Manual", "AI-generated"],
  ["Campaign planning", "Basic queue planning", "Structured monthly workflow"],
  ["Visual post direction", "External tools needed", "Included in workflow"],
  ["Team fit", "Scheduler-first teams", "Lean teams that need speed"],
  ["Best use case", "Publish what you already made", "Create and publish from one system"],
];

const angles = [
  {
    title: "Where Buffer wins",
    body: "Buffer is straightforward when the content is already written and the main problem is publishing consistently to multiple accounts.",
  },
  {
    title: "Where Shoutly AI wins",
    body: "Shoutly AI is stronger when the bottleneck is content generation, campaign ideation, and turning one input into a full schedule quickly.",
  },
  {
    title: "What the real trade-off is",
    body: "This is not just scheduler vs scheduler. It is manual content assembly versus an AI-first workflow that compresses planning, writing, and organization.",
  },
];

const faqs = [
  {
    q: "Is Buffer cheaper?",
    a: "It can be, especially when your team only needs scheduling. But the comparison changes when you count the external time and tools needed to create content separately.",
  },
  {
    q: "Does Shoutly AI replace a scheduler?",
    a: "Yes. It includes scheduling, but the bigger difference is that it also helps generate the content you want to schedule.",
  },
  {
    q: "Who should use Shoutly AI instead of Buffer?",
    a: "Small marketing teams, founders, agencies, and local businesses that need to create content faster with fewer approvals and fewer disconnected tools.",
  },
];

export default function BufferVsShoutlyPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-gradient-to-br from-slate-50 via-white to-orange-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">Compare</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Buffer vs Shoutly AI
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mb-10">
            Buffer schedules the content you make. Shoutly AI helps make the content first, then
            schedule it. That is the real decision point behind this comparison.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {verdict.map((item, index) => (
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
          Comparison summary
        </p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
          A scheduler-first tool versus an AI-first publishing workflow
        </h2>
        <div className="grid gap-4 md:grid-cols-3 mb-14">
          {angles.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Feature</th>
                <th className="text-left px-5 py-3 font-semibold">Buffer</th>
                <th className="text-left px-5 py-3 font-semibold">Shoutly AI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([feature, buffer, shoutly]) => (
                <tr key={feature} className="border-t border-slate-200">
                  <td className="px-5 py-4 font-medium text-slate-900">{feature}</td>
                  <td className="px-5 py-4 text-slate-600">{buffer}</td>
                  <td className="px-5 py-4 text-slate-600">{shoutly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Pick the workflow that fits your team</h2>
            <p className="text-slate-200 mb-6 max-w-2xl">
              If your content pipeline already exists and you only need a place to queue posts,
              Buffer can still fit. If your actual constraint is the work required before anything is
              ready to publish, Shoutly AI solves the earlier and more expensive bottleneck.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors font-semibold"
              >
                Start free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-100 transition-colors font-semibold"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">FAQ</p>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-10">
          Frequently asked questions about Buffer vs Shoutly AI
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-2xl border border-slate-200 p-6 bg-white">
              <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
