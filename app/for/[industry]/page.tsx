import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const baseUrl = "https://shoutlyai.com";

type IndustryPage = {
  slug: string;
  name: string;
  keyword: string;
  title: string;
  description: string;
  hero: string;
  intro: string;
  benefits: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const industries: IndustryPage[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    keyword: "social media for restaurants",
    title: "AI Social Media for Restaurants | Shoutly AI",
    description:
      "Generate and schedule restaurant social media posts, reels, captions, and festival creatives in minutes with Shoutly AI.",
    hero: "AI Social Media Content for Restaurants",
    intro:
      "From lunch offers to festive campaigns, restaurants need daily content that drives bookings and repeat visits. Shoutly AI helps restaurant teams create, brand, and schedule months of posts in one workflow.",
    benefits: [
      "Generate weekly campaigns for dine-in, takeout, and delivery",
      "Create festival and seasonal post sets in minutes",
      "Auto-adapt captions for Instagram, Facebook, and Shorts",
      "Keep a full monthly calendar ready without agency overhead",
    ],
    faqs: [
      {
        question: "Can I generate festival posts for my city audience?",
        answer:
          "Yes. You can generate location-aware campaign ideas and local-festival creatives for your restaurant audience.",
      },
      {
        question: "Does Shoutly AI support reels and static posts?",
        answer:
          "Yes. You can generate both reels concepts and static post copy, then schedule them in your content calendar.",
      },
    ],
  },
  {
    slug: "fitness-studios",
    name: "Fitness Studios",
    keyword: "social media for fitness studios",
    title: "AI Social Media for Fitness Studios | Shoutly AI",
    description:
      "Create high-converting social media content for gyms and fitness studios with AI-generated captions, reels, and monthly plans.",
    hero: "AI Social Media Content for Fitness Studios",
    intro:
      "Fitness brands need consistency to win attention. Shoutly AI helps gyms, trainers, and studio owners create daily high-energy content across platforms without spending hours every week.",
    benefits: [
      "Publish motivational and educational content every day",
      "Generate challenge campaigns and member testimonial posts",
      "Create platform-ready reels scripts and caption variants",
      "Plan monthly launch and offer promotions in one place",
    ],
    faqs: [
      {
        question: "Can I customize content for my training style?",
        answer:
          "Yes. Add your brand tone and niche to generate content aligned with your studio's voice and offers.",
      },
      {
        question: "Will this work for personal trainers too?",
        answer:
          "Absolutely. Solo coaches and personal trainers can use the same workflow to publish consistently and grow leads.",
      },
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    keyword: "social media for real estate",
    title: "AI Social Media for Real Estate | Shoutly AI",
    description:
      "Scale listing and lead-gen content with AI social media automation for real estate agents, teams, and brokerages.",
    hero: "AI Social Media Content for Real Estate",
    intro:
      "Real estate marketing requires high-frequency posting across property showcases, market updates, and trust-building content. Shoutly AI helps agents create and schedule a complete content pipeline quickly.",
    benefits: [
      "Generate listing highlight posts and neighborhood spotlights",
      "Create educational market update posts in seconds",
      "Build trust with testimonial and authority-led content",
      "Maintain a full content calendar while focusing on closings",
    ],
    faqs: [
      {
        question: "Can I create content for luxury and residential segments?",
        answer:
          "Yes. You can tailor content outputs for different segments, property types, and audience intent.",
      },
      {
        question: "Can teams use this for multiple agents?",
        answer:
          "Yes. Brokerages and teams can plan content by campaign and keep publishing consistency across agent profiles.",
      },
    ],
  },
];

function getIndustryBySlug(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

export function generateStaticParams() {
  return industries.map((industry) => ({ industry: industry.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Metadata {
  const page = getIndustryBySlug(params.industry);

  if (!page) {
    return {
      title: "Industry Page Not Found | Shoutly AI",
      description: "The requested industry page could not be found.",
    };
  }

  const pageUrl = `${baseUrl}/for/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [page.keyword, "AI social media tool", "social media automation"],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: pageUrl,
      siteName: "Shoutly AI",
      type: "website",
    },
  };
}

export default function IndustryPage({
  params,
}: {
  params: { industry: string };
}) {
  const page = getIndustryBySlug(params.industry);

  if (!page) {
    notFound();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="bg-white text-slate-900">
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-4">
          Industry Solutions
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
          {page.hero}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-10">{page.intro}</p>

        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {page.benefits.map((benefit) => (
            <div
              key={benefit}
              className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
            >
              <p className="font-medium text-slate-800">{benefit}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-10 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Generate 365 days of {page.name.toLowerCase()} content in minutes
          </h2>
          <p className="text-slate-200 mb-6">
            Build your monthly posting plan, captions, and visual ideas from one brief.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors font-semibold"
          >
            Start free
          </Link>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {page.faqs.map((faq) => (
            <article key={faq.question} className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}
