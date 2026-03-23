import React from 'react';
import Image from "next/image";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: "Who We Help",
      links: [
        { category: "🏢 Local Business", sublinks: ["Real Estate", "Food & Beverage", "Retail / E‑comm", "Beauty & Wellness"] },
        { category: "💼 Professional Services", sublinks: ["Finance & Legal", "Education & Coaching", "Healthcare", "Business Consulting"] },
        { category: "🏋️ Lifestyle Brands", sublinks: ["Health & Fitness", "Hospitality & Tourism", "Pet Services", "Nonprofits"] },
        { category: "🏗️ Specialized Industries", sublinks: ["Construction & Trades", "Automotive", "Technology", "Home Services"] }
      ]
    },
    {
      title: "Product",
      links: [
        { label: "Who We Help", href: "/#who-we-help" },
        { label: "Browse Our Library", href: "/#library" },
        { label: "Generate 365 days Content", href: "/#generator" },
        { label: "Plans & Pricing", href: "/#pricing" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "https://blog.shoutlyai.com/" },
        { label: "Help Center", href: "/help-center" },
        { label: "Join Community", href: "/join-community" },
        { label: "Success Stories", href: "/case-studies" },
        { label: "Free Editorial Calendar", href: "/free-editorial" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about-us" },
        { label: "Contact Us", href: "/contact-us" },
        { label: "Press & Media", href: "/press-media" },
        { label: "Careers", href: "/careers" },
        { label: "Affiliate Program", href: "/affiliate-program" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61583485633639", label: "Facebook" },
    { icon: Twitter, href: "https://x.com/shoutlyai", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/ai.shoutly/", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/shoutlyai/", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  const contactInfo = [
    { icon: Mail, text: "hello@shoutlyai.com", href: "mailto:hello@shoutlyai.com" },
    { icon: Phone, text: "+91 (990) 170-0660", href: "tel:+919901700660" },
    { icon: MapPin, text: "New York | Bangalore", href: "#" }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="container mx-auto px-4 py-16">

        {/* Logo and Tagline */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-28 h-10 sm:w-40 sm:h-14">
              <a href="/">
                <Image
                  src="/images/logo2.png"
                  alt="Shoutly AI logo"
                  width={160}
                  height={56}
                  sizes="(max-width: 640px) 112px, 160px"
                  className="w-28 h-10 sm:w-40 sm:h-14 object-contain"
                />
              </a>
            </div>
          </div>
          <p className="text-gray-400 max-w-md">
            AI-powered social media automation. One prompt → 365 days.
          </p>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Section 1: Who We Help (Spans 2 columns) */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white/90">{footerSections[0].title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(footerSections[0].links as any[]).map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-medium text-blue-400 mb-3">{category.category}</h4>
                  <ul className="space-y-2">
                    {category.sublinks.map((linkText: string, linkIdx: number) => (
                      <li key={linkIdx}>
                        <a 
                          
                          className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center group"
                        >
                          <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {linkText}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sections 2, 3, 4: Product, Resources, Company */}
          {footerSections.slice(1).map((section, idx) => (
            <div key={idx}>
              <h3 className="text-lg font-semibold mb-6 text-white/90">{section.title}</h3>
              <ul className="space-y-3">
                {(section.links as any[]).map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a 
                      href={link.href} 
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center group"
                    >
                      <ChevronRight className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact and Social Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              {contactInfo.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.text}</span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Follow Us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} shoutly ai. all rights reserved. smart ai powering your social media for the next 365 days.
            </p>
            <div className="flex gap-6">
              {[
                { name: "Privacy Policy", href: "/policy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Cookie Policy", href: "/cookie" }
              ].map((policy) => (
                <a 
                  key={policy.name} 
                  href={policy.href} 
                  className="text-gray-500 hover:text-[#f97316] text-sm transition-colors"
                >
                  {policy.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;