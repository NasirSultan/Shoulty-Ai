import React from "react";

const SecurityPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            Security & Data Processing
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] p-6 rounded-2xl mb-8">
            <p className="m-0 font-[500] text-[#166534]">
              <strong>✅ Qubixel Technologies Private Limited is committed to protecting your data with industry-leading security measures.</strong> This document outlines our technical and organizational security practices.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Data Encryption
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>In Transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.3 (Transport Layer Security).</li>
              <li><strong>At Rest:</strong> All personal data stored in our databases is encrypted using AES-256 encryption.</li>
              <li><strong>Backups:</strong> Encrypted backups are stored in geographically redundant locations.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. Access Controls
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Role-Based Access Control (RBAC):</strong> Only authorized employees have access to production systems based on their job function.</li>
              <li><strong>Multi-Factor Authentication (MFA):</strong> Required for all employees accessing sensitive systems.</li>
              <li><strong>Least Privilege Principle:</strong> Employees are granted only the minimum access necessary.</li>
              <li><strong>Access Logging:</strong> All access to production systems is logged and audited.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. Subprocessors (Data Processors)
            </h2>
            <p className="text-[#4b5563] mb-4">We use the following subprocessors to provide our Service. Each subprocessor is GDPR and CCPA compliant:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>AWS (Amazon Web Services):</strong> Cloud hosting (us-east-1, eu-west-1, ap-south-1)</li>
              <li><strong>Google Cloud Platform:</strong> AI model hosting and analytics</li>
              <li><strong>Stripe & Razorpay:</strong> Payment processing (PCI DSS Level 1)</li>
              <li><strong>Intercom:</strong> Customer support chat</li>
              <li><strong>Zendesk:</strong> Support ticket system</li>
              <li><strong>Google Analytics & Mixpanel:</strong> Usage analytics</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. Data Breach Notification Procedure
            </h2>
            <p className="text-[#4b5563] mb-2">In the event of a personal data breach, we will:</p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Notify affected users within <strong>72 hours</strong> of discovery (GDPR Article 33)</li>
              <li>Notify relevant supervisory authorities (e.g., ICO, Data Protection Board of India)</li>
              <li>Provide a clear description of the breach, data affected, and mitigation steps</li>
              <li>Conduct a post-mortem and implement corrective measures</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. Security Certifications & Audits
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>GDPR Compliance:</strong> Annual external audit</li>
              <li><strong>PCI DSS:</strong> Our payment processors are PCI DSS Level 1 compliant</li>
              <li><strong>Vulnerability Scanning:</strong> Weekly automated scans; quarterly penetration testing</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. Data Processing Agreement (DPA)
            </h2>
            <p className="text-[#4b5563]">
              For enterprise customers, we offer a Data Processing Agreement (DPA) that complies with GDPR Article 28. To request a DPA, email <a href="mailto:dpa@shoutlyai.com" className="text-[#f97316] hover:underline">dpa@shoutlyai.com</a>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              7. Data Retention & Deletion
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Active accounts:</strong> Data retained for the duration of your subscription</li>
              <li><strong>Deleted accounts:</strong> Data permanently deleted within 90 days (except anonymized analytics)</li>
              <li><strong>Legal retention:</strong> Invoices and transaction records retained for 7 years (tax compliance)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              8. Reporting Security Vulnerabilities
            </h2>
            <p className="text-[#4b5563]">
              If you discover a security vulnerability in our Service, please report it to <a href="mailto:security@shoutlyai.com" className="text-[#f97316] hover:underline">security@shoutlyai.com</a>. We have a responsible disclosure policy and will not take legal action against good-faith reporters.
            </p>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              9. Contact Us
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 Security Team: <a href="mailto:security@shoutlyai.com" className="text-[#f97316] hover:underline">security@shoutlyai.com</a></p>
              <p>📧 Data Protection Officer: <a href="mailto:dpo@shoutlyai.com" className="text-[#f97316] hover:underline">dpo@shoutlyai.com</a></p>
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

export default SecurityPolicy;
