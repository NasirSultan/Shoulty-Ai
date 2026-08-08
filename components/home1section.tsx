import React, { useState } from 'react';

interface HeroPremiumProps {
  className?: string;
}

const HeroPremium: React.FC<HeroPremiumProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState({
    name: 'Alex Chen',
    email: 'alex@brewlab.com',
    businessType: 'Coffee Shop',
    prompt: 'Promote my coffee shop in Bangalore. Cozy vibe, cold brew specialist, local artist nights, Instagram-heavy audience.'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const features = [
    { icon: '📅', text: '365 AI-Generated Posts' },
    { icon: '🎨', text: 'Auto Designs' },
    { icon: '#️⃣', text: 'Captions + Hashtags' },
    { icon: '⚡', text: 'Smart Scheduling' }
  ];

  const platforms = ['📘', '📷', '💼', '🐦', '🎵', '▶️', '🧵'];
  const bottomFeatures = ['⚡ 2-minute setup', '🎨 Auto-branded', '📅 365 days filled', '🌍 Multi-platform'];

  return (
    <div className={`max-w-[1400px] w-full bg-[rgba(10,12,18,0.9)] backdrop-blur-xl rounded-[48px] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(147,51,234,0.15) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.12) 0%, transparent 45%), radial-gradient(circle at 40% 70%, rgba(249,115,22,0.1) 0%, transparent 50%)',
          animation: 'rotate 30s linear infinite',
        }}
      />

      {/* Decorative orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(147,51,234,0.2),transparent_70%)] blur-[60px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_70%)] blur-[60px] pointer-events-none z-0" />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16 relative z-10">
        {/* LEFT SIDE: Content */}
        <div className="flex flex-col gap-8">
          {/* Pill badge */}
          <span className="inline-block bg-orange-500/10 border border-orange-500/30 text-orange-500 px-5 py-2 rounded-full text-sm font-semibold tracking-wide w-fit backdrop-blur">
            ⚡ THE FUTURE OF SOCIAL MEDIA
          </span>

          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
            <span className="bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              One Prompt.
            </span>
            <br />
            365 Days of Social Media.
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-[500px] leading-relaxed">
            ShoutlyAI creates, designs, and schedules your entire social media across every platform automatically. From one idea → a full year of content.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-6 my-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                  {feature.icon}
                </div>
                <span className="font-medium text-white">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Platform icons */}
          <div>
            <p className="text-gray-400 mb-4 text-sm">Publish everywhere — automatically</p>
            <div className="flex gap-6 flex-wrap">
              {platforms.map((platform, index) => (
                <div 
                  key={index} 
                  className="w-12 h-12 bg-white/3 border border-white/10 rounded-2xl flex items-center justify-center text-3xl text-gray-400 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-200 hover:-translate-y-1 cursor-default"
                >
                  {platform}
                </div>
              ))}
            </div>
          </div>

          {/* Gen-Z punchline */}
          <p className="text-orange-500 font-semibold text-lg mt-4">
            ⚡ No agencies. No burnout. Just results.
          </p>
        </div>

        {/* RIGHT SIDE: Lead Form */}
        <div className="bg-[rgba(20,22,27,0.7)] backdrop-blur border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.8)] shadow-[inset_0_0_0_1px_rgba(249,115,22,0.1)]">
          <div className="text-3xl font-bold mb-2 bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
            Generate Your Year
          </div>
          <div className="text-gray-400 mb-8">One prompt → 365 days of content</div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block mb-2 text-white font-medium text-sm">
                Your name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Alex Chen"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-white font-medium text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="alex@yourbrand.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="businessType" className="block mb-2 text-white font-medium text-sm">
                Business type
              </label>
              <input
                type="text"
                id="businessType"
                name="businessType"
                placeholder="e.g., Coffee Shop, Real Estate, Fitness"
                value={formData.businessType}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="prompt" className="block mb-2 text-white font-medium text-sm">
                Describe your business (the prompt)
              </label>
              <textarea
                id="prompt"
                name="prompt"
                placeholder="Promote my coffee shop in Bangalore. Cozy vibe, cold brew specialist, local events..."
                value={formData.prompt}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-vertical"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-purple-500 text-white font-bold py-5 px-6 rounded-[60px] text-lg shadow-[0_20px_30px_-8px_rgba(249,115,22,0.3)] hover:scale-[1.02] hover:shadow-[0_25px_35px_-6px_#f97316] transition-all duration-300 border border-white/10"
            >
              🔥 Generate My 365 Posts
            </button>

            <div className="flex items-center gap-2 justify-center mt-6 text-gray-500 text-sm">
              <span className="text-orange-500 font-semibold">⚡</span> No credit card required • 2-min setup
            </div>

            <div className="flex items-center gap-2 justify-center mt-2 text-gray-500 text-sm">
              <span className="text-orange-500 font-semibold">100+</span> founders already automating
            </div>
          </form>

          {/* Micro badge */}
          <div className="mt-6 pt-6 border-t border-white/5 flex justify-between text-gray-500 text-sm">
            <span>✨ 10,000+ templates</span>
            <span>🚀 2026 launch</span>
          </div>
        </div>
      </div>

      {/* Bottom micro bar */}
      <div className="px-8 lg:px-16 py-4 border-t border-white/5 flex gap-8 text-gray-600 text-sm flex-wrap">
        {bottomFeatures.map((feature, index) => (
          <span key={index}>{feature}</span>
        ))}
      </div>

      {/* Add keyframe animation to your global CSS or create a style tag */}
      <style>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HeroPremium;