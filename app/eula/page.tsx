import React from "react";

const EULAPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            End User License Agreement (EULA)
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. License Grant
            </h2>
            <p className="text-[#4b5563]">
              <strong>Qubixel Technologies Private Limited</strong> grants you a non-exclusive, non-transferable, revocable license to access and use the ShoutlyAI platform (the "Software") solely for your internal business or personal purposes, subject to these terms and your compliance with our <a href="/terms" className="text-[#f97316] hover:underline">Terms of Service</a>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. License Restrictions
            </h2>
            <p className="text-[#4b5563] mb-4">You may NOT:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Copy, modify, or create derivative works of the Software</li>
              <li>Reverse engineer, decompile, or disassemble the Software (including the AI models)</li>
              <li>Rent, lease, lend, sublicense, or resell the Software</li>
              <li>Use the Software to develop a competing product</li>
              <li>Remove any proprietary notices or labels</li>
              <li>Exceed the usage limits of your subscription plan</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Ownership
            </h2>
            <p className="text-[#4b5563]">
              The Software, including all intellectual property rights (copyrights, trade secrets, patents, and trademarks), is owned by <strong>Qubixel Technologies Private Limited</strong> or its licensors. This EULA does not transfer any ownership rights to you.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. User Content License
            </h2>
            <p className="text-[#4b5563]">
              You retain ownership of the content you create using our Software. However, you grant us a worldwide, royalty-free license to host, store, and process your content to provide the Service. You also grant us the right to use anonymized and aggregated data for improving our AI models.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. Third-Party Software
            </h2>
            <p className="text-[#4b5563]">
              Our Software may incorporate third-party open-source libraries. Those components are subject to their own license terms, which will be provided upon request.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. Termination
            </h2>
            <p className="text-[#4b5563]">
              This EULA is effective until terminated. Your rights under this EULA will terminate automatically without notice if you fail to comply with any term. Upon termination, you must cease all use of the Software and delete any copies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              7. Updates
            </h2>
            <p className="text-[#4b5563]">
              We may update the Software from time to time. Updates may be automatic or require your consent. Continued use of the Software after an update constitutes acceptance of the updated EULA.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              8. Warranty Disclaimer
            </h2>
            <p className="text-[#4b5563] uppercase font-bold">
              The Software is provided "as is" without warranties of any kind. We do not warrant that the software will be error-free, secure, or uninterrupted. AI-generated content may contain errors or inaccuracies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              9. Limitation of Liability
            </h2>
            <p className="text-[#4b5563] uppercase font-bold">
              To the maximum extent permitted by law, Qubixel Technologies Private Limited shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the software.
            </p>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              11. Contact Us
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 Legal Inquiries: <a href="mailto:legal@shoutlyai.com" className="text-[#f97316] hover:underline">legal@shoutlyai.com</a></p>
              <p>📍 Address: JP Nagar 8th Phase, Karnataka 560083, India</p>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-[#6b7280] text-sm border-t border-[#eef2f6] pt-8">
          © 2026 ShoutlyAI — A product of Qubixel Technologies Private Limited.
        </footer>
      </div>
    </div>
  );
};

export default EULAPolicy;
