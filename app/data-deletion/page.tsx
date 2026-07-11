import React from "react";

const DataDeletionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1f2937] font-sans leading-relaxed py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        <header className="text-center mb-12">
          <div className="text-[2.2rem] font-[800] bg-gradient-to-r from-[#f97316] to-[#fb923c] bg-clip-text text-transparent mb-2 inline-block">
            ShoutlyAI
          </div>
          <h1 className="text-[2.5rem] font-[700] text-[#1f2937] mb-2">
            Data Deletion Instructions
          </h1>
          <div className="text-[#6b7280] text-sm">Last Updated: April 2026</div>
        </header>

        <main className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_35px_-8px_rgba(0,0,0,0.05),0_5px_10px_-4px_rgba(0,0,0,0.02)] border border-[#f0f0f0]">
          <div className="bg-[#fff7ed] border-l-4 border-[#f97316] p-6 rounded-2xl mb-8">
            <p className="m-0 font-[500] text-[#9a3412]">
              🗑️ If you would like to request the deletion of your personal data associated with your Shoutly AI account, please follow the steps below.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              1. How to Request Deletion
            </h2>
            <p className="text-[#4b5563]">
              Send an email to{" "}
              <a href="mailto:privacy@shoutlyai.com" className="text-[#f97316] hover:underline">
                privacy@shoutlyai.com
              </a>{" "}
              with the subject line <strong>&quot;Data Deletion Request&quot;</strong> and include the email address or phone number associated with your account.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              2. What Happens Next
            </h2>
            <p className="text-[#4b5563]">
              We will process your request and permanently delete your data from our systems within <strong>30 days</strong>. You will receive a confirmation email once the deletion is complete.
            </p>
          </section>

          <section>
            <h2 className="text-[1.8rem] font-[700] border-b-2 border-[#f97316] inline-block mb-6 pb-2">
              3. What Data We Delete
            </h2>
            <p className="text-[#4b5563] mb-6">
              This includes any information collected through Facebook or Instagram Login, such as your profile information, connected page/account data, and content you authorized us to access.
            </p>
            <div className="bg-[#faf9f6] border border-[#f0f0f0] rounded-[24px] p-6 text-[#4b5563]">
              <p className="font-bold text-[#1f2937] mb-2">Need help?</p>
              <p>
                📧 Email us at{" "}
                <a href="mailto:privacy@shoutlyai.com" className="text-[#f97316] hover:underline">
                  privacy@shoutlyai.com
                </a>
              </p>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-[#6b7280] text-sm border-t border-[#eef2f6] pt-8">
          © 2026 ShoutlyAI. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DataDeletionPage;
