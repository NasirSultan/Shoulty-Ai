'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/api/configApi';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaMoon,
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
  FaClock,
  FaCode,
  FaCloud,
  FaBolt,
  FaHeadset,
} from 'react-icons/fa';

type FooterLink = { label: string; href?: string; external?: boolean };

// A link with no `href` has no real destination yet in this app — render as
// an inactive/muted label instead of pointing it at a 404.
function FooterNavLink({ link }: { link: FooterLink }) {
  if (!link.href) {
    return (
      <span
        className="text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed select-none"
        title="Coming soon"
      >
        {link.label}
      </span>
    );
  }
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link
      href={link.href}
      className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
    >
      {link.label}
    </Link>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="col-span-1">
      <div className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-5">
        {title}
      </div>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <FooterNavLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  const pathname = usePathname();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubscribe = async () => {
    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterState('error');
      setNewsletterMessage('Please enter your email.');
      return;
    }
    setNewsletterState('loading');
    setNewsletterMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) {
        setNewsletterState('success');
        setNewsletterMessage("You're already subscribed!");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setNewsletterState('error');
        setNewsletterMessage(err?.message || 'Something went wrong — please try again.');
        return;
      }
      setNewsletterState('success');
      setNewsletterMessage("Subscribed! Check your inbox Thursday.");
      setNewsletterEmail('');
    } catch {
      setNewsletterState('error');
      setNewsletterMessage('Network error — please try again.');
    }
  };

  if (pathname === "/dashboards" || pathname?.startsWith("/dashboards/")) return null;

  const currentYear = new Date().getFullYear();

  const productLinks: FooterLink[] = [
    { label: "AI Content Generator", href: "/#generator" },
    { label: "AI Image Generator", href: "/#generator" },
    { label: "AI Reel Generator", href: "/#generator" },
    { label: "AI Social Scheduler" },
    { label: "Content Calendar", href: "/free-editorial" },
    { label: "Multi-Platform Publishing" },
    { label: "Analytics" },
    { label: "Brand Kit" },
    { label: "Integrations" },
    { label: "Pricing", href: "/pricing" },
  ];

  const solutionsLinks: FooterLink[] = [
    { label: "Local Businesses" },
    { label: "Restaurants", href: "/for/restaurants" },
    { label: "Fitness", href: "/for/fitness-studios" },
    { label: "Retail" },
    { label: "Healthcare" },
    { label: "Real Estate", href: "/for/real-estate" },
    { label: "Agencies" },
    { label: "Startups" },
    { label: "Professional Services" },
    { label: "Enterprise" },
  ];

  const channelsLinks: FooterLink[] = [
    { label: "Facebook", href: "/channel/facebook" },
    { label: "Instagram" },
    { label: "LinkedIn" },
    { label: "YouTube" },
    { label: "TikTok" },
    { label: "X", href: "/channel/twitter-x" },
    { label: "Google Business Profile" },
    { label: "Pinterest" },
    { label: "Threads" },
    { label: "Bluesky" },
    { label: "Mastodon" },
  ];

  const compareLinks: FooterLink[] = [
    { label: "Buffer vs Shoutly AI", href: "/compare/buffer-vs-shoutly-ai" },
    { label: "Hootsuite vs Shoutly AI", href: "/compare/hootsuite-vs-shoutly-ai" },
    { label: "Later vs Shoutly AI" },
    { label: "SocialPilot vs Shoutly AI" },
    { label: "Metricool vs Shoutly AI" },
    { label: "Publer vs Shoutly AI" },
    { label: "Canva vs Shoutly AI" },
    { label: "Sprout Social vs Shoutly AI" },
  ];

  const alternativesLinks: FooterLink[] = [
    { label: "Buffer Alternative" },
    { label: "Hootsuite Alternative" },
    { label: "Later Alternative" },
    { label: "SocialPilot Alternative" },
    { label: "Metricool Alternative" },
    { label: "Canva Alternative" },
    { label: "Sprout Social Alternative" },
  ];

  const resourcesLinks: FooterLink[] = [
    { label: "Blog", href: "https://blog.shoutlyai.com/", external: true },
    { label: "Help Center", href: "/help-center" },
    { label: "Templates" },
    { label: "Image Library", href: "/#library" },
    { label: "Prompt Library" },
    { label: "Affiliate Program" },
  ];

  const companyLinks: FooterLink[] = [
    { label: "About Us", href: "/about-us" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact-us" },
    { label: "Brand Assets" },
  ];

  const trustBadges: { icon: React.ReactNode; label: string }[] = [
    { icon: <FaShieldAlt size={11} />, label: "Enterprise Security" },
    { icon: <FaLock size={11} />, label: "SSL Secured" },
    { icon: <FaCheckCircle size={11} />, label: "GDPR Ready" },
    { icon: <FaCheckCircle size={11} />, label: "CCPA Compliant" },
    { icon: <FaCheckCircle size={11} />, label: "DPDP Act Compliant" },
    { icon: <FaClock size={11} />, label: "99.9% Uptime" },
    { icon: <FaCode size={11} />, label: "API Available" },
    { icon: <FaCloud size={11} />, label: "AWS Cloud Hosted" },
    { icon: <FaBolt size={11} />, label: "AI Powered" },
    { icon: <FaHeadset size={11} />, label: "24/7 Support" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie" },
    { label: "GDPR", href: "/gdpr" },
    { label: "CCPA", href: "/ccpa" },
    { label: "DPDP Act", href: "/dpdp" },
    { label: "Refunds", href: "/refunds" },
    { label: "Security", href: "/security" },
    { label: "DMCA", href: "/dmca" },
    { label: "EULA", href: "/eula" }
  ];

  const socialLinks = [
    { icon: <FaFacebook size={17} />, href: "https://www.facebook.com/people/Shoutly-AI/61583485633639/", label: "Facebook" },
    { icon: <FaInstagram size={17} />, href: "https://www.instagram.com/ai.shoutly/", label: "Instagram" },
    { icon: <FaLinkedin size={17} />, href: "https://www.linkedin.com/company/shoutlyai/?viewAsMember=true", label: "LinkedIn" },
    { icon: <FaTwitter size={17} />, href: "https://x.com/shoutlyai", label: "X" },
    { icon: <FaYoutube size={17} />, href: "https://youtube.com/@shoutlyai", label: "YouTube" }
  ];

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">

        {/* Top band — brand blurb + newsletter */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-12 mb-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <Link href="/" className="inline-block mb-4 -ml-4">
              <Image
                src="/images/logo2.png"
                alt="Shoutly AI logo"
                width={160}
                height={56}
                sizes="144px"
                className="w-36 h-12 object-contain"
              />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed mb-4">
              One workspace to write, design, schedule, and measure social content across every channel your business lives on.
            </p>
            <span
              className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 cursor-not-allowed select-none"
              title="Coming soon"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              All systems operational — <span className="underline">status</span>
            </span>
          </div>

          <div className="rounded-2xl p-6 bg-orange-50 dark:bg-gray-900 border border-orange-100 dark:border-gray-800">
            <div className="text-base font-bold text-gray-900 dark:text-white mb-1.5">The weekly signal</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              AI marketing tactics, product updates, and new feature releases. Sent Thursdays.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNewsletterSubscribe(); }}
                disabled={newsletterState === 'loading'}
                className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleNewsletterSubscribe}
                disabled={newsletterState === 'loading'}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(115deg,#F97316,#EA580C)" }}
              >
                {newsletterState === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>
            {newsletterMessage ? (
              <p className={`text-xs mt-3 ${newsletterState === 'error' ? 'text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                {newsletterMessage}
              </p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">No spam. Unsubscribe anytime.</p>
            )}
          </div>
        </div>

        {/* Row 1 — 6 link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-8 mb-12">
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Solutions" links={solutionsLinks} />
          <FooterColumn title="Channels" links={channelsLinks} />
          <div className="col-span-1">
            <FooterColumn title="Compare" links={compareLinks} />
            <div className="mt-2.5">
              <FooterNavLink link={{ label: "View all comparisons →" }} />
            </div>
          </div>
          <div className="col-span-1">
            <FooterColumn title="Alternatives" links={alternativesLinks} />
            <div className="mt-2.5">
              <FooterNavLink link={{ label: "View all alternatives →" }} />
            </div>
          </div>
          <FooterColumn title="Resources" links={resourcesLinks} />
        </div>

        {/* Row 2 — Company */}
        <div className="mb-12">
          <div className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-5">
            Company
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-2.5">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <FooterNavLink link={link} />
              </li>
            ))}
          </ul>
        </div>

        {/* Trust & compliance badges */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-4">
            Trust &amp; compliance
          </div>
          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-600 dark:text-gray-400"
              >
                <span className="text-orange-500">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Legal hub */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10">
            <div className="sm:w-48 flex-shrink-0">
              <div className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-2">
                Legal hub
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Every policy governing how we handle your data, content, and account.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {legalLinks.map((link, i) => (
                <React.Fragment key={link.label}>
                  {i > 0 && <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>}
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
            © {currentYear} shoutlyai — <span className="font-semibold text-gray-900 dark:text-white">Qubixel Technologies Private Limited</span>. All rights reserved.
            <span className="block sm:inline sm:ml-1">smart ai powering your social media for the next 365 days.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Language / region — no i18n implemented yet, shown inactive */}
            <span className="text-xs text-gray-400 dark:text-gray-600 cursor-not-allowed select-none" title="Coming soon">
              English ▾
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-600 cursor-not-allowed select-none" title="Coming soon">
              Global ▾
            </span>
            <a
              href="/sitemap.xml"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Sitemap
            </a>

            <div className="flex items-center gap-3.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
              {/* Theme toggle — no site-wide dark mode wired up yet, shown inactive */}
              <span
                className="text-gray-300 dark:text-gray-700 cursor-not-allowed"
                title="Coming soon"
                aria-label="Toggle theme (coming soon)"
              >
                <FaMoon size={15} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
