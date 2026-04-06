import React from 'react';

// --- Reusable Sub-Components ---

const Section = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <section className={`bg-white rounded-[32px] p-8 md:p-12 my-8 shadow-sm border border-gray-100 overflow-hidden clear-both ${className}`}>
    {children}
  </section>
);

const Pill = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-block bg-gray-100 text-orange-500 font-semibold px-5 py-2 rounded-full text-sm border border-gray-200 mb-6 ${className}`}>
    {children}
  </span>
);

const GradientText = ({ children, type = "orange" }: { children: React.ReactNode, type?: "orange" | "purple" | "blue" }) => {
  const styles = {
    orange: "from-orange-500 to-orange-400",
    purple: "from-violet-500 to-fuchsia-500",
    blue: "from-blue-500 to-cyan-500"
  };
  return (
    <span className={`bg-gradient-to-br ${styles[type]} bg-clip-text text-transparent`}>
      {children}
    </span>
  );
};

// --- Main Page Component ---

export default function LandingPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-8 pb-16 font-sans bg-[#faf9f6] text-gray-800">

      {/* SECTION 1: HERO */}
      <Section>
        <Pill>🚀 LAUNCHED 2026 — 100 EARLY USERS, 3,000+ POSTS GENERATED</Pill>
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-6">
          WE DIDN'T BUILD AN AGENCY.<br />
          <GradientText>WE KILLED IT.</GradientText>
        </h1>
        <p className="text-xl text-gray-500 max-w-[600px] mb-8 leading-relaxed">
          One prompt = <span className="text-orange-500 font-medium">365 days</span> of content. 
          No designers. No strategists. No burnout.
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <a
            href="https://go.shoutlyai.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
          >
            🔥 JOIN THE MOVEMENT
          </a>
          <button className="border-2 border-orange-500 text-gray-800 font-medium px-9 py-3.5 rounded-full hover:bg-orange-500 hover:text-white transition-all">
            ▶️ WATCH 2-MIN SETUP
          </button>
        </div>
        <div className="flex flex-wrap gap-4 mt-8">
          {["⚡ 100 early adopters", "📸 3,000+ reels generated", "🔥 0 agencies hired"].map((text, i) => (
            <span key={i} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-full text-sm font-medium">
              {text}
            </span>
          ))}
        </div>
      </Section>

      {/* SECTION 2: THE PROBLEM */}
      <Section>
        <Pill>⚠️ THE PROBLEM</Pill>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          YOU'RE NOT A <GradientText type="purple">CONTENT FACTORY.</GradientText>
        </h2>

        <div className="bg-[#faf9f6] rounded-3xl p-8 my-8 space-y-3">
          <p className="text-xl font-medium">Hiring designers? <strong className="text-orange-500">💸 Expensive.</strong></p>
          <p className="text-xl font-medium">Freelancers? <strong className="text-orange-500">🎭 Inconsistent.</strong></p>
          <p className="text-xl font-medium">Posting every day? <strong className="text-orange-500">😩 Exhausting.</strong></p>
          <p className="text-2xl mt-4 font-bold"><GradientText>Creative fatigue is killing your brand.</GradientText></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "💸", text: "$5K+ / month wasted" },
            { icon: "⏰", text: "15 hours / week lost" },
            { icon: "📉", text: "80% posts get zero engagement" }
          ].map((item, i) => (
            <div key={i} className="p-6 border border-gray-100 rounded-3xl hover:border-orange-500 hover:-translate-y-1 transition-all shadow-sm bg-white">
              <div className="text-4xl mb-2">{item.icon}</div>
              <div className="font-semibold">{item.text}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 3: HOW IT WORKS */}
      <Section>
        <Pill>⚙️ THE SYSTEM</Pill>
        <h2 className="text-3xl md:text-5xl font-bold mb-8"><GradientText>ZERO TO 365</GradientText> IN 60 SECONDS.</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "1️⃣", title: "YOUR PROMPT", desc: '"I\'m a realtor in Austin. Modern luxury."', color: "text-orange-500" },
            { step: "⚡", title: "AI ENGINE", desc: "Learns your brand. Your voice.", color: "text-purple-500" },
            { step: "📦", title: "FULL YEAR", desc: "365 posts. Videos. Strategy.", color: "text-blue-500" },
            { step: "🤖", title: "AUTO-SCHEDULE", desc: "Done. Go live your life.", color: "text-emerald-500" }
          ].map((item, i) => (
            <div key={i} className="p-6 border border-gray-100 rounded-3xl text-center bg-white">
              <div className="text-4xl mb-4">{item.step}</div>
              <h3 className={`font-bold mb-2 ${item.color}`}>{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 4: VISION (DARK MODE) */}
      <Section className="bg-gray-900 text-white border-none">
        <Pill className="bg-gray-800 text-yellow-400 border-none">🔮 2026 AND BEYOND</Pill>
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          WE'RE DEMOCRATIZING<br />
          <GradientText>CONTENT PRODUCTION.</GradientText>
        </h2>
        <p className="text-xl text-gray-400 max-w-[700px] mb-8">
          Every business. Every creator. Everywhere. Not just the ones with agency budgets.
        </p>
        <div className="text-5xl font-extrabold mb-8">
          <GradientText>100M</GradientText> <span className="text-sm text-gray-500 uppercase tracking-widest ml-2">Posts by 2027</span>
        </div>
      </Section>

      {/* SECTION 5: FINAL CTA */}
      <Section className="bg-gradient-to-br from-gray-900 to-black text-white text-center">
        <Pill className="bg-gray-800 text-yellow-400 border-none">⚡ THE FUTURE IS HERE</Pill>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          STOP <span className="line-through text-gray-600">HIRING.</span><br />
          <GradientText>START SHOUTING.</GradientText>
        </h2>
        <a
          href="https://go.shoutlyai.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block bg-orange-500 text-white font-bold px-12 py-5 rounded-full text-xl shadow-2xl shadow-orange-500/40 hover:scale-105 transition-transform"
        >
          🔥 GET EARLY ACCESS
        </a>
        <p className="mt-6 text-gray-500">No credit card. Just content.</p>
      </Section>

    </div>
  );
}