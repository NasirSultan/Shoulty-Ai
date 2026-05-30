import PricingSection from "@/components/PricingSection";
import { PricingFAQ } from "@/components/FAQ";

export const metadata = {
  title: "Pricing | ShoutlyAI - AI Social Media Automation for India",
  description: "Simple, transparent pricing for Indian SMBs. Start with 14 days free. Save 20% with annual billing.",
};

export default function PricingPage() {
  return (
    <main>
      <PricingSection />
      
      {/* Pricing Page Specific FAQ */}
      <section className="bg-[#F8F9FD] pb-20">
        <PricingFAQ />
      </section>

      {/* CTA Final */}
      <section className="bg-white py-20 px-6 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            READY TO FIRE YOUR AGENCY?
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Join 1,200+ Indian founders who saved ₹2.5L+/year using ShoutlyAI.
            Zero risk, 14 days free trial.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/signup" 
              className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Start Your Free Trial →
            </a>
            <a 
              href="/help-center" 
              className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition"
            >
              Have Questions?
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            No credit card required • GST invoice ready • Cancel anytime
          </p>
        </div>
      </section>
    </main>
  );
}
