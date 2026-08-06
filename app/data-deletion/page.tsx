import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

function getSourceHtml() {
  const htmlPath = path.join(process.cwd(), "app", "data-deletion", "source.html");
  return fs.readFileSync(htmlPath, "utf8");
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

  const mainMatch = rawHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  let bodyHtml = mainMatch?.[1] ?? "";

  // Keep links inside the app instead of bouncing to production URLs.
  bodyHtml = bodyHtml.replace(/https:\/\/shoutlyai\.com\//gi, "/");
  bodyHtml = bodyHtml.replace(/https:\/\/shoutlyai\.com"/gi, '"/"');

  const inlineScripts = Array.from(rawHtml.matchAll(/<script>([\s\S]*?)<\/script>/gi)).map((m) => m[1]);

  // Scope global reset rules from the source page so they don't leak into the shared app chrome.
  pageStyles = pageStyles.replace(/\*,\*::before,\*::after\{[\s\S]*?\}/i, ".dd-page *, .dd-page *::before, .dd-page *::after{box-sizing:border-box;margin:0;padding:0}");
  pageStyles = pageStyles.replace(/html\{[\s\S]*?\}/i, ".dd-page{font-size:16px;scroll-behavior:smooth;-webkit-text-size-adjust:100%}");
  pageStyles = pageStyles.replace(/body\{[\s\S]*?\}/i, ".dd-page{font-family:'Inter',system-ui,sans-serif;background:#fff;color:#0f0f0f;-webkit-font-smoothing:antialiased;line-height:1.6;overflow-x:hidden}");
  pageStyles = pageStyles.replace(/^a\{[\s\S]*?\}/im, ".dd-page a{color:inherit;text-decoration:none}");
  pageStyles = pageStyles.replace(/^button\{[\s\S]*?\}/im, ".dd-page button{font-family:inherit;cursor:pointer;border:none;background:none}");

  // Drop the source page's own sticky-nav rule — that element isn't rendered here (shared Header owns the top of the page).
  pageStyles = pageStyles.replace(/\.nav\{[\s\S]*?\}\s*\.nav\.scrolled\{[\s\S]*?\}/i, "");

  // Widen the main container.
  pageStyles = pageStyles.replace(/--max:1200px/i, "--max:1600px");
  pageStyles = pageStyles.replace(/--max-prose:820px/i, "--max-prose:1100px");

  // Swap the source's violet/purple brand palette AND the Facebook-brand blue for the site's orange theme.
  // No blue or purple anywhere on the page.
  const colorSwaps: Array<[RegExp, string]> = [
    [/#1877f2/gi, "#f97316"],   // facebook blue -> orange
    [/#0e5fc4/gi, "#fb923c"],   // facebook blue (dark) -> peach
    [/#6c3bf5/gi, "#f97316"],   // primary violet -> orange
    [/#a855f7/gi, "#fb923c"],   // secondary purple -> peach
    [/108,\s*59,\s*245/gi, "249,115,22"], // rgba(violet) -> rgba(orange)
    [/#08021a/gi, "#0f172a"],   // violet-tinted dark bg -> neutral dark
    [/#c4b5fd/gi, "#fdba74"],   // light purple badge text -> light orange
    [/#ede9fe/gi, "#fff7ed"],   // lavender icon bg -> peach icon bg
    [/#faf5ff/gi, "#fffbeb"],   // lavender icon bg -> peach icon bg
  ];
  for (const [pattern, replacement] of colorSwaps) {
    pageStyles = pageStyles.replace(pattern, replacement);
    bodyHtml = bodyHtml.replace(pattern, replacement);
  }
  bodyHtml = bodyHtml.replace(/&#128153;/gi, "&#128279;"); // blue heart emoji -> link icon

  // Pin each option card's CTA button to the bottom so all three align regardless of content length,
  // and add a touch more visual polish (deeper hover lift, warmer card shadow).
  pageStyles += `
.opt-card{display:flex;flex-direction:column}
.opt-card:hover{box-shadow:0 10px 32px rgba(249,115,22,.14);transform:translateY(-3px)}
.oc-body{display:flex;flex-direction:column;flex:1}
.oc-steps{flex:0 0 auto}
.oc-cta{margin-top:auto}
.oc-email-box{flex:0 0 auto}
`;

  return {
    bodyHtml,
    pageStyles,
    inlineScripts,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const rawHtml = getSourceHtml();
  const pageMeta = extractDocumentMetadata(rawHtml);

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    alternates: { canonical: "/data-deletion" },
  };
}

export default function DataDeletionPage() {
  const rawHtml = getSourceHtml();
  const { bodyHtml, pageStyles, inlineScripts } = extractHtml(rawHtml);

  return (
    <div className="dd-page">
      {pageStyles ? <style dangerouslySetInnerHTML={{ __html: pageStyles }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {inlineScripts.map((scriptContent, index) => (
        <Script
          key={`data-deletion-inline-script-${index}`}
          id={`data-deletion-inline-script-${index}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
      ))}
    </div>
  );
}
