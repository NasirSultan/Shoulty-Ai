'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { label: "Privacy Policy", href: "/policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookie" },
    { label: "GDPR", href: "/policy" },
    { label: "CCPA", href: "/policy" },
    { label: "DPDP Act", href: "/policy" },
    { label: "Refunds", href: "/policy" },
    { label: "Security", href: "/policy" },
    { label: "DMCA", href: "/policy" },
    { label: "EULA", href: "/policy" }
  ];

  return (
    <footer className="bg-blue-950 border-t border-blue-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        
        {/* Main 5-Column Grid - Premium Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">
          
          {/* COL 1 — WHO WE HELP (Local + Lifestyle) */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-5">Who We Help</div>
            <div className="grid grid-cols-2 gap-6">
              {/* Local Business */}
              <div>
                <span className="block text-sm font-semibold text-white mb-3">Local Business</span>
                <ul className="space-y-2.5 text-sm text-blue-100">
                  <li>Real Estate</li>
                  <li>Food & Beverage</li>
                  <li>Retail / E‑Comm</li>
                  <li>Beauty & Wellness</li>
                </ul>
              </div>
              {/* Lifestyle Brands */}
              <div>
                <span className="block text-sm font-semibold text-white mb-3">Lifestyle Brands</span>
                <ul className="space-y-2.5 text-sm text-blue-100">
                  <li>Health & Fitness</li>
                  <li>Hospitality & Tourism</li>
                  <li>Pet Services</li>
                  <li>Nonprofits</li>
                </ul>
              </div>
            </div>
          </div>

          {/* COL 2 — PROFESSIONAL SERVICES + SPECIALIZED */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-5 h-5"></div>
            <div className="grid grid-cols-2 gap-6">
              {/* Professional Services */}
              <div>
                <span className="block text-sm font-semibold text-white mb-3">Professional Services</span>
                <ul className="space-y-2.5 text-sm text-blue-100">
                  <li>Finance & Legal</li>
                  <li>Education & Coaching</li>
                  <li>Healthcare</li>
                  <li>Business Consulting</li>
                </ul>
              </div>
              {/* Specialized Industries */}
              <div>
                <span className="block text-sm font-semibold text-white mb-3">Specialized Industries</span>
                <ul className="space-y-2.5 text-sm text-blue-100">
                  <li>Construction & Trades</li>
                  <li>Automotive</li>
                  <li>Technology</li>
                  <li>Home Services</li>
                </ul>
              </div>
            </div>
          </div>

          {/* COL 3 — PRODUCT */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-5">Product</div>
            <ul className="space-y-2.5">
              <li><Link href="/#who-we-help" className="text-sm text-blue-100 hover:text-white transition-colors">Who We Help</Link></li>
              <li><Link href="/#library" className="text-sm text-blue-100 hover:text-white transition-colors">Browse Our Library</Link></li>
              <li><Link href="/#generator" className="text-sm text-blue-100 hover:text-white transition-colors">Generate 365 Days Content</Link></li>
              <li><Link href="/pricing" className="text-sm text-blue-100 hover:text-white transition-colors">Plans & Pricing</Link></li>
            </ul>
          </div>

          {/* COL 4 — RESOURCES + COMPANY */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-5">Resources</div>
            <ul className="space-y-2.5 mb-8">
              <li><a href="https://blog.shoutlyai.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-100 hover:text-white transition-colors">Blog</a></li>
              <li><Link href="/help-center" className="text-sm text-blue-100 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/join-community" className="text-sm text-blue-100 hover:text-white transition-colors">Join Community</Link></li>
              <li><Link href="/case-studies" className="text-sm text-blue-100 hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link href="/free-editorial" className="text-sm text-blue-100 hover:text-white transition-colors">Free Editorial Calendar</Link></li>
            </ul>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-5">Company</div>
            <ul className="space-y-2.5">
              <li><Link href="/about-us" className="text-sm text-blue-100 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact-us" className="text-sm text-blue-100 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/press-media" className="text-sm text-blue-100 hover:text-white transition-colors">Press & Media</Link></li>
              <li><Link href="/careers" className="text-sm text-blue-100 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/affiliate-program" className="text-sm text-blue-100 hover:text-white transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* COL 5 — CONTACT + LEGAL HUB */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-5">Contact</div>
            <div className="space-y-3 mb-8 text-sm text-blue-100">
              <div>
                📧 <a href="mailto:hello@shoutlyai.com" className="hover:text-white transition-colors">hello@shoutlyai.com</a>
              </div>
              <div>
                📞 <a href="tel:+919901700660" className="hover:text-white transition-colors">+91 (990) 170-0660</a>
              </div>
              <div>
                📍 New York | Bangalore
              </div>
            </div>

            {/* Legal Hub - Chip Style */}
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">Legal Hub</div>
            <div className="flex flex-wrap gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs px-2.5 py-1.5 bg-blue-900 border border-blue-700 rounded-full text-blue-100 hover:border-blue-400 hover:bg-blue-800 hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-blue-200 text-center sm:text-left">
            © {currentYear} shoutlyai — <span className="font-semibold text-white">Qubixel Technologies Private Limited</span>. All rights reserved.
            <span className="block sm:inline sm:ml-1 text-blue-300">smart ai powering your social media for the next 365 days.</span>
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-900 px-3 py-1.5 rounded-full border border-blue-700 text-xs text-blue-100">
            <span>🌤️</span>
            <span>35°C</span>
            <span>Mostly sunny</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;