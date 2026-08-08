import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  extractDocumentMetadata,
  extractStaticHtml,
  hasPublicHtml,
  readPublicHtml,
} from "../lib/staticHtmlPage";

const FILE_NAME = "shoutlyai-why-shoutly-ai.html";
const SCOPE_CLASS = "why-shoutly-ai-content";

export async function generateMetadata(): Promise<Metadata> {
  if (!hasPublicHtml(FILE_NAME)) {
    return {};
  }

  const rawHtml = readPublicHtml(FILE_NAME);
  const pageMeta = extractDocumentMetadata(rawHtml);

  return {
    title: pageMeta.title,
    description: pageMeta.description,
  };
}

export default function WhyShoutlyAiPage() {
  if (!hasPublicHtml(FILE_NAME)) {
    notFound();
  }

  const rawHtml = readPublicHtml(FILE_NAME);
  const { bodyHtml, pageStyles, inlineScripts } = extractStaticHtml(rawHtml, SCOPE_CLASS);

  return (
    <main className="bg-white text-slate-900">
      {pageStyles ? <style dangerouslySetInnerHTML={{ __html: pageStyles }} /> : null}
      <div className={SCOPE_CLASS} dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {inlineScripts.map((scriptContent, index) => (
        <Script
          key={`why-shoutly-ai-inline-script-${index}`}
          id={`why-shoutly-ai-inline-script-${index}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
      ))}
    </main>
  );
}
