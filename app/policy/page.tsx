import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      {/* Container */}
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            Privacy Policy
          </h1>
        </header>

        {/* Main Content Card */}
        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          {/* 1. Introduction */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Introduction
            </h2>
            <p className="mb-4 text-[#4b5563]">
              Welcome to ShoutlyAI, a product offered by <strong>Qubixel Technologies Private Limited</strong> ("Company," "we," "our," "us"). We respect
              your privacy and are committed to protecting your personal data.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website{" "}
              <a
                href="https://shoutlyai.com"
                className="text-[#f97316] font-[500] hover:underline"
              >
                shoutlyai.com
              </a>{" "}
              and use our AI-powered social media automation platform.
            </p>
            <p className="text-[#4b5563]">
              Please read this policy carefully. By accessing or using our
              Service, you consent to the practices described herein. For EU residents, this policy complies with the General Data Protection Regulation (GDPR). For California residents, it complies with the CCPA/CPRA.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. Information We Collect
            </h2>

            <h3 className="text-[1.3rem] font-[600] mt-6 mb-4">
              2.1 Information You Provide Directly
            </h3>
            <div className="overflow-x-auto border border-[#f0f0f0] rounded-2xl mb-6">
              <table className="w-full text-left border-collapse text-[0.95rem]">
                <thead>
                  <tr className="bg-[#f97316] text-white">
                    <th className="p-4 font-[600]">Category</th>
                    <th className="p-4 font-[600]">Examples</th>
                  </tr>
                </thead>
                <tbody className="text-[#4b5563]">
                  <tr className="border-b border-[#f0f0f0] hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">
                      Account Information
                    </td>
                    <td className="p-4">
                      Name, email address, password, company name, billing
                      address
                    </td>
                  </tr>
                  <tr className="border-b border-[#f0f0f0] hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">
                      Payment Information
                    </td>
                    <td className="p-4">
                      Credit card details (processed securely via third-parties)
                    </td>
                  </tr>
                  <tr className="hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">Content</td>
                    <td className="p-4">
                      Prompts, AI posts, branded content, images
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-[1.3rem] font-[600] mt-6 mb-4">
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc ml-8 mb-6 text-[#4b5563] space-y-2">
              <li>
                <strong>Usage Data:</strong> IP address, browser type, pages visited, time spent
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> See our <a href="/cookie" className="text-[#f97316] hover:underline">Cookie Policy</a>
              </li>
            </ul>

            <h3 className="text-[1.3rem] font-[600] mt-6 mb-4">
              2.3 Information from Third Parties
            </h3>
            <ul className="list-disc ml-8 mb-6 text-[#4b5563] space-y-2">
              <li>
                <strong>Social Media Platforms:</strong> Access based on your
                connection permissions.
              </li>
              <li>
                <strong>Payment Processors:</strong> Billing confirmation
                status (Stripe, Razorpay).
              </li>
            </ul>
          </section>

          {/* 3. Legal Bases */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Legal Bases for Processing (GDPR Article 6)
            </h2>
            <ul className="list-disc ml-8 mb-6 text-[#4b5563] space-y-2">
              <li><strong>Contract performance:</strong> To provide our Service to you</li>
              <li><strong>Legitimate interests:</strong> To improve our Service, prevent fraud</li>
              <li><strong>Consent:</strong> For marketing communications and cookies</li>
              <li><strong>Legal obligation:</strong> To comply with tax and regulatory requirements</li>
            </ul>
          </section>

          {/* 4. Usage & Legal Basis */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. How We Use Your Information
            </h2>
            <div className="bg-[#fff7ed] border-l-4 border-[#f97316] p-6 rounded-2xl mb-6">
              <p className="m-0 font-[500]">
                <strong className="text-[#f97316]">Note:</strong> We do{" "}
                <strong>NOT</strong> sell your personal information to third
                parties.
              </p>
            </div>
            <p className="text-[#4b5563] mb-4">We use your data to:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Provide, operate, and maintain our Service</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns and trends</li>
            </ul>
          </section>

          {/* 5. Service Providers Grid */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. Sharing Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {[
                { title: "☁️ Cloud Hosting", desc: "AWS, Google Cloud" },
                { title: "💳 Payment Processors", desc: "Stripe, Razorpay" },
                { title: "📊 Analytics Services", desc: "Google Analytics, Mixpanel" },
                { title: "💬 Customer Support", desc: "Intercom, Zendesk" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[20px] p-6 hover:border-[#f97316] hover:shadow-lg transition-all"
                >
                  <h4 className="text-[#f97316] font-bold text-lg mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#4b5563]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. International Data Transfers
            </h2>
            <p className="text-[#4b5563]">
              Your information may be transferred to and processed in countries other than your own. For transfers from the EEA to non-EEA countries, we use Standard Contractual Clauses (SCCs) approved by the European Commission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              7. Data Retention
            </h2>
            <p className="text-[#4b5563]">
              We retain your personal data for as long as your account is active or as needed to provide you with our Service. After account deletion, we retain anonymized data for analytics and legal compliance for up to 7 years.
            </p>
          </section>

          {/* 8. Your Rights */}
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              8. Your Rights and Choices (GDPR & CCPA)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {["Access", "Correction", "Deletion", "Portability", "Restrict", "Object"].map(
                (right) => (
                  <div
                    key={right}
                    className="bg-[#faf9f6] border border-[#f0f0f0] rounded-2xl p-4"
                  >
                    <strong className="text-[#f97316] block mb-1">
                      {right}
                    </strong>
                    <span className="text-sm text-[#4b5563]">
                      Exercise your right to {right.toLowerCase()} your data.
                    </span>
                  </div>
                ),
              )}
            </div>
            <p className="mt-6 text-[#4b5563]">
              To exercise these rights, email{" "}
              <a
                href="mailto:privacy@shoutlyai.com"
                className="text-[#f97316] font-medium underline"
              >
                privacy@shoutlyai.com
              </a>
              . We will respond within 30 days (GDPR) or 45 days (CCPA).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-[#4b5563]">
              Our Service is not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with data, please contact us.
            </p>
          </section>

          {/* 11. Contact */}
          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              11. Contact Us
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 Data Protection Officer: <a href="mailto:dpo@shoutlyai.com" className="text-[#f97316] hover:underline">dpo@shoutlyai.com</a></p>
              <p>📧 Privacy Inquiries: <a href="mailto:privacy@shoutlyai.com" className="text-[#f97316] hover:underline">privacy@shoutlyai.com</a></p>
              <p>📍 Address: JP Nagar 8th Phase, Karnataka 560083, India</p>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-[#6b7280] text-sm border-t border-[#eef2f6] pt-8">
          © 2026 ShoutlyAI — A product of Qubixel Technologies Private Limited.<br />
          This Privacy Policy complies with GDPR (EU 2016/679), CCPA/CPRA, and India's DPDP Act 2023.
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
