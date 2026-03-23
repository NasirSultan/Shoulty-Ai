import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Industry Solutions | Shoutly AI",
  description:
    "Explore AI social media automation solutions for restaurants, fitness studios, real estate, and more.",
  alternates: {
    canonical: "https://shoutlyai.com/for",
  },
};

const pages = [
  {
    href: "/for/restaurants",
    title: "Restaurants",
    description: "Generate daily campaigns, offers, and festive creatives.",
  },
  {
    href: "/for/fitness-studios",
    title: "Fitness Studios",
    description: "Publish high-energy content that drives memberships and leads.",
  },
  {
    href: "/for/real-estate",
    title: "Real Estate",
    description: "Scale listing and market content for consistent lead flow.",
  },
];

export default function IndustryIndexPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
          Industry Solutions
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
          AI Social Media by Industry
        </h1>
        <p className="text-lg text-slate-600 mb-10">
          Choose your industry and launch an AI-powered social media workflow built for your audience.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:border-orange-400 hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-bold mb-2">{page.title}</h2>
              <p className="text-slate-600">{page.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
