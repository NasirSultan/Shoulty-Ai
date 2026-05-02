import React from "react";

const AUPPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            Acceptable Use Policy (AUP)
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Purpose
            </h2>
            <p className="text-[#4b5563]">
              This Acceptable Use Policy ("AUP") applies to all users of ShoutlyAI, a service provided by <strong>Qubixel Technologies Private Limited</strong>. This AUP forms part of our <a href="/terms" className="text-[#f97316] hover:underline">Terms of Service</a>. Violation of this AUP may result in suspension or termination of your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. Prohibited Content
            </h2>
            <p className="text-[#4b5563] mb-4">You may NOT use ShoutlyAI to generate, publish, or distribute content that:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Is illegal under applicable laws (including Indian law, EU law, or US federal/state law)</li>
              <li>Promotes hate speech, violence, discrimination, or harassment based on race, religion, gender, sexual orientation, disability, or nationality</li>
              <li>Contains child sexual abuse material (CSAM) or exploits minors in any way</li>
              <li>Includes defamatory, libelous, or fraudulent statements</li>
              <li>Infringes on intellectual property rights (copyright, trademark, trade secrets)</li>
              <li>Contains malware, viruses, or malicious code</li>
              <li>Promotes self-harm, suicide, or eating disorders</li>
              <li>Involves phishing, scams, or deceptive practices</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Prohibited Activities (CAN-SPAM & Marketing)
            </h2>
            <div className="bg-[#fef2f2] border-l-4 border-[#ef4444] p-6 rounded-2xl mb-6">
              <strong className="block mb-2 text-[#b91c1c]">⚠️ Strictly Prohibited Email & Messaging Practices:</strong>
              <ul className="list-disc ml-8 text-[#b91c1c] space-y-2">
                <li>Sending unsolicited commercial emails (spam) without proper consent</li>
                <li>Failing to include a valid opt-out mechanism in marketing messages</li>
                <li>Using false or misleading header information (e.g., spoofing email addresses)</li>
                <li>Harvesting email addresses from websites or third parties without permission</li>
                <li>Sending messages to purchased, rented, or scraped email lists</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. Prohibited Technical Activities
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Attempting to reverse engineer, decompile, or disassemble our AI platform</li>
              <li>Using automated scripts (bots, scrapers) to access our Service without authorization</li>
              <li>Interfering with or disrupting the integrity of our Service (e.g., DDoS attacks)</li>
              <li>Attempting to bypass rate limits, security measures, or access restrictions</li>
              <li>Sharing your account credentials with unauthorized individuals</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. AI-Generated Content Restrictions
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Do not use our AI to generate content that impersonates another person without their consent</li>
              <li>Do not use our AI to create deepfakes or misleading synthetic media</li>
              <li>Do not use our AI to generate content that violates platform-specific policies (e.g., Twitter/X, Instagram, LinkedIn)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. Consequences of Violation
            </h2>
            <p className="text-[#4b5563] mb-2">If we determine that you have violated this AUP, we may take any of the following actions:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Issue a warning</li>
              <li>Temporarily suspend your account</li>
              <li>Permanently terminate your account without refund</li>
              <li>Report your activities to law enforcement or regulatory authorities</li>
              <li>Remove or disable access to violating content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              7. Reporting Violations
            </h2>
            <p className="text-[#4b5563] mb-4">If you believe another user is violating this AUP, please report it to:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Email: <a href="mailto:abuse@shoutlyai.com" className="text-[#f97316] hover:underline">abuse@shoutlyai.com</a></li>
              <li>Include: Your name, the offending user's account (if known), and a description of the violation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              8. Contact Us
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 Abuse Reports: <a href="mailto:abuse@shoutlyai.com" className="text-[#f97316] hover:underline">abuse@shoutlyai.com</a></p>
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

export default AUPPolicy;
