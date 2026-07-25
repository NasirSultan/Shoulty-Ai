import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Script from "next/script";
import { notFound } from "next/navigation";

const SOLUTION_META: Record<string, { title: string; description: string }> = {
  agencies: {
    title: "AI Social Media Content for Agencies | Shoutly AI",
    description:
      "Scale multi-client campaign creation, approvals, and publishing with AI-powered workflows built for agencies.",
  },
  enterprise: {
    title: "AI Social Media Content for Enterprise | Shoutly AI",
    description:
      "Coordinate enterprise social media content with brand-safe AI generation, approvals, and scheduling at scale.",
  },
  healthcare: {
    title: "AI Social Media Content for Healthcare | Shoutly AI",
    description:
      "Create compliant healthcare social media campaigns faster with AI-assisted planning, captions, and scheduling.",
  },
  "local-businesses": {
    title: "AI Social Media Content for Local Businesses | Shoutly AI",
    description:
      "Generate and schedule local business social content in minutes using one AI-first workflow.",
  },
  "professional-services": {
    title: "AI Social Media Content for Professional Services | Shoutly AI",
    description:
      "Help professional service firms publish consistent, high-quality social content with less manual effort.",
  },
  restaurants: {
    title: "AI Social Media Content for Restaurants | Shoutly AI",
    description:
      "Plan, generate, and schedule restaurant social posts, offers, and campaigns with AI in one place.",
  },
  retail: {
    title: "AI Social Media Content for Retail | Shoutly AI",
    description:
      "Launch retail campaigns and product-focused social content faster with AI-assisted creation and scheduling.",
  },
  startups: {
    title: "AI Social Media Content for Startups | Shoutly AI",
    description:
      "Move faster from product updates to social publishing with startup-focused AI content and scheduling tools.",
  },
};

function listSolutionSlugs(): string[] {
  const directoryPath = path.join(process.cwd(), "app", "solutions");
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name.replace(/\.html$/i, ""))
    .sort();
}

function isSolutionSlug(value: string): boolean {
  return listSolutionSlugs().includes(value);
}

function getHtmlPath(slug: string) {
  return path.join(process.cwd(), "app", "solutions", `${slug}.html`);
}

function extractDocumentMetadata(rawHtml: string) {
  const titleMatch = rawHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = rawHtml.match(
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i,
  );

  return {
    title: titleMatch?.[1]?.trim(),
    description: descriptionMatch?.[1]?.trim(),
  };
}

function extractHtml(rawHtml: string) {
  const styleMatch = rawHtml.match(/<style>([\s\S]*?)<\/style>/i);
  let pageStyles = styleMatch?.[1] ?? "";

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyHtml = bodyMatch?.[1] ?? "";

  // Keep shared app chrome in control.
  bodyHtml = bodyHtml.replace(/<header[\s\S]*?<\/header>/i, "");
  bodyHtml = bodyHtml.replace(/<footer[\s\S]*?<\/footer>/i, "");

  // Keep links inside the app instead of bouncing to production URLs.
  bodyHtml = bodyHtml.replace(/https:\/\/shoutlyai\.com\//gi, "/");

  const inlineScripts = Array.from(bodyHtml.matchAll(/<script>([\s\S]*?)<\/script>/gi)).map((m) => m[1]);

  bodyHtml = bodyHtml.replace(/<script>[\s\S]*?<\/script>/gi, "");
  bodyHtml = bodyHtml.replace(/<main[^>]*>/i, "");
  bodyHtml = bodyHtml.replace(/<\/main>\s*$/i, "");

  // Scope possible global reset rules from source pages.
  pageStyles = pageStyles.replace(/\*\,\*::before\,\*::after\{[\s\S]*?\}/i, ".solutions-content *, .solutions-content *::before, .solutions-content *::after{box-sizing:border-box;margin:0;padding:0}");
  pageStyles = pageStyles.replace(/html\{[\s\S]*?\}/i, ".solutions-content{font-size:16px;scroll-behavior:smooth;-webkit-text-size-adjust:100%}");
  pageStyles = pageStyles.replace(/body\{[\s\S]*?\}/i, ".solutions-content{font-family:Inter,system-ui,sans-serif;background:#fff;color:#0f172a;-webkit-font-smoothing:antialiased;line-height:1.6;overflow-x:hidden}");
  pageStyles = pageStyles.replace(/img\{[\s\S]*?\}/i, ".solutions-content img{display:block;max-width:100%;height:auto}");
  pageStyles = pageStyles.replace(/a\{[\s\S]*?\}/i, ".solutions-content a{color:inherit;text-decoration:none}");
  pageStyles = pageStyles.replace(/button\{[\s\S]*?\}/i, ".solutions-content button{font-family:inherit}");

  return {
    bodyHtml,
    pageStyles,
    inlineScripts,
  };
}

export async function generateStaticParams() {
  return listSolutionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isSolutionSlug(slug)) {
    return {};
  }

  const htmlPath = getHtmlPath(slug);
  const rawHtml = fs.readFileSync(htmlPath, "utf8");
  const pageMeta = extractDocumentMetadata(rawHtml);
  const mappedMeta = SOLUTION_META[slug];

  return {
    title: mappedMeta?.title ?? pageMeta.title,
    description: mappedMeta?.description ?? pageMeta.description,
  };
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!isSolutionSlug(slug)) {
    notFound();
  }

  const htmlPath = getHtmlPath(slug);
  if (!fs.existsSync(htmlPath)) {
    notFound();
  }

  const rawHtml = fs.readFileSync(htmlPath, "utf8");
  const { bodyHtml, pageStyles, inlineScripts } = extractHtml(rawHtml);

  return (
    <main className="bg-white text-slate-900">
      {pageStyles ? <style dangerouslySetInnerHTML={{ __html: pageStyles }} /> : null}
      <div className="solutions-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {inlineScripts.map((scriptContent, index) => (
        <Script
          key={`solutions-inline-script-${slug}-${index}`}
          id={`solutions-inline-script-${slug}-${index}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
      ))}
    </main>
  );
}
