"use client";

import React, { useState } from "react";

const DELETABLE_DATA = [
  { title: "Personal Profile Information", sub: "Name, email address, profile photo, and account details" },
  { title: "Connected Facebook Account Data", sub: "All data obtained via Facebook Login and Facebook API integrations" },
  { title: "Connected Instagram Account Data", sub: "Profile data, media permissions, and Instagram Graph API tokens" },
  { title: "Connected LinkedIn Account Data", sub: "Profile information and LinkedIn API access tokens" },
  { title: "Google Business Profile Data", sub: "Connected GBP locations, post history, and Google API tokens" },
  { title: "X, Threads, YouTube & Other Integrations", sub: "All connected social platform data, tokens, and permissions" },
  { title: "AI-Generated Content", sub: "Posts, captions, hashtag sets, Reel scripts, and image descriptions" },
  { title: "Scheduled & Published Posts", sub: "All post history, drafts, and queued content across all platforms" },
  { title: "Brand Assets & Brand Kit", sub: "Logos, colour palettes, fonts, and brand voice settings" },
  { title: "Uploaded Images & Videos", sub: "All media files stored in your ShoutlyAI media library" },
  { title: "Content Calendar", sub: "Your full 365-day planned calendar and campaign schedules" },
  { title: "API Tokens & Integrations", sub: "All stored OAuth tokens and third-party integration credentials" },
  { title: "Analytics & Reporting Data", sub: "Historical performance reports and engagement metrics stored by ShoutlyAI" },
  { title: "Preferences & Settings", sub: "Notification preferences, language settings, and account configurations" },
];

const FACEBOOK_STEPS = [
  { title: "Open Facebook", desc: "Log in to your Facebook account on the web or mobile app." },
  { title: "Go to Settings & Privacy", desc: "Click your profile icon (top right) and select Settings & Privacy." },
  { title: "Select Settings", desc: "From the dropdown menu, click Settings." },
  { title: "Open Apps and Websites", desc: "In the left-hand menu, navigate to Apps and Websites." },
  { title: "Find ShoutlyAI", desc: "Locate ShoutlyAI in your list of connected applications." },
  { title: "Click Remove", desc: "Select ShoutlyAI and click Remove. This disconnects your Facebook account from ShoutlyAI. To permanently delete your stored data from our servers, also submit a deletion request using one of the options above." },
];

const FAQS = [
  {
    q: "Can I recover my account after deletion?",
    a: "No. Once your account has been permanently deleted, it cannot be restored. All data — including your content calendar, brand kit, generated posts, uploaded media, and connected account information — is irreversibly removed from our systems. Please make sure you have exported any data you wish to keep before submitting your deletion request.",
  },
  {
    q: "Will my scheduled posts be deleted?",
    a: "Yes. All scheduled posts, drafts, generated content, uploaded media, and related assets stored by ShoutlyAI will be permanently removed. Please note that posts already published to your social media platforms prior to deletion are controlled by those platforms and subject to their own deletion policies.",
  },
  {
    q: "Will my Facebook and Instagram connections be removed?",
    a: "Yes. All connected Meta account information — including Facebook and Instagram access tokens, account IDs, permissions, and any data retrieved through the Meta Graph API — stored by ShoutlyAI will be deleted as part of the deletion process. We recommend also removing ShoutlyAI from your Facebook Apps and Websites settings for complete disconnection.",
  },
  {
    q: "Will deleting my account cancel my subscription?",
    a: "No. Deleting your account does not automatically cancel any active subscription or stop billing. Please cancel your subscription from within your account settings before requesting permanent account deletion. Contact privacy@shoutlyai.com if you need assistance cancelling your subscription.",
  },
  {
    q: "How will I know my request has been completed?",
    a: "You will receive an email confirmation at your registered email address after your deletion request has been successfully processed. This confirmation will state that all personal data associated with your account has been permanently deleted from ShoutlyAI's systems.",
  },
  {
    q: "Is there any charge for requesting data deletion?",
    a: "No. Submitting a data deletion request is completely free of charge. This is your right under applicable privacy regulations including the DPDP Act (India), GDPR (European Union), CCPA (California), and Meta Platform requirements.",
  },
];

const DataDeletionPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1240px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            User Data Deletion
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: August 2026 · DPDP · GDPR · CCPA · Meta Platform Compliant</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <div className="bg-[#fff7ed] border border-[#fed7aa] p-6 rounded-2xl mb-8">
            <p className="m-0 font-[500] text-[#9a3412]">
              🗑️ At ShoutlyAI, we respect your privacy and give you full control over your personal data. You may request deletion of your account and all associated information at any time — no questions asked.
            </p>
          </div>

          {/* Key facts */}
          <div className="grid grid-cols-3 gap-px bg-[#f0f0f0] border border-[#f0f0f0] rounded-2xl overflow-hidden mb-12 text-center">
            <div className="bg-white p-4">
              <div className="text-[1.3rem] font-[800] text-[#1f2937]">7&ndash;30</div>
              <div className="text-[0.7rem] font-[600] text-[#9ca3af] uppercase tracking-wide">Business days</div>
            </div>
            <div className="bg-white p-4">
              <div className="text-[1.3rem] font-[800] text-[#1f2937]">100%</div>
              <div className="text-[0.7rem] font-[600] text-[#9ca3af] uppercase tracking-wide">Data deleted</div>
            </div>
            <div className="bg-white p-4">
              <div className="text-[1.3rem] font-[800] text-[#1f2937]">Free</div>
              <div className="text-[0.7rem] font-[600] text-[#9ca3af] uppercase tracking-wide">No charge</div>
            </div>
          </div>

          {/* What can be deleted */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Information You Can Request Us to Delete
            </h2>
            <p className="text-[#4b5563] mb-6">
              When you submit a data deletion request, the following categories of data stored by ShoutlyAI will be permanently and irreversibly removed from our systems.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {DELETABLE_DATA.map((item) => (
                <div key={item.title} className="flex items-start gap-3 bg-[#faf9f6] border border-[#f0f0f0] rounded-2xl p-4">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] text-[11px] font-[800] flex items-center justify-center mt-0.5">✓</span>
                  <div>
                    <div className="text-[0.9rem] font-[600] text-[#1f2937]">{item.title}</div>
                    <div className="text-[0.8rem] text-[#6b7280] mt-0.5">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-5 flex items-start gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>
                <div className="text-[0.9rem] font-[700] text-[#92400e] mb-1">Information That May Be Retained</div>
                <div className="text-[0.85rem] text-[#78350f] leading-relaxed">
                  For legal, financial, fraud prevention, security, or regulatory compliance purposes, certain records may be retained where required by applicable law (such as transaction records, invoices, or legal correspondence). Such information will <strong>never</strong> be used for marketing or product purposes after your deletion request has been processed.
                </div>
              </div>
            </div>
          </section>

          {/* How to request */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. How to Request Data Deletion
            </h2>
            <p className="text-[#4b5563] mb-6">
              Choose the option that works best for your situation. All methods result in the same outcome: permanent, irreversible deletion of your data from ShoutlyAI&rsquo;s systems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Option 1 */}
              <div className="border border-[#f0f0f0] rounded-2xl p-5 flex flex-col">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white text-[0.75rem] font-[800] flex items-center justify-center mb-3">1</div>
                <div className="text-[0.95rem] font-[700] text-[#1f2937] mb-1">Delete Your Account</div>
                <div className="text-[0.75rem] text-[#9ca3af] mb-3">Fastest method, if you have account access</div>
                <ol className="text-[0.8rem] text-[#4b5563] space-y-1.5 mb-4 list-decimal list-inside flex-1">
                  <li>Sign in to your ShoutlyAI account</li>
                  <li>Navigate to <strong>Settings</strong></li>
                  <li>Select <strong>Delete Account</strong></li>
                  <li>Confirm your deletion request</li>
                </ol>
                <a href="/sign-in" className="text-center bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white rounded-xl py-2.5 text-[0.85rem] font-[700] hover:opacity-90 transition-opacity">
                  Sign in to delete account
                </a>
              </div>

              {/* Option 2 */}
              <div className="border border-[#f0f0f0] rounded-2xl p-5 flex flex-col">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white text-[0.75rem] font-[800] flex items-center justify-center mb-3">2</div>
                <div className="text-[0.95rem] font-[700] text-[#1f2937] mb-1">Request by Email</div>
                <div className="text-[0.75rem] text-[#9ca3af] mb-3">If you cannot access your account</div>
                <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-xl p-3 text-[0.78rem] text-[#4b5563] space-y-1 mb-4 flex-1">
                  <div><span className="font-[700] text-[#9ca3af] uppercase text-[0.65rem] tracking-wide">To</span><br />privacy@shoutlyai.com</div>
                  <div><span className="font-[700] text-[#9ca3af] uppercase text-[0.65rem] tracking-wide">Subject</span><br />Data Deletion Request</div>
                  <div><span className="font-[700] text-[#9ca3af] uppercase text-[0.65rem] tracking-wide">Include</span><br />Full name, registered email</div>
                </div>
                <a href="mailto:privacy@shoutlyai.com?subject=Data%20Deletion%20Request" className="text-center bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white rounded-xl py-2.5 text-[0.85rem] font-[700] hover:opacity-90 transition-opacity">
                  Send deletion email
                </a>
              </div>

              {/* Option 3 */}
              <div className="border border-[#f0f0f0] rounded-2xl p-5 flex flex-col">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white text-[0.75rem] font-[800] flex items-center justify-center mb-3">3</div>
                <div className="text-[0.95rem] font-[700] text-[#1f2937] mb-1">Meta / Facebook Data</div>
                <div className="text-[0.75rem] text-[#9ca3af] mb-3">If you connected Facebook or Instagram</div>
                <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-xl p-3 text-[0.78rem] text-[#4b5563] space-y-1 mb-4 flex-1">
                  <div><span className="font-[700] text-[#9ca3af] uppercase text-[0.65rem] tracking-wide">To</span><br />privacy@shoutlyai.com</div>
                  <div><span className="font-[700] text-[#9ca3af] uppercase text-[0.65rem] tracking-wide">Subject</span><br />Facebook Data Deletion Request</div>
                  <div><span className="font-[700] text-[#9ca3af] uppercase text-[0.65rem] tracking-wide">Include</span><br />Full name, registered email, Facebook account email</div>
                </div>
                <a href="mailto:privacy@shoutlyai.com?subject=Facebook%20Data%20Deletion%20Request" className="text-center bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white rounded-xl py-2.5 text-[0.85rem] font-[700] hover:opacity-90 transition-opacity">
                  Send Facebook deletion request
                </a>
              </div>
            </div>

            {/* Facebook disconnect steps */}
            <div className="border border-[#f0f0f0] rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#f97316] to-[#fb923c] px-6 py-4 flex items-center gap-3">
                <span className="text-xl">🔗</span>
                <div>
                  <div className="text-white text-[0.9rem] font-[700]">Remove ShoutlyAI from Your Facebook Settings</div>
                  <div className="text-white/70 text-[0.75rem] mt-0.5">Disconnects your Facebook account immediately. Submit a deletion request above to also remove your data from our servers.</div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {FACEBOOK_STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white text-[0.7rem] font-[800] flex items-center justify-center">{i + 1}</div>
                    <div>
                      <div className="text-[0.85rem] font-[700] text-[#1f2937]">{step.title}</div>
                      <div className="text-[0.8rem] text-[#6b7280] mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Processing time + contact */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Processing Time &amp; Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="bg-gradient-to-r from-[#f97316] to-[#fb923c] rounded-2xl p-6 text-center text-white mb-4">
                  <div className="text-[2.2rem] font-[800] leading-none mb-1">7&ndash;30</div>
                  <div className="text-[0.8rem] font-[600] text-white/80 mb-2">Business Days</div>
                  <div className="text-[0.8rem] text-white/80">You will receive an email confirmation once the deletion process has been fully completed.</div>
                </div>
                <p className="text-[0.85rem] text-[#4b5563] bg-[#faf9f6] border border-[#f0f0f0] rounded-xl p-4">
                  <strong className="text-[#1f2937]">Note:</strong> Deleting your account does not automatically cancel an active subscription. Please cancel any active subscription before submitting your deletion request.
                </p>
              </div>
              <div>
                <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-2xl p-6 mb-4">
                  <p className="font-bold text-[#1f2937] mb-2">Need help?</p>
                  <p className="text-[#4b5563] text-[0.9rem]">
                    📧 Email us at{" "}
                    <a href="mailto:privacy@shoutlyai.com" className="text-[#f97316] hover:underline">
                      privacy@shoutlyai.com
                    </a>
                  </p>
                  <p className="text-[#4b5563] text-[0.9rem] mt-1">
                    🌐 Visit{" "}
                    <a href="https://shoutlyai.com" className="text-[#f97316] hover:underline">
                      shoutlyai.com
                    </a>
                  </p>
                </div>
                <p className="text-[0.85rem] text-[#4b5563] bg-[#faf9f6] border border-[#f0f0f0] rounded-xl p-4">
                  <strong className="text-[#1f2937]">Response time:</strong> Our support team typically responds within 2 business days. For urgent privacy matters, include &ldquo;URGENT&rdquo; in your email subject line.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. Questions About Data Deletion
            </h2>
            <div className="border border-[#f0f0f0] rounded-2xl overflow-hidden">
              {FAQS.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={item.q} className={i !== FAQS.length - 1 ? "border-b border-[#f0f0f0]" : ""}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 text-[0.9rem] font-[600] text-[#1f2937] hover:bg-[#faf9f6] transition-colors"
                    >
                      {item.q}
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#f0f0f0] flex items-center justify-center text-[#9ca3af] text-sm transition-transform ${open ? "bg-gradient-to-r from-[#f97316] to-[#fb923c] border-transparent text-white rotate-45" : ""}`}
                      >
                        +
                      </span>
                    </button>
                    {open && (
                      <div className="px-5 pb-4 text-[0.85rem] text-[#4b5563] leading-relaxed">{item.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Compliance */}
          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. Compliance Statement
            </h2>
            <div className="bg-[#1f2937] rounded-2xl p-6 md:p-7 text-white">
              <div className="text-[0.95rem] font-[700] mb-2">ShoutlyAI is committed to protecting your privacy.</div>
              <p className="text-[0.85rem] text-white/70 leading-relaxed mb-3">
                This User Data Deletion page is provided to comply with Meta Platform requirements and applicable data protection regulations, ensuring users can request deletion of their personal data associated with Facebook Login, Instagram connections, and other connected platform integrations.
              </p>
              <p className="text-[0.85rem] text-white/70 leading-relaxed mb-4">
                We process all deletion requests in accordance with the India Digital Personal Data Protection Act 2023, the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and Meta Platform Policy for User Data Deletion. ShoutlyAI is operated by <strong className="text-white">Qubixel Technologies Private Limited</strong>, registered in India.
              </p>
              <div className="flex flex-wrap gap-2">
                {["DPDP Act 2023", "GDPR Compliant", "CCPA Compliant", "Meta Platform Policy", "SSL Secured", "AWS Cloud Hosted"].map((badge) => (
                  <span key={badge} className="text-[0.7rem] font-[700] px-3 py-1 rounded-full bg-[#f97316]/20 border border-[#f97316]/30 text-[#fdba74]">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[0.85rem] text-[#4b5563] mt-4">
              For more information about how we handle your personal data, please review our{" "}
              <a href="/policy" className="text-[#f97316] hover:underline font-[600]">Privacy Policy</a>,{" "}
              <a href="/terms" className="text-[#f97316] hover:underline font-[600]">Terms of Service</a>,{" "}
              <a href="/gdpr" className="text-[#f97316] hover:underline font-[600]">GDPR Policy</a>,{" "}
              <a href="/ccpa" className="text-[#f97316] hover:underline font-[600]">CCPA Policy</a>, and{" "}
              <a href="/dpdp" className="text-[#f97316] hover:underline font-[600]">DPDP Policy</a>.
            </p>
          </section>
        </main>

        <footer className="text-center mt-12 text-[#6b7280] text-sm border-t border-[#eef2f6] pt-8">
          © 2026 ShoutlyAI — A product of Qubixel Technologies Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DataDeletionPage;
