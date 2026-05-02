import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            Refund & Cancellation Policy
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. Free Trial
            </h2>
            <p className="text-[#4b5563]">
              ShoutlyAI offers a free trial with limited features. No payment information is required to start the trial. You may cancel your trial at any time before it ends without being charged.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. Paid Subscriptions
            </h2>
            <p className="text-[#4b5563]">
              All paid subscriptions are billed in advance on a monthly or annual basis (depending on your chosen plan). By subscribing, you authorize us to automatically charge your selected payment method each billing cycle.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. 7-Day Money-Back Guarantee
            </h2>
            <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] p-6 rounded-2xl mb-6">
              <p className="m-0 font-[500] text-[#166534]">
                <strong>✅ First-Time Subscribers:</strong> If you are not completely satisfied with ShoutlyAI within the first 7 days of your initial paid subscription, you may request a full refund. This guarantee applies only to your first subscription and does not apply to renewals or subsequent purchases.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              4. Refund Eligibility
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li><strong>Within 7 days of first payment:</strong> Full refund (less any transaction fees charged by payment processors)</li>
              <li><strong>After 7 days:</strong> No refunds for partial months or unused portions of your subscription</li>
              <li><strong>Annual plans:</strong> Pro-rated refunds available only within the first 30 days</li>
              <li><strong>Upgrades/Downgrades:</strong> No refunds for downgrades; credit applied to future bills</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              5. How to Request a Refund
            </h2>
            <p className="text-[#4b5563] mb-4">
              To request a refund, please email <a href="mailto:billing@shoutlyai.com" className="text-[#f97316] hover:underline">billing@shoutlyai.com</a> with:
            </p>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Your account email address</li>
              <li>Date of payment</li>
              <li>Reason for refund request</li>
            </ul>
            <p className="mt-4 text-[#4b5563]">
              We will process refunds within 7-10 business days. Refunds will be issued to the original payment method.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              6. Cancellation Policy
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2 mb-4">
              <li><strong>Monthly plans:</strong> You may cancel at any time. Your subscription will remain active until the end of your current billing period. No further charges will be made.</li>
              <li><strong>Annual plans:</strong> Cancellation will stop automatic renewal at the end of the annual term. No refunds for unused months unless within the first 30 days (pro-rated).</li>
            </ul>
            <p className="text-[#4b5563]">
              To cancel, go to Account Settings → Subscription → Cancel. You will receive a confirmation email.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              7. Non-Refundable Situations
            </h2>
            <ul className="list-disc ml-8 text-[#4b5563] space-y-2">
              <li>Account termination due to violation of our Acceptable Use Policy or Terms of Service</li>
              <li>Partial months or unused features</li>
              <li>Renewals processed automatically (if you did not cancel before the renewal date)</li>
              <li>Third-party transaction fees, currency conversion fees, or bank charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              10. Contact Us
            </h2>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">ShoutlyAI – Qubixel Technologies Private Limited</p>
              <p>📧 Billing Inquiries: <a href="mailto:billing@shoutlyai.com" className="text-[#f97316] hover:underline">billing@shoutlyai.com</a></p>
              <p>📧 Refund Requests: <a href="mailto:refunds@shoutlyai.com" className="text-[#f97316] hover:underline">refunds@shoutlyai.com</a></p>
              <p>📍 Address: JP Nagar 8th Phase, Karnataka 560083, India</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RefundPolicy;
