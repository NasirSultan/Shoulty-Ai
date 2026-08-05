"use client";

import { useState, useEffect, useRef } from "react";

const css = `
  .dd-root {
    --p:#6c3bf5;--pg:linear-gradient(135deg,#6c3bf5,#a855f7);
    --dark:#08021a;
    --ink:#0f0f0f;--ink2:#262626;--ink3:#525252;--ink4:#a3a3a3;
    --surface:#f7f7fb;--border:#e5e4f0;--border2:#ccc9ea;
    --green:#16a34a;--green-l:#f0fdf4;--green-b:#bbf7d0;
    --amber:#d97706;--amber-l:#fffbeb;--amber-b:#fde68a;
    --max-prose:820px;
    --r2:12px;--r3:16px;--r4:22px;
    font-family:'Inter',system-ui,sans-serif;
    color:#0f0f0f;
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  .dd-wrap{max-width:1200px;margin:0 auto;padding:0 28px}
  .dd-prose{max-width:var(--max-prose);margin:0 auto;padding:0 28px}

  .dd-bc{background:var(--surface);border-bottom:1px solid var(--border);padding:11px 0}
  .dd-bc-row{display:flex;align-items:center;gap:7px;font-size:13px;color:var(--ink4)}
  .dd-bc-row a{color:var(--ink4);transition:color .14s}.dd-bc-row a:hover{color:var(--p)}

  .dd-hero{background:var(--dark);padding:72px 0 68px;position:relative;overflow:hidden}
  .dd-orb{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none}
  .dd-orb-1{width:600px;height:600px;background:radial-gradient(circle,rgba(108,59,245,.45),transparent 68%);top:-200px;left:-150px}
  .dd-orb-2{width:400px;height:400px;background:radial-gradient(circle,rgba(220,38,38,.2),transparent 65%);bottom:-100px;right:-80px}
  .dd-hero-inner{position:relative;z-index:1;max-width:var(--max-prose);margin:0 auto;padding:0 28px;text-align:center}
  .dd-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(220,38,38,.15);border:1px solid rgba(220,38,38,.3);border-radius:100px;padding:5px 14px 5px 10px;font-size:12.5px;font-weight:700;color:#fca5a5;margin-bottom:24px}
  .dd-badge-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;flex-shrink:0}
  .dd-h1{font-size:clamp(34px,5vw,58px);font-weight:900;letter-spacing:-2.5px;line-height:.97;color:#fff;margin-bottom:20px}
  .dd-grad{background:linear-gradient(135deg,#f87171,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .dd-hero-sub{font-size:clamp(15px,1.6vw,18px);color:rgba(255,255,255,.6);line-height:1.75;max-width:560px;margin:0 auto 36px}
  .dd-meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08);border-radius:var(--r4);overflow:hidden;max-width:520px;margin:0 auto}
  .dd-meta-cell{background:rgba(255,255,255,.04);padding:14px 16px;text-align:center}
  .dd-meta-val{font-size:18px;font-weight:800;color:#fff;letter-spacing:-.5px;margin-bottom:2px}
  .dd-meta-lbl{font-size:10.5px;color:rgba(255,255,255,.4);font-weight:600}

  .dd-sec{padding:72px 0}
  .dd-sec-alt{background:var(--surface)}
  .dd-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--p);margin-bottom:10px;display:block}
  .dd-h2{font-size:clamp(24px,3vw,36px);font-weight:900;letter-spacing:-1.2px;color:var(--ink);line-height:1.08;margin-bottom:10px}
  .dd-lead{font-size:16.5px;color:var(--ink3);line-height:1.75}

  .dd-banner{background:#fff;border:1px solid var(--border);border-radius:var(--r4);padding:28px 32px;display:flex;gap:18px;align-items:flex-start;margin-bottom:52px}
  .dd-banner-ico{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#ede9fe,#faf5ff);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
  .dd-banner-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:6px}
  .dd-banner-desc{font-size:14px;color:var(--ink3);line-height:1.7}

  .dd-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .dd-card{background:#fff;border:1px solid var(--border);border-radius:var(--r3);padding:16px 18px;display:flex;align-items:flex-start;gap:12px;transition:border-color .18s}
  .dd-card:hover{border-color:#c4b5fd}
  .dd-check{width:22px;height:22px;border-radius:50%;background:var(--green-l);border:1.5px solid var(--green-b);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--green);flex-shrink:0;margin-top:1px;font-weight:800}
  .dd-card-text{font-size:14px;font-weight:600;color:var(--ink);line-height:1.45}
  .dd-card-sub{font-size:12.5px;color:var(--ink4);margin-top:2px;font-weight:400}

  .dd-notice{background:var(--amber-l);border:1px solid var(--amber-b);border-radius:var(--r4);padding:22px 26px;display:flex;gap:14px;align-items:flex-start;margin-top:28px}
  .dd-notice-ico{width:38px;height:38px;border-radius:10px;background:rgba(217,119,6,.12);border:1px solid var(--amber-b);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .dd-notice-title{font-size:14px;font-weight:700;color:#92400e;margin-bottom:4px}
  .dd-notice-desc{font-size:13.5px;color:#78350f;line-height:1.65}

  .dd-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .dd-opt{background:#fff;border:1px solid var(--border);border-radius:var(--r4);overflow:hidden;transition:all .2s}
  .dd-opt:hover{border-color:var(--border2);box-shadow:0 6px 24px rgba(108,59,245,.08);transform:translateY(-2px)}
  .dd-opt-head{padding:20px 22px 16px;border-bottom:1px solid var(--border)}
  .dd-opt-num{width:30px;height:30px;border-radius:50%;background:var(--pg);color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
  .dd-opt-title{font-size:15px;font-weight:800;color:var(--ink);letter-spacing:-.2px}
  .dd-opt-sub{font-size:12.5px;color:var(--ink4);margin-top:2px}
  .dd-opt-body{padding:18px 22px}
  .dd-steps{display:flex;flex-direction:column;gap:9px;margin-bottom:16px}
  .dd-step{display:flex;align-items:flex-start;gap:9px;font-size:13.5px;color:var(--ink2)}
  .dd-step-n{width:20px;height:20px;border-radius:50%;background:var(--surface);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800;color:var(--ink3);flex-shrink:0;margin-top:1px}
  .dd-email-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);padding:12px 14px;margin-bottom:12px}
  .dd-email-row{display:flex;align-items:flex-start;gap:8px;margin-bottom:6px}
  .dd-email-row:last-child{margin-bottom:0}
  .dd-email-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--ink4);min-width:60px;padding-top:1px}
  .dd-email-val{font-size:13px;color:var(--ink2);font-weight:500}
  .dd-email-val a{color:var(--p)}
  .dd-cta-btn{display:block;width:100%;text-align:center;background:var(--pg);color:#fff;border-radius:var(--r2);padding:10px;font-size:13.5px;font-weight:700;transition:all .16s;text-decoration:none}
  .dd-cta-btn:hover{opacity:.88;transform:translateY(-1px)}

  .dd-fb-wrap{background:#fff;border:1px solid var(--border);border-radius:var(--r4);overflow:hidden;margin-top:28px}
  .dd-fb-head{padding:16px 22px;background:linear-gradient(135deg,#1877f2,#0e5fc4);display:flex;align-items:center;gap:12px}
  .dd-fb-head-title{font-size:15px;font-weight:800;color:#fff}
  .dd-fb-head-sub{font-size:12px;color:rgba(255,255,255,.7);margin-top:1px}
  .dd-fb-body{padding:18px 22px;display:flex;flex-direction:column}
  .dd-fb-step{display:flex;gap:14px;position:relative;padding-bottom:16px}
  .dd-fb-step:last-child{padding-bottom:0}
  .dd-fb-step::before{content:'';position:absolute;left:14px;top:32px;bottom:0;width:1.5px;background:var(--border)}
  .dd-fb-step:last-child::before{display:none}
  .dd-fb-num{width:29px;height:29px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0e5fc4);color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1}
  .dd-fb-step-body{padding-top:4px}
  .dd-fb-step-title{font-size:13.5px;font-weight:700;color:var(--ink);margin-bottom:2px}
  .dd-fb-step-desc{font-size:13px;color:var(--ink3);line-height:1.55}

  .dd-proc-card{background:var(--pg);border-radius:var(--r4);padding:36px;text-align:center;color:#fff;position:relative;overflow:hidden}
  .dd-proc-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 110%,rgba(255,255,255,.08),transparent);pointer-events:none}
  .dd-proc-time{font-size:clamp(42px,6vw,72px);font-weight:900;letter-spacing:-4px;line-height:1;margin-bottom:10px}
  .dd-proc-unit{font-size:14px;font-weight:600;color:rgba(255,255,255,.7);margin-bottom:4px}
  .dd-proc-note{font-size:14.5px;color:rgba(255,255,255,.7);line-height:1.65;max-width:360px;margin:0 auto}

  .dd-contact{background:#fff;border:1px solid var(--border);border-radius:var(--r4);padding:28px 32px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .dd-contact-item{display:flex;gap:13px;align-items:flex-start}
  .dd-contact-ico{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#ede9fe,#faf5ff);display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
  .dd-contact-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--ink4);margin-bottom:4px}
  .dd-contact-val{font-size:14.5px;font-weight:600;color:var(--p)}

  .dd-faq-list{border:1px solid var(--border);border-radius:var(--r4);overflow:hidden}
  .dd-faq-item{border-bottom:1px solid var(--border)}.dd-faq-item:last-child{border-bottom:none}
  .dd-faq-q{width:100%;padding:18px 22px;background:#fff;border:none;display:flex;align-items:center;justify-content:space-between;text-align:left;cursor:pointer;font-size:15px;font-weight:600;color:var(--ink);gap:14px;transition:background .14s;font-family:inherit}
  .dd-faq-q:hover{background:var(--surface)}
  .dd-faq-arr{width:24px;height:24px;border-radius:50%;background:var(--surface);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--ink4);flex-shrink:0;transition:all .22s}
  .dd-faq-open .dd-faq-arr{background:var(--pg);border-color:transparent;color:#fff;transform:rotate(45deg)}
  .dd-faq-a{padding:0 22px 18px;font-size:14.5px;color:var(--ink2);line-height:1.75;background:#fff}

  .dd-comply{background:var(--dark);border-radius:var(--r4);padding:32px;display:flex;gap:24px;align-items:flex-start}
  .dd-comply-ico{width:52px;height:52px;border-radius:14px;background:rgba(108,59,245,.2);border:1px solid rgba(108,59,245,.35);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
  .dd-comply-title{font-size:16px;font-weight:800;color:#fff;margin-bottom:8px}
  .dd-comply-desc{font-size:14px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:14px}
  .dd-comply-badges{display:flex;gap:8px;flex-wrap:wrap}
  .dd-comply-badge{font-size:11px;font-weight:700;padding:4px 11px;border-radius:100px;background:rgba(108,59,245,.18);border:1px solid rgba(108,59,245,.3);color:#c4b5fd}

  .dd-cta{background:var(--dark);padding:80px 0;text-align:center;position:relative;overflow:hidden}
  .dd-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 65% at 50% 110%,rgba(220,38,38,.18),transparent 70%);pointer-events:none}
  .dd-cta-h2{font-size:clamp(28px,4.5vw,48px);font-weight:900;letter-spacing:-2px;line-height:1.05;color:#fff;margin-bottom:14px;position:relative;z-index:1}
  .dd-cta-p{font-size:17px;color:rgba(255,255,255,.55);line-height:1.7;max-width:480px;margin:0 auto 32px;position:relative;z-index:1}
  .dd-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
  .dd-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;font-weight:700;padding:13px 28px;font-size:15.5px;border-radius:var(--r3);transition:all .15s;cursor:pointer;border:none;text-decoration:none;white-space:nowrap}
  .dd-btn-red{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;box-shadow:0 2px 10px rgba(220,38,38,.3)}.dd-btn-red:hover{opacity:.9;transform:translateY(-1px)}

  .dd-info-box{padding:14px 18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);font-size:13.5px;color:var(--ink3);line-height:1.65}
  .dd-policy-box{margin-top:24px;padding:18px 22px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);font-size:13.5px;color:var(--ink3);line-height:1.7}

  [data-reveal]{opacity:0;transform:translateY(18px);transition:opacity .5s ease,transform .5s ease}
  [data-reveal].is-visible{opacity:1;transform:none}

  @media(max-width:900px){.dd-opts{grid-template-columns:1fr}.dd-contact{grid-template-columns:1fr}}
  @media(max-width:680px){.dd-grid{grid-template-columns:1fr}.dd-meta{grid-template-columns:1fr 1fr}.dd-comply{flex-direction:column}.dd-sec{padding:52px 0}.dd-wrap,.dd-prose{padding:0 18px}}
`;

const DATA_ITEMS = [
  { label: "Personal Profile Information", sub: "Name, email address, profile photo, and account details" },
  { label: "Connected Facebook Account Data", sub: "All data obtained via Facebook Login and Facebook API integrations" },
  { label: "Connected Instagram Account Data", sub: "Profile data, media permissions, and Instagram Graph API tokens" },
  { label: "Connected LinkedIn Account Data", sub: "Profile information and LinkedIn API access tokens" },
  { label: "Google Business Profile Data", sub: "Connected GBP locations, post history, and Google API tokens" },
  { label: "X, Threads, YouTube & Other Integrations", sub: "All connected social platform data, tokens, and permissions" },
  { label: "AI-Generated Content", sub: "Posts, captions, hashtag sets, Reel scripts, and image descriptions" },
  { label: "Scheduled & Published Posts", sub: "All post history, drafts, and queued content across all platforms" },
  { label: "Brand Assets & Brand Kit", sub: "Logos, colour palettes, fonts, and brand voice settings" },
  { label: "Uploaded Images & Videos", sub: "All media files stored in your Shoutly AI media library" },
  { label: "Content Calendar", sub: "Your full 365-day planned calendar and campaign schedules" },
  { label: "API Tokens & Integrations", sub: "All stored OAuth tokens and third-party integration credentials" },
  { label: "Analytics & Reporting Data", sub: "Historical performance reports and engagement metrics stored by Shoutly AI" },
  { label: "Preferences & Settings", sub: "Notification preferences, language settings, and account configurations" },
];

const FB_STEPS = [
  { title: "Open Facebook", desc: "Log in to your Facebook account on the web or mobile app." },
  { title: "Go to Settings & Privacy", desc: "Click your profile icon (top right) and select Settings & Privacy." },
  { title: "Select Settings", desc: "From the dropdown menu, click Settings." },
  { title: "Open Apps and Websites", desc: "In the left-hand menu, navigate to Apps and Websites." },
  { title: "Find Shoutly AI", desc: "Locate Shoutly AI in your list of connected applications." },
  { title: "Click Remove", desc: "Select Shoutly AI and click Remove. This disconnects your Facebook account. Submit a deletion request above to also permanently remove your data from our servers." },
];

const FAQS = [
  {
    q: "Can I recover my account after deletion?",
    a: <p><strong>No.</strong> Once your account has been permanently deleted, it cannot be restored. All data — including your content calendar, brand kit, generated posts, uploaded media, and connected account information — is irreversibly removed from our systems. Please make sure you have exported any data you wish to keep before submitting your deletion request.</p>,
  },
  {
    q: "Will my scheduled posts be deleted?",
    a: <p><strong>Yes.</strong> All scheduled posts, drafts, generated content, uploaded media, and related assets stored by Shoutly AI will be permanently removed. Posts already published to social media platforms are controlled by those platforms and subject to their own deletion policies.</p>,
  },
  {
    q: "Will my Facebook and Instagram connections be removed?",
    a: <p><strong>Yes.</strong> All connected Meta account information — including Facebook and Instagram access tokens, account IDs, permissions, and any data retrieved through the Meta Graph API — stored by Shoutly AI will be deleted. We recommend also removing Shoutly AI from your Facebook Apps and Websites settings for complete disconnection.</p>,
  },
  {
    q: "Will deleting my account cancel my subscription?",
    a: <p><strong>No.</strong> Deleting your account does not automatically cancel any active subscription or stop billing. Please cancel your subscription from within your account settings <em>before</em> requesting permanent account deletion. Contact <a href="mailto:support@shoutlyai.com" style={{ color: "var(--p)" as string }}>support@shoutlyai.com</a> if you need assistance.</p>,
  },
  {
    q: "How will I know my request has been completed?",
    a: <p>You will receive an email confirmation at your registered email address after your deletion request has been successfully processed, stating that all personal data has been permanently deleted from Shoutly AI&apos;s systems.</p>,
  },
  {
    q: "Is there any charge for requesting data deletion?",
    a: <p><strong>No.</strong> Submitting a data deletion request is completely free. This is your right under applicable privacy regulations including the DPDP Act (India), GDPR (EU), CCPA (California), and Meta Platform requirements.</p>,
  },
];

export default function DataDeletionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const revealEls = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      revealEls.current.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -24px 0px" }
    );
    revealEls.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const reveal = (el: HTMLElement | null) => {
    if (el && !revealEls.current.includes(el)) revealEls.current.push(el);
  };

  return (
    <div className="dd-root">
      <style>{css}</style>

      {/* Breadcrumb */}
      <div className="dd-bc">
        <div className="dd-wrap">
          <div className="dd-bc-row">
            <a href="/">Home</a>
            <span>›</span>
            <span>Data Deletion</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="dd-hero">
        <div className="dd-orb dd-orb-1" />
        <div className="dd-orb dd-orb-2" />
        <div className="dd-hero-inner">
          <div className="dd-badge">
            <span className="dd-badge-dot" />
            Meta Platform Compliant &mdash; DPDP &bull; GDPR &bull; CCPA
          </div>
          <h1 className="dd-h1">Your Privacy<br /><span className="dd-grad">Matters to Us.</span></h1>
          <p className="dd-hero-sub">
            At Shoutly AI, we respect your privacy and give you full control over your personal data. You may request deletion of your account and all associated information at any time &mdash; no questions asked.
          </p>
          <div className="dd-meta">
            <div className="dd-meta-cell"><div className="dd-meta-val">7&ndash;30</div><div className="dd-meta-lbl">Business days</div></div>
            <div className="dd-meta-cell"><div className="dd-meta-val">100%</div><div className="dd-meta-lbl">Data deleted</div></div>
            <div className="dd-meta-cell"><div className="dd-meta-val">Free</div><div className="dd-meta-lbl">No charge</div></div>
          </div>
        </div>
      </section>

      {/* What can be deleted */}
      <section className="dd-sec" ref={reveal} data-reveal>
        <div className="dd-prose">
          <div className="dd-banner">
            <div className="dd-banner-ico">📄</div>
            <div>
              <div className="dd-banner-title">About This Page</div>
              <div className="dd-banner-desc">This page explains how to request deletion of your data stored by Shoutly AI, including data obtained through Meta (Facebook) integrations and other connected platforms. We process deletion requests in accordance with applicable privacy regulations and Meta Platform requirements.</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink4)", marginBottom: 48 }}>Last updated: <time dateTime="2026-08-01">August 1, 2026</time></p>

          <span className="dd-eyebrow">What can be deleted</span>
          <h2 className="dd-h2">Information You Can Request Us to Delete</h2>
          <p className="dd-lead" style={{ marginBottom: 28 }}>When you submit a data deletion request, the following categories of data stored by Shoutly AI will be permanently and irreversibly removed from our systems.</p>

          <div className="dd-grid">
            {DATA_ITEMS.map((item) => (
              <div className="dd-card" key={item.label}>
                <div className="dd-check">✓</div>
                <div>
                  <div className="dd-card-text">{item.label}</div>
                  <div className="dd-card-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="dd-notice">
            <div className="dd-notice-ico">⚠️</div>
            <div>
              <div className="dd-notice-title">Information That May Be Retained</div>
              <div className="dd-notice-desc">For legal, financial, fraud prevention, or regulatory compliance purposes, certain records may be retained where required by applicable law (e.g. transaction records, invoices). Such information will <strong>never</strong> be used for marketing or product purposes after your deletion request is processed.</div>
            </div>
          </div>
        </div>
      </section>

      {/* How to request */}
      <section className="dd-sec dd-sec-alt" ref={reveal} data-reveal>
        <div className="dd-prose">
          <span className="dd-eyebrow">Submit your request</span>
          <h2 className="dd-h2">How to Request Data Deletion</h2>
          <p className="dd-lead" style={{ marginBottom: 36 }}>Choose the option that works best for your situation. All methods result in the same outcome: permanent, irreversible deletion of your data from Shoutly AI&apos;s systems.</p>

          <div className="dd-opts">
            {/* Option 1 */}
            <div className="dd-opt">
              <div className="dd-opt-head">
                <div className="dd-opt-num">1</div>
                <div className="dd-opt-title">Delete Your Account</div>
                <div className="dd-opt-sub">If you have access to your account &mdash; fastest method</div>
              </div>
              <div className="dd-opt-body">
                <div className="dd-steps">
                  {["Sign in to your Shoutly AI account", <span key="s2">Navigate to <strong>Settings</strong></span>, <span key="s3">Select <strong>Delete Account</strong></span>, "Confirm your deletion request"].map((s, i) => (
                    <div className="dd-step" key={i}><div className="dd-step-n">{i + 1}</div><span>{s}</span></div>
                  ))}
                </div>
                <p style={{ fontSize: 12.5, color: "var(--ink4)", marginBottom: 14, lineHeight: 1.55 }}>Your request immediately enters our deletion queue. You will receive an email confirmation when complete.</p>
                <a href="/sign-in" className="dd-cta-btn">Sign in to delete account</a>
              </div>
            </div>

            {/* Option 2 */}
            <div className="dd-opt">
              <div className="dd-opt-head">
                <div className="dd-opt-num">2</div>
                <div className="dd-opt-title">Request by Email</div>
                <div className="dd-opt-sub">If you cannot access your account</div>
              </div>
              <div className="dd-opt-body">
                <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 14, lineHeight: 1.65 }}>Send an email to our support team. We will verify your identity and process the deletion within 7&ndash;30 business days.</p>
                <div className="dd-email-box">
                  <div className="dd-email-row"><span className="dd-email-lbl">To</span><span className="dd-email-val"><a href="mailto:support@shoutlyai.com">support@shoutlyai.com</a></span></div>
                  <div className="dd-email-row"><span className="dd-email-lbl">Subject</span><span className="dd-email-val">Data Deletion Request</span></div>
                  <div className="dd-email-row"><span className="dd-email-lbl">Include</span><span className="dd-email-val">Full name, registered email, company name (optional)</span></div>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--ink4)", marginBottom: 14, lineHeight: 1.55 }}>Our team may contact you to verify identity before processing.</p>
                <a href="mailto:support@shoutlyai.com?subject=Data%20Deletion%20Request" className="dd-cta-btn">Send deletion email</a>
              </div>
            </div>

            {/* Option 3 */}
            <div className="dd-opt">
              <div className="dd-opt-head">
                <div className="dd-opt-num">3</div>
                <div className="dd-opt-title">Meta / Facebook Data</div>
                <div className="dd-opt-sub">If you signed in via Facebook or connected Meta accounts</div>
              </div>
              <div className="dd-opt-body">
                <p style={{ fontSize: 13.5, color: "var(--ink3)", marginBottom: 14, lineHeight: 1.65 }}>If you used Facebook Login or connected your Facebook or Instagram account, request deletion of all Meta-related data stored by Shoutly AI.</p>
                <div className="dd-email-box">
                  <div className="dd-email-row"><span className="dd-email-lbl">To</span><span className="dd-email-val"><a href="mailto:support@shoutlyai.com">support@shoutlyai.com</a></span></div>
                  <div className="dd-email-row"><span className="dd-email-lbl">Subject</span><span className="dd-email-val">Facebook Data Deletion Request</span></div>
                  <div className="dd-email-row"><span className="dd-email-lbl">Include</span><span className="dd-email-val">Full name, registered email, Facebook account email</span></div>
                </div>
                <p style={{ fontSize: 12.5, color: "var(--ink4)", marginBottom: 14, lineHeight: 1.55 }}>After verification, we permanently remove all Facebook-related data from our systems.</p>
                <a href="mailto:support@shoutlyai.com?subject=Facebook%20Data%20Deletion%20Request" className="dd-cta-btn">Send Facebook deletion request</a>
              </div>
            </div>
          </div>

          {/* Facebook steps */}
          <div className="dd-fb-wrap" ref={reveal} data-reveal>
            <div className="dd-fb-head">
              <span style={{ fontSize: 22 }}>💙</span>
              <div>
                <div className="dd-fb-head-title">Remove Shoutly AI from Your Facebook Settings</div>
                <div className="dd-fb-head-sub">Disconnects your Facebook account from Shoutly AI immediately. Submit a deletion request above to also remove your data from our servers.</div>
              </div>
            </div>
            <div className="dd-fb-body">
              {FB_STEPS.map((step, i) => (
                <div className="dd-fb-step" key={i}>
                  <div className="dd-fb-num">{i + 1}</div>
                  <div className="dd-fb-step-body">
                    <div className="dd-fb-step-title">{step.title}</div>
                    <div className="dd-fb-step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Processing + Contact */}
      <section className="dd-sec" ref={reveal} data-reveal>
        <div className="dd-prose">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            <div>
              <span className="dd-eyebrow">How long it takes</span>
              <h2 className="dd-h2">Processing Time</h2>
              <p className="dd-lead" style={{ marginBottom: 28 }}>We process all deletion requests as quickly as possible and always within the legally required window.</p>
              <div className="dd-proc-card">
                <div className="dd-proc-time">7&ndash;30</div>
                <div className="dd-proc-unit">Business Days</div>
                <div className="dd-proc-note">You will receive an email confirmation once the deletion process has been fully completed.</div>
              </div>
              <div className="dd-info-box" style={{ marginTop: 16 }}>
                <strong style={{ color: "var(--ink)" }}>Note:</strong> Deleting your account does not automatically cancel an active subscription. Please cancel any active subscription before submitting your deletion request.
              </div>
            </div>
            <div>
              <span className="dd-eyebrow">Get in touch</span>
              <h2 className="dd-h2">Need Assistance?</h2>
              <p className="dd-lead" style={{ marginBottom: 28 }}>For any questions about your privacy, data deletion, or our data practices, contact our team directly.</p>
              <div className="dd-contact">
                <div className="dd-contact-item">
                  <div className="dd-contact-ico">✉️</div>
                  <div>
                    <div className="dd-contact-lbl">Email</div>
                    <a href="mailto:support@shoutlyai.com" className="dd-contact-val">support@shoutlyai.com</a>
                  </div>
                </div>
                <div className="dd-contact-item">
                  <div className="dd-contact-ico">🌐</div>
                  <div>
                    <div className="dd-contact-lbl">Website</div>
                    <a href="https://shoutlyai.com" className="dd-contact-val">shoutlyai.com</a>
                  </div>
                </div>
              </div>
              <div className="dd-info-box" style={{ marginTop: 16 }}>
                <strong style={{ color: "var(--ink)" }}>Response time:</strong> Our support team typically responds within 2 business days. For urgent privacy matters, include &ldquo;URGENT&rdquo; in your email subject line.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="dd-sec dd-sec-alt" ref={reveal} data-reveal>
        <div className="dd-prose">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span className="dd-eyebrow">Frequently asked questions</span>
            <h2 className="dd-h2">Questions About Data Deletion</h2>
          </div>
          <div className="dd-faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`dd-faq-item${openFaq === i ? " dd-faq-open" : ""}`}>
                <button className="dd-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {faq.q}
                  <span className="dd-faq-arr">+</span>
                </button>
                {openFaq === i && <div className="dd-faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="dd-sec" ref={reveal} data-reveal>
        <div className="dd-prose">
          <span className="dd-eyebrow">Legal compliance</span>
          <h2 className="dd-h2" style={{ marginBottom: 24 }}>Compliance Statement</h2>
          <div className="dd-comply">
            <div className="dd-comply-ico">🔒</div>
            <div>
              <div className="dd-comply-title">Shoutly AI is committed to protecting your privacy.</div>
              <div className="dd-comply-desc">
                This User Data Deletion page is provided to comply with Meta Platform requirements and applicable data protection regulations, ensuring users can request deletion of their personal data associated with Facebook Login, Instagram connections, and other connected platform integrations.<br /><br />
                We process all deletion requests in accordance with the India Digital Personal Data Protection Act 2023, the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and Meta Platform Policy for User Data Deletion.<br /><br />
                Shoutly AI is operated by <strong style={{ color: "#fff" }}>Qubixel Technologies Private Limited</strong>, registered in India.
              </div>
              <div className="dd-comply-badges">
                {["DPDP Act 2023", "GDPR Compliant", "CCPA Compliant", "Meta Platform Policy", "SSL Secured", "AWS Cloud Hosted"].map((b) => (
                  <span className="dd-comply-badge" key={b}>{b}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="dd-policy-box">
            For more information about how we handle your personal data, please review our{" "}
            <a href="/privacy-policy" style={{ color: "var(--p)", fontWeight: 600 }}>Privacy Policy</a>,{" "}
            <a href="/terms-and-conditions" style={{ color: "var(--p)", fontWeight: 600 }}>Terms of Service</a>,{" "}
            <a href="/gdpr" style={{ color: "var(--p)", fontWeight: 600 }}>GDPR Policy</a>,{" "}
            <a href="/ccpa" style={{ color: "var(--p)", fontWeight: 600 }}>CCPA Policy</a>, and{" "}
            <a href="/dpdp" style={{ color: "var(--p)", fontWeight: 600 }}>DPDP Policy</a>.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="dd-cta">
        <div className="dd-prose" style={{ textAlign: "center" }}>
          <h2 className="dd-cta-h2">Ready to delete<br /><span className="dd-grad">your data?</span></h2>
          <p className="dd-cta-p">Your deletion request will be processed within 7&ndash;30 business days. You will receive email confirmation when complete. The process is free and permanent.</p>
          <div className="dd-cta-btns">
            <a href="mailto:support@shoutlyai.com?subject=Data%20Deletion%20Request" className="dd-btn dd-btn-red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Request Data Deletion
            </a>
            <a href="/sign-in" className="dd-btn" style={{ background: "transparent", color: "rgba(255,255,255,.8)", border: "1.5px solid rgba(255,255,255,.3)" }}>
              Sign in to delete account
            </a>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.35)", position: "relative", zIndex: 1 }}>
            Questions? Email <a href="mailto:support@shoutlyai.com" style={{ color: "rgba(255,255,255,.55)" }}>support@shoutlyai.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}

