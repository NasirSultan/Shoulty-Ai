import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-[#faf9f6] text-[#1f2937] leading-relaxed">
      {/* Note: The CSS below can be moved to a global CSS file or a CSS module. 
        I've included a style tag here to maintain your exact branding from the HTML.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .policy-container { max-width: 1000px; margin: 0 auto; padding: 3rem 2rem; }
        .logo { 
          font-size: 2.2rem; font-weight: 800; 
          background: linear-gradient(135deg, #f97316, #fb923c);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          margin-bottom: 0.5rem; display: inline-block;
        }
        .policy-card {
          background: #ffffff; border-radius: 32px; padding: 3rem;
          box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.05); border: 1px solid #f0f0f0;
        }
        .section-title {
          font-size: 1.8rem; font-weight: 700; border-bottom: 2px solid #f97316;
          display: inline-block; margin-bottom: 1.5rem;
        }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin: 1.5rem 0; }
        .info-card { background: #faf9f6; border: 1px solid #f0f0f0; border-radius: 20px; padding: 1.5rem; }
        .prohibited-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0; }
        .prohibited-item { background: #faf9f6; border: 1px solid #f0f0f0; border-radius: 16px; padding: 1.2rem; }
        @media (max-width: 700px) {
          .info-grid, .prohibited-grid { grid-template-columns: 1fr; }
          .policy-card { padding: 2rem; }
        }
      `,
        }}
      />

      <div className="policy-container">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="logo">ShoutlyAI</div>
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        </header>

        {/* Main Content Card */}
        <main className="policy-card">
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="section-title">1. Agreement to Terms</h2>
            <p className="mb-4 text-gray-600">
              By accessing or using ShoutlyAI ("Company," "we," "our," "us"),
              you agree to be bound by these Terms of Service ("Terms"). If you
              disagree, do not access or use our Service.
            </p>
            <p className="text-gray-600">
              These Terms apply to all users, including visitors, registered
              users, and trial users.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <h2 className="section-title">2. Description of Service</h2>
            <p className="mb-4 text-gray-600">
              ShoutlyAI provides an AI-powered social media automation platform
              that:
            </p>
            <ul className="list-disc ml-8 mb-6 text-gray-600">
              <li>Generates social media content based on user prompts</li>
              <li>Creates images, reels, and festival-themed posts</li>
              <li>Automatically schedules content across multiple platforms</li>
              <li>Offers industry-specific templates</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <h2 className="section-title">3. Account Registration</h2>
            <h3 className="text-xl font-semibold mt-6 mb-2">3.1 Eligibility</h3>
            <p className="text-gray-600">
              You must be at least 18 years old to use our Service.
            </p>

            <div className="info-grid">
              <div className="info-card">
                <h4 className="text-[#f97316] font-bold mb-2">🆓 Free Trial</h4>
                <p className="text-sm">
                  Limited access for evaluation purposes
                </p>
              </div>
              <div className="info-card">
                <h4 className="text-[#f97316] font-bold mb-2">
                  💳 Paid Subscription
                </h4>
                <p className="text-sm">Full access based on chosen plan</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <h2 className="section-title">4. Subscriptions & Payments</h2>
            <div className="overflow-x-auto my-6 border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f97316] text-white">
                  <tr>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Billing</th>
                    <th className="p-4">Features</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">Starter</td>
                    <td className="p-4">Monthly</td>
                    <td className="p-4">365 AI posts, basic branding</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-800">
                      Growth{" "}
                      <span className="ml-2 bg-[#f97316] text-white text-[10px] px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    </td>
                    <td className="p-4">Monthly</td>
                    <td className="p-4">
                      Unlimited content, advanced branding
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: AI Content */}
          <section className="mb-12">
            <h2 className="section-title">5. AI-Generated Content</h2>
            <div className="bg-[#fff7ed] border-l-4 border-[#f97316] p-6 rounded-2xl my-6">
              <p className="m-0 text-gray-900">
                <strong className="text-[#f97316]">Important:</strong> You are
                solely responsible for reviewing and approving all content
                before publication.
              </p>
            </div>
          </section>

          {/* Section 6: Prohibited */}
          <section className="mb-12">
            <h2 className="section-title">6. Acceptable Use</h2>
            <div className="prohibited-grid">
              <div className="prohibited-item">
                <strong className="text-[#f97316] block mb-1">
                  🚫 Illegal Content
                </strong>
                <span className="text-sm text-gray-600">
                  Promoting illegal activities or hate speech
                </span>
              </div>
              <div className="prohibited-item">
                <strong className="text-[#f97316] block mb-1">
                  💻 Malicious Use
                </strong>
                <span className="text-sm text-gray-600">
                  Viruses, hacking, or disrupting Service
                </span>
              </div>
            </div>
          </section>

          {/* Section 11: Disclaimer */}
          <section className="mb-12">
            <h2 className="section-title">11. Disclaimer</h2>
            <div className="bg-[#1f2937] text-white p-8 rounded-2xl my-6">
              <p className="text-xl font-bold mb-4">
                THE SERVICE IS PROVIDED "AS IS".
              </p>
              <p className="text-gray-300">
                WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY AND
                ACCURACY OF AI CONTENT.
              </p>
            </div>
          </section>

          {/* Section 16: Contact */}
          <section className="mb-12">
            <h2 className="section-title">16. Contact Information</h2>
            <p className="text-gray-600">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:legal@shoutlyai.com"
                className="text-[#f97316] font-medium hover:underline"
              >
                legal@shoutlyai.com
              </a>
              <br />
              <strong>Address:</strong> JP Nagar 8th Phase, Karnataka 560083
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;
