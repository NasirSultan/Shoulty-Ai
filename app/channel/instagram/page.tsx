import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Instagram Post Generator & Scheduler — AI-Powered | Shoutly AI",
  description:
    "Generate Instagram posts, reels, carousels, and stories with AI. Auto-schedule and publish consistently with Shoutly AI.",
};

export default function InstagramChannelPage() {
  const htmlPath = path.join(process.cwd(), "public", "shoutlyai-instagram.html");
  const rawHtml = fs.readFileSync(htmlPath, "utf8");

  const styleMatch = rawHtml.match(/<style>([\s\S]*?)<\/style>/i);
  let pageStyles = styleMatch?.[1] ?? "";

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyHtml = bodyMatch?.[1] ?? "";

  // Remove standalone page nav/footer so global app Header/Footer stay in control.
  bodyHtml = bodyHtml.replace(/<nav class="nav"[\s\S]*?<\/nav>\s*(?=<div class="bc")/i, "");
  bodyHtml = bodyHtml.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, "");

  const inlineScriptMatch = bodyHtml.match(/<script>([\s\S]*?)<\/script>\s*$/i);
  let inlineScript = inlineScriptMatch?.[1] ?? "";

  // Keep original interactions but guard nav-scroll logic after removing static nav.
  inlineScript = inlineScript.replace(
    "var nav=document.getElementById('nav');window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>8);},{passive:true});",
    "var nav=document.getElementById('nav');if(nav){window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>8);},{passive:true});}",
  );

  bodyHtml = bodyHtml.replace(/<script>[\s\S]*?<\/script>\s*$/i, "");
  bodyHtml = bodyHtml.replace(/<main[^>]*>/i, "");
  bodyHtml = bodyHtml.replace(/<\/main>\s*$/i, "");

  // Prevent static page global resets from leaking into the app Header/Footer.
  pageStyles = pageStyles.replace(/\*\,\*::before\,\*::after\{[\s\S]*?\}/i, ".instagram-content *, .instagram-content *::before, .instagram-content *::after{box-sizing:border-box;margin:0;padding:0}");
  pageStyles = pageStyles.replace(/html\{[\s\S]*?\}/i, ".instagram-content{font-size:16px;scroll-behavior:smooth;-webkit-text-size-adjust:100%}");
  pageStyles = pageStyles.replace(/body\{[\s\S]*?\}/i, ".instagram-content{font-family:'Inter',system-ui,sans-serif;background:#fff;color:#0f0f0f;-webkit-font-smoothing:antialiased;line-height:1.6;overflow-x:hidden}");
  pageStyles = pageStyles.replace(/img\{[\s\S]*?\}/i, ".instagram-content img{display:block;max-width:100%;height:auto}");
  pageStyles = pageStyles.replace(/a\{[\s\S]*?\}/i, ".instagram-content a{color:inherit;text-decoration:none}");
  pageStyles = pageStyles.replace(/button\{[\s\S]*?\}/i, ".instagram-content button{font-family:inherit;cursor:pointer;border:none;background:none}");
  pageStyles = pageStyles.replace(/:root\{[\s\S]*?\}/i, ".instagram-content{--ig1:#f58529;--ig2:#dd2a7b;--ig3:#8134af;--ig4:#515bd4;--ig-grad:linear-gradient(135deg,#f58529 0%,#dd2a7b 40%,#8134af 70%,#515bd4 100%);--ig-l:#fdf2f8;--ig-border:#f0c4de;--ink:#0f0f0f;--ink2:#262626;--ink3:#737373;--ink4:#a8a8a8;--surface:#fafafa;--border:#dbdbdb;--border2:#c7c7c7;--green:#16a34a;--green-l:#f0fdf4;--green-b:#bbf7d0;--max:1200px;--r-sm:6px;--r-md:10px;--r-lg:14px;--r-xl:20px}");
  pageStyles += "\n.instagram-content [data-reveal]{opacity:1!important;transform:none!important;}\n";

  return (
    <main className="bg-white">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Inter+Tight:wght@700;800;900&display=swap"
      />
      {pageStyles ? <style dangerouslySetInnerHTML={{ __html: pageStyles }} /> : null}
      <div className="instagram-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {inlineScript ? <Script id="instagram-inline-page-script" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: inlineScript }} /> : null}
    </main>
  );
}
