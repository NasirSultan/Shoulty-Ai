import React from "react";

const GDPRPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            GDPR Compliance Statement
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026 | Regulation (EU) 2016/679</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] p-6 rounded-2xl mb-8">
            <p className="m-0 font-[500] text-[#166534]">
              ✅ Qubixel Technologies Private Limited is committed to full compliance with the General Data Protection Regulation (GDPR). This document outlines the specific rights and protections available to individuals in the European Economic Area (EEA).
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Data Controller Information
            </h2>
            <p className="text-[#4b5563]">
              <strong>Data Controller:</strong> Qubixel Technologies Private Limited<br />
              <strong>Email:</strong> <a href="mailto:dpo@shoutlyai.com" className="text-[#f97316] hover:underline">dpo@shoutlyai.com</a><br />
              <strong>Address:</strong> JP Nagar 8th Phase, Karnataka 560083, India
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. Legal Bases for Processing (Article 6)
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Contract (Article 6(1)(b)):</strong> Processing necessary for the performance of our Service agreement with you</li>
              <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> Improving our Service, fraud prevention, direct marketing (with opt-out)</li>
              <li><strong>Consent (Article 6(1)(a)):</strong> Marketing communications, non-essential cookies</li>
              <li><strong>Legal Obligation (Article 6(1)(c)):</strong> Tax, regulatory, and legal compliance</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Your Rights Under GDPR (Articles 15-22)
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Right to Access (Article 15):</strong> Obtain confirmation of whether your data is processed and receive a copy</li>
              <li><strong>Right to Rectification (Article 16):</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure (Article 17):</strong> Request deletion of your data ("Right to be forgotten")</li>
              <li><strong>Right to Restrict Processing (Article 18):</strong> Limit how we use your data while disputes are resolved</li>
              <li><strong>Right to Data Portability (Article 20):</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object (Article 21):</strong> Object to processing based on legitimate interests or direct marketing</li>
              <li><strong>Rights Related to Automated Decision-Making (Article 22):</strong> Not be subject to solely automated decisions with legal effects</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. How to Exercise Your Rights
            </h2>
            <p className="text-[#4b5563] mb-4">
              To exercise any of these rights, contact our Data Protection Officer (DPO) at <a href="mailto:dpo@shoutlyai.com" className="text-[#f97316] hover:underline">dpo@shoutlyai.com</a>. We will respond within <strong>30 days</strong> (extendable by 60 days for complex requests).
            </p>
            <p className="text-[#4b5563]">
              To verify your identity, we may request additional information. There is no fee for exercising your rights unless requests are manifestly unfounded or excessive.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. Data Protection Officer (DPO)
            </h2>
            <p className="text-[#4b5563] mb-2">We have appointed a Data Protection Officer who can be contacted at:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Email: <a href="mailto:dpo@shoutlyai.com" className="text-[#f97316] hover:underline">dpo@shoutlyai.com</a></li>
              <li>Address: DPO, Qubixel Technologies Private Limited, JP Nagar 8th Phase, Karnataka 560083, India</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. International Data Transfers
            </h2>
            <p className="text-[#4b5563] mb-2">Your data may be transferred to countries outside the EEA (including India and the United States). For such transfers, we rely on:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
              <li><strong>EU-US Data Privacy Framework</strong> (for transfers to certified US entities)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              7. Data Breach Notification
            </h2>
            <p className="text-[#4b5563]">
              In the event of a personal data breach, we will notify the relevant supervisory authority within <strong>72 hours</strong> as required by Article 33 of the GDPR. If the breach poses a high risk to your rights, we will also notify you without undue delay.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              8. Supervisory Authority & Right to Lodge Complaint
            </h2>
            <p className="text-[#4b5563] mb-2">If you believe our processing of your data violates the GDPR, you have the right to lodge a complaint with your local supervisory authority. For example:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>UK:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" className="text-[#f97316] hover:underline">ico.org.uk</a></li>
              <li><strong>Ireland:</strong> Data Protection Commission - <a href="https://dataprotection.ie" target="_blank" className="text-[#f97316] hover:underline">dataprotection.ie</a></li>
              <li><strong>Germany:</strong> Bundesbeauftragter für den Datenschutz - <a href="https://bfdi.bund.de" target="_blank" className="text-[#f97316] hover:underline">bfdi.bund.de</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              9. Contact Us
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 Data Protection Officer: <a href="mailto:dpo@shoutlyai.com" className="text-[#f97316] hover:underline">dpo@shoutlyai.com</a></p>
              <p>📧 GDPR Inquiries: <a href="mailto:gdpr@shoutlyai.com" className="text-[#f97316] hover:underline">gdpr@shoutlyai.com</a></p>
              <p>📍 Address: JP Nagar 8th Phase, Karnataka 560083, India</p>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-[#6b7280] text-sm border-t border-[#eef2f6] pt-8">
          © 2026 ShoutlyAI — A product of Qubixel Technologies Private Limited.<br />
          This document complies with the General Data Protection Regulation (EU) 2016/679.
        </footer>
      </div>
    </div>
  );
};

export default GDPRPolicy;
