import fs from "node:fs";
import path from "node:path";

export type StaticHtmlExtraction = {
  bodyHtml: string;
  pageStyles: string;
  inlineScripts: string[];
};

export type HtmlDocumentMeta = {
  title?: string;
  description?: string;
};

function hardenInlineScript(scriptContent: string): string {
  let safeScript = scriptContent;

  // Ensure reveal CSS can opt into JS-only hidden state.
  safeScript = `document.documentElement.classList.add('js');\n${safeScript}`;

  // On client-side route transitions, DOMContentLoaded may already have fired.
  // This wrapper runs the callback immediately when the document is ready.
  safeScript = safeScript.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*function\s*\(\)\s*\{/g,
    "(function(__shoutlyRun){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',__shoutlyRun);}else{__shoutlyRun();}})(function(){",
  );
  safeScript = safeScript.replace(
    /document\.addEventListener\("DOMContentLoaded",\s*function\s*\(\)\s*\{/g,
    "(function(__shoutlyRun){if(document.readyState==='loading'){document.addEventListener(\"DOMContentLoaded\",__shoutlyRun);}else{__shoutlyRun();}})(function(){",
  );
  safeScript = safeScript.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{/g,
    "(function(__shoutlyRun){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',__shoutlyRun);}else{__shoutlyRun();}})(function(){",
  );
  safeScript = safeScript.replace(
    /document\.addEventListener\("DOMContentLoaded",\s*\(\)\s*=>\s*\{/g,
    "(function(__shoutlyRun){if(document.readyState==='loading'){document.addEventListener(\"DOMContentLoaded\",__shoutlyRun);}else{__shoutlyRun();}})(function(){",
  );

  // Static source pages often expect a local #nav element; this layout removes
  // static nav so guard those calls to avoid runtime null errors.
  safeScript = safeScript.replace(
    /document\.getElementById\('nav'\)\.classList\.toggle\('scrolled',\s*window\.scrollY\s*>\s*8\);/g,
    "var __shoutlyNav = document.getElementById('nav'); if (__shoutlyNav) { __shoutlyNav.classList.toggle('scrolled', window.scrollY > 8); }",
  );
  safeScript = safeScript.replace(
    /document\.getElementById\("nav"\)\.classList\.toggle\("scrolled",\s*window\.scrollY\s*>\s*8\);/g,
    "var __shoutlyNav = document.getElementById(\"nav\"); if (__shoutlyNav) { __shoutlyNav.classList.toggle(\"scrolled\", window.scrollY > 8); }",
  );
  safeScript = safeScript.replace(
    /nav\.classList\.toggle\('scrolled',\s*window\.scrollY\s*>\s*8\);/g,
    "if (nav) { nav.classList.toggle('scrolled', window.scrollY > 8); }",
  );
  safeScript = safeScript.replace(
    /nav\.classList\.toggle\("scrolled",\s*window\.scrollY\s*>\s*8\);/g,
    "if (nav) { nav.classList.toggle(\"scrolled\", window.scrollY > 8); }",
  );

  return safeScript;
}

export function readPublicHtml(fileName: string): string {
  const htmlPath = path.join(process.cwd(), "app", "static-html", fileName);
  return fs.readFileSync(htmlPath, "utf8");
}

export function hasPublicHtml(fileName: string): boolean {
  const htmlPath = path.join(process.cwd(), "app", "static-html", fileName);
  return fs.existsSync(htmlPath);
}

export function extractDocumentMetadata(rawHtml: string): HtmlDocumentMeta {
  const titleMatch = rawHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = rawHtml.match(
    /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i,
  );

  return {
    title: titleMatch?.[1]?.trim(),
    description: descriptionMatch?.[1]?.trim(),
  };
}

export function extractStaticHtml(rawHtml: string, scopeClass: string): StaticHtmlExtraction {
  const styleMatch = rawHtml.match(/<style>([\s\S]*?)<\/style>/i);
  let pageStyles = styleMatch?.[1] ?? "";

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyHtml = bodyMatch?.[1] ?? "";

  // Keep shared app chrome in control.
  bodyHtml = bodyHtml.replace(/<nav class="nav"[^>]*id=["']nav["'][\s\S]*?<\/div>\s*<\/nav>\s*/i, "");
  bodyHtml = bodyHtml.replace(/<nav class="nav"[\s\S]*?<\/nav>\s*/i, "");
  bodyHtml = bodyHtml.replace(/<header[\s\S]*?<\/header>/i, "");
  bodyHtml = bodyHtml.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, "");
  bodyHtml = bodyHtml.replace(/<footer[\s\S]*?<\/footer>/i, "");

  // Keep links inside the app instead of bouncing to production URLs.
  bodyHtml = bodyHtml.replace(/https:\/\/shoutlyai\.com\//gi, "/");

  const inlineScripts = Array.from(bodyHtml.matchAll(/<script>([\s\S]*?)<\/script>/gi)).map((match) =>
    hardenInlineScript(match[1]),
  );

  bodyHtml = bodyHtml.replace(/<script>[\s\S]*?<\/script>/gi, "");
  bodyHtml = bodyHtml.replace(/<main[^>]*>/i, "");
  bodyHtml = bodyHtml.replace(/<\/main>\s*$/i, "");

  // Scope possible global reset rules from source pages.
  pageStyles = pageStyles.replace(
    /\*\,\*::before\,\*::after\{[\s\S]*?\}/i,
    `.${scopeClass} *, .${scopeClass} *::before, .${scopeClass} *::after{box-sizing:border-box;margin:0;padding:0}`,
  );
  pageStyles = pageStyles.replace(
    /html\{[\s\S]*?\}/i,
    `.${scopeClass}{font-size:16px;scroll-behavior:smooth;-webkit-text-size-adjust:100%}`,
  );
  pageStyles = pageStyles.replace(
    /body\{[\s\S]*?\}/i,
    `.${scopeClass}{font-family:Inter,system-ui,sans-serif;background:#fff;color:#0f172a;-webkit-font-smoothing:antialiased;line-height:1.6;overflow-x:hidden}`,
  );
  pageStyles = pageStyles.replace(/img\{[\s\S]*?\}/i, `.${scopeClass} img{display:block;max-width:100%;height:auto}`);
  pageStyles = pageStyles.replace(/a\{[\s\S]*?\}/i, `.${scopeClass} a{color:inherit;text-decoration:none}`);
  pageStyles = pageStyles.replace(/button\{[\s\S]*?\}/i, `.${scopeClass} button{font-family:inherit}`);

  // Prevent empty-looking pages when reveal scripts run late on client navigation.
  // Content stays visible by default; JS-enabled pages still animate in.
  pageStyles = pageStyles.replace(
    /\[data-r\]\{([^}]*)opacity\s*:\s*0([^}]*)\}/gi,
    "[data-r]{opacity:1;transform:none}.js [data-r]{$1opacity:0$2}",
  );

  return {
    bodyHtml,
    pageStyles,
    inlineScripts,
  };
}
