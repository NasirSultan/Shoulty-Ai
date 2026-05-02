import React from "react";

const CCPAPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            California Privacy Notice (CCPA/CPRA)
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026 | California Consumer Privacy Act (CCPA) as amended by CPRA</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Introduction
            </h2>
            <p className="text-[#4b5563]">
              This California Privacy Notice applies to <strong>California residents</strong> ("consumers" or "you") and supplements our main <a href="/policy" className="text-[#f97316] hover:underline">Privacy Policy</a>. It describes your rights under the California Consumer Privacy Act of 2018 (CCPA) as amended by the California Privacy Rights Act of 2020 (CPRA).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. Categories of Personal Information We Collect
            </h2>
            <div className="overflow-x-auto border border-[#f0f0f0] rounded-2xl mb-6">
              <table className="w-full text-left border-collapse text-[0.95rem]">
                <thead>
                  <tr className="bg-[#f97316] text-white">
                    <th className="p-4 font-[600]">Category</th>
                    <th className="p-4 font-[600]">Examples</th>
                    <th className="p-4 font-[600]">Collected?</th>
                  </tr>
                </thead>
                <tbody className="text-[#4b5563]">
                  <tr className="border-b border-[#f0f0f0] hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">Identifiers</td>
                    <td className="p-4">Name, email, IP address, account ID</td>
                    <td className="p-4 text-center">✅ Yes</td>
                  </tr>
                  <tr className="border-b border-[#f0f0f0] hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">Commercial Information</td>
                    <td className="p-4">Subscription plan, payment history</td>
                    <td className="p-4 text-center">✅ Yes</td>
                  </tr>
                  <tr className="border-b border-[#f0f0f0] hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">Internet Activity</td>
                    <td className="p-4">Browsing history, interactions with our Service</td>
                    <td className="p-4 text-center">✅ Yes</td>
                  </tr>
                  <tr className="border-b border-[#f0f0f0] hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">Geolocation Data</td>
                    <td className="p-4">Approximate location based on IP address</td>
                    <td className="p-4 text-center">✅ Yes</td>
                  </tr>
                  <tr className="hover:bg-[#faf9f6]">
                    <td className="p-4 font-bold text-[#1f2937]">Sensitive Personal Information</td>
                    <td className="p-4">Account login credentials (password)</td>
                    <td className="p-4 text-center">✅ Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Sources of Personal Information
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Directly from you (account registration, forms)</li>
              <li>Automatically from your device (cookies, analytics)</li>
              <li>Third-party services (social media platforms you connect)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. Business Purposes for Collection
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Providing our Service (authentication, content generation, scheduling)</li>
              <li>Processing payments and preventing fraud</li>
              <li>Customer support and troubleshooting</li>
              <li>Improving and developing new features</li>
              <li>Security monitoring and legal compliance</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. Your Rights Under CCPA/CPRA
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Right to Know (Access):</strong> Request disclosure of specific pieces of personal information collected, used, and shared about you.</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information, subject to exceptions (e.g., legal compliance).</li>
              <li><strong>Right to Correct:</strong> Request correction of inaccurate personal information.</li>
              <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do NOT sell your personal information. However, you may opt-out of "sharing" for cross-context behavioral advertising.</li>
              <li><strong>Right to Limit Use of Sensitive Information:</strong> You may request that we limit the use of your sensitive personal information to what is necessary for providing our Service.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights (e.g., charging different prices).</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. How to Exercise Your Rights
            </h2>
            <p className="text-[#4b5563] mb-4">
              To exercise any of the above rights, please submit a verifiable request to:
            </p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Email: <a href="mailto:privacy@shoutlyai.com" className="text-[#f97316] hover:underline">privacy@shoutlyai.com</a> with "CCPA Request" in the subject line</li>
              <li>Toll-free number: (Coming soon) or webform at shoutlyai.com/privacy/ccpa</li>
            </ul>
            <p className="mt-4 text-[#4b5563]">
              We will respond within <strong>45 days</strong> (extendable by an additional 45 days when reasonably necessary).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              8. Do Not Sell or Share My Personal Information
            </h2>
            <p className="text-[#4b5563] mb-4">
              <strong>We do not sell your personal information</strong> as defined by the CCPA. We also do not "share" your personal information for cross-context behavioral advertising (i.e., we do not use third-party marketing cookies without your consent).
            </p>
            <p className="text-[#4b5563]">
              To opt-out of any future sharing (e.g., if we change our practices), you can enable Global Privacy Control (GPC) signals in your browser or use our "Your Privacy Choices" link.
            </p>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              10. Contact Information
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 CCPA Inquiries: <a href="mailto:ccpa@shoutlyai.com" className="text-[#f97316] hover:underline">ccpa@shoutlyai.com</a></p>
              <p>📧 General Privacy: <a href="mailto:privacy@shoutlyai.com" className="text-[#f97316] hover:underline">privacy@shoutlyai.com</a></p>
              <p>📍 Address: JP Nagar 8th Phase, Karnataka 560083, India</p>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-[#6b7280] text-sm border-t border-[#eef2f6] pt-8">
          © 2026 ShoutlyAI — A product of Qubixel Technologies Private Limited.<br />
          This notice complies with the California Consumer Privacy Act (CCPA) as amended by the CPRA.
        </footer>
      </div>
    </div>
  );
};

export default CCPAPolicy;
