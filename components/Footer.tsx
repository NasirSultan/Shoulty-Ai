'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube 
} from 'react-icons/fa';

const Footer = () => {
  const pathname = usePathname();
  if (pathname === "/dashboards" || pathname?.startsWith("/dashboards/")) return null;

  const currentYear = new Date().getFullYear();

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
    { icon: <FaFacebook size={18} />, href: "https://facebook.com/shoutlyai", label: "Facebook" },
    { icon: <FaInstagram size={18} />, href: "https://instagram.com/shoutlyai", label: "Instagram" },
    { icon: <FaTwitter size={18} />, href: "https://twitter.com/shoutlyai", label: "Twitter" },
    { icon: <FaLinkedin size={18} />, href: "https://linkedin.com/company/shoutlyai", label: "LinkedIn" },
    { icon: <FaYoutube size={18} />, href: "https://youtube.com/@shoutlyai", label: "YouTube" }
  ];

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        
        {/* Main 5-Column Grid - Premium Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">
          
          {/* COL 1 — WHO WE HELP (Local + Lifestyle) */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-5">Who We Help</div>
            <div className="grid grid-cols-2 gap-6">
              {/* Local Business */}
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Local Business</span>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><Link href="/real-estate.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Real Estate</Link></li>
                  <li><Link href="/Cafe.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Food & Beverage</Link></li>
                  <li><Link href="/textile.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Retail / E‑Comm</Link></li>
                  <li><Link href="/Dieticians.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Beauty & Wellness</Link></li>
                </ul>
              </div>
              {/* Lifestyle Brands */}
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Lifestyle Brands</span>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><Link href="/GYM.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Health & Fitness</Link></li>
                  <li><Link href="/package.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Hospitality & Tourism</Link></li>
                  <li><Link href="/Cafe.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pet Services</Link></li>
                  <li><Link href="/Business-Consultant.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Nonprofits</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* COL 2 — PROFESSIONAL SERVICES + SPECIALIZED */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-5 h-5"></div>
            <div className="grid grid-cols-2 gap-6">
              {/* Professional Services */}
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Professional Services</span>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><Link href="/mutual-fund.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Finance & Legal</Link></li>
                  <li><Link href="/COACHING-INSTITUTE.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Education & Coaching</Link></li>
                  <li><Link href="/physiotheraphy.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Healthcare</Link></li>
                  <li><Link href="/Business-Consultant.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Business Consulting</Link></li>
                </ul>
              </div>
              {/* Specialized Industries */}
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Specialized Industries</span>
                <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <li><Link href="/Construction-materials.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Construction & Trades</Link></li>
                  <li><Link href="/machinery.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Automotive</Link></li>
                  <li><Link href="/coding-academy.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Technology</Link></li>
                  <li><Link href="/interior.html" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home Services</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* COL 3 — PRODUCT */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-5">Product</div>
            <ul className="space-y-2.5">
              <li><Link href="/#who-we-help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Who We Help</Link></li>
              <li><Link href="/#library" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Browse Our Library</Link></li>
              <li><Link href="/#generator" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Generate 365 Days Content</Link></li>
              <li><Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Plans & Pricing</Link></li>
            </ul>
          </div>

          {/* COL 4 — RESOURCES + COMPANY */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-5">Resources</div>
            <ul className="space-y-2.5 mb-8">
              <li><a href="https://blog.shoutlyai.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
              <li><Link href="/help-center" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center</Link></li>
              <li><Link href="/join-community" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Join Community</Link></li>
              <li><Link href="/case-studies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Success Stories</Link></li>
              <li><Link href="/free-editorial" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Free Editorial Calendar</Link></li>
            </ul>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-5">Company</div>
            <ul className="space-y-2.5">
              <li><Link href="/about-us" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact-us" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/press-media" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Press & Media</Link></li>
              <li><Link href="/careers" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Careers</Link></li>
              <li><Link href="/affiliate-program" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* COL 5 — CONTACT + LEGAL HUB */}
          <div className="col-span-1">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-5">Contact</div>
            <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                📧 <a href="mailto:hello@shoutlyai.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">hello@shoutlyai.com</a>
              </div>
              <div>
                📞 <a href="tel:+919901700660" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">+91 (990) 170-0660</a>
              </div>
              <div>
                📍 New York | Bangalore
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex gap-4 mb-8">
              {socialLinks.map((social) => (
                <a 
                  key={social.label} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Legal Hub - Chip Style */}
            <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">Legal Hub</div>
            <div className="flex flex-wrap gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col items-center text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {currentYear} shoutlyai — <span className="font-semibold text-gray-900 dark:text-white">Qubixel Technologies Private Limited</span>. All rights reserved.
            <span className="block sm:inline sm:ml-1 text-gray-500 dark:text-gray-400">smart ai powering your social media for the next 365 days.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;