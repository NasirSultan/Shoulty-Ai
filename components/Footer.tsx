'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

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
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">
          
          {/* COL 1 — WHO WE HELP (Local + Lifestyle) */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Who We Help</div>
            <div className="space-y-8">
              {/* Local Business */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Local Business</h4>
                <ul className="space-y-2">
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Real Estate</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Food & Beverage</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Retail / E‑Comm</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Beauty & Wellness</Link></li>
                </ul>
              </div>
              {/* Lifestyle Brands */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Lifestyle Brands</h4>
                <ul className="space-y-2">
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Health & Fitness</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Hospitality & Tourism</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Pet Services</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Nonprofits</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* COL 2 — PROFESSIONAL SERVICES + SPECIALIZED */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 opacity-0 pointer-events-none h-0">.</div>
            <div className="space-y-8">
              {/* Professional Services */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Professional Services</h4>
                <ul className="space-y-2">
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Finance & Legal</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Education & Coaching</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Healthcare</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Business Consulting</Link></li>
                </ul>
              </div>
              {/* Specialized Industries */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Specialized Industries</h4>
                <ul className="space-y-2">
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Construction & Trades</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Automotive</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Technology</Link></li>
                  <li><Link href="/who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Home Services</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* COL 3 — PRODUCT */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 pb-2 border-b border-slate-200">Product</div>
            <ul className="space-y-2">
              <li><Link href="/#who-we-help" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Who We Help</Link></li>
              <li><Link href="/#library" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Browse Our Library</Link></li>
              <li><Link href="/#generator" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Generate 365 Days Content</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Plans & Pricing</Link></li>
            </ul>
          </div>

          {/* COL 4 — RESOURCES + COMPANY */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 pb-2 border-b border-slate-200">Resources</div>
            <ul className="space-y-2 mb-8">
              <li><a href="https://blog.shoutlyai.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Blog</a></li>
              <li><Link href="/help-center" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Help Center</Link></li>
              <li><Link href="/join-community" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Join Community</Link></li>
              <li><Link href="/case-studies" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Success Stories</Link></li>
              <li><Link href="/free-editorial" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Free Editorial Calendar</Link></li>
            </ul>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 pb-2 border-b border-slate-200">Company</div>
            <ul className="space-y-2">
              <li><Link href="/about-us" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact-us" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Contact Us</Link></li>
              <li><Link href="/press-media" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Press & Media</Link></li>
              <li><Link href="/careers" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Careers</Link></li>
              <li><Link href="/affiliate-program" className="text-sm text-slate-600 hover:text-orange-600 transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* COL 5 — CONTACT + LEGAL HUB */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 pb-2 border-b border-slate-200">Contact</div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@shoutlyai.com" className="hover:text-orange-600 transition-colors">hello@shoutlyai.com</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Phone className="w-4 h-4" />
                <a href="tel:+919901700660" className="hover:text-orange-600 transition-colors">+91 (990) 170-0660</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4" />
                <span>New York | Bangalore</span>
              </div>
            </div>

            {/* Legal Hub - Chip Style */}
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-200">Legal Hub</div>
            <div className="flex flex-wrap gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-700 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
            <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
              © {currentYear} shoutlyai — <span className="font-semibold text-slate-700">Qubixel Technologies Private Limited</span>. All rights reserved.
              <span className="block sm:inline sm:ml-2 text-slate-500">smart ai powering your social media for the next 365 days.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;