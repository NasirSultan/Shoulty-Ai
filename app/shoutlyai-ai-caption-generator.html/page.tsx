import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import {
  extractDocumentMetadata,
  extractStaticHtml,
  hasPublicHtml,
  readPublicHtml,
} from "../lib/staticHtmlPage";

const FILE_NAME = "shoutlyai-ai-caption-generator.html";
const SCOPE_CLASS = "caption-generator-content";

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

export default function AiCaptionGeneratorPage() {
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
          key={`caption-generator-inline-script-${index}`}
          id={`caption-generator-inline-script-${index}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
      ))}
    </main>
  );
}
