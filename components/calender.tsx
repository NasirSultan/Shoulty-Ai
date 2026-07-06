"use client";

import React, { useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  Clock,
} from "lucide-react";

// Using a "Threads" style icon alternative since Lucide doesn't have it natively
const ThreadsIcon = ({ size }: { size: number }) => (
  <Send size={size} className="rotate-45" />
);

interface ContentDay {
  day: number;
  caption: string;
  hashtags: string;
  time: string;
  image: string;
  type: string;
  badgeClass: string;
}

const SocialMediaCalendar = ({ selectedIndustry }: { selectedIndustry?: string }) => {
  // 1. Data Setup from original source
  const captions = [
    "Boost your Monday productivity with smart marketing habits.",
    "Top 5 tools every startup should use.",
    "Level up your daily vibe with consistent and loving pet care routines.",
    "Start your day right with a smooth coffee and chill vibes.",
    "Craving something fire? Grab a juicy burger and fix your mood.",
    "Drip at the best price without compromising your everyday style.",
    "Step up your style game with fresh kicks and everyday drip.",
    "Shine brighter every day with timeless diamonds that elevate your style.",
    "Upgrade your lifestyle with advanced smartwatches built for everyday performance.",
    "Elevate your everyday vibe with aroma fragrances that feel truly you.",
    "Build the future with infrastructure that powers growth and modern living.",
    "Elevate your space with luxury interiors designed for comfort and elegance.",
    "Design iconic spaces with luxury architects shaping modern lifestyle experiences.",
    "Keep your smile fresh and confident with modern dental care solutions.",
    "See the world clearly with advanced eye care for everyday vision.",
    "Upgrade your space with furniture that blends comfort, style, and function.",
    "Make every moment special with decor crafted for every celebration vibe.",
    "Experience sound like never before with powerful and immersive audio devices.",
    "Escape to beach resorts where chill vibes and luxury meet the ocean.",
    "Sail into pure luxury with cruises designed for unforgettable ocean experiences.",
    "Train like a pro with end to end sports academy programs built for champions.",
    "Escape the routine with camping adventures that reset your vibe and energy.",
    "Dress your little ones in ethnic styles that blend tradition with cute vibes.",
    "Stay ahead every day with smartphones designed for speed, style, and performance.",
    "Celebrate colors and happiness with Holi vibes full of joy and energy.",
    "Share the love and good vibes with Valentine’s Day made for special moments.",
    "Celebrate the festive vibes with Durga Puja full of devotion and joy.",
    "Welcome positive energy with Ganesha celebrations full of joy and blessings.",
    "Embrace the spiritual vibes with Ramadan celebrations full of reflection and devotion.",
    "Feel the pride and freedom with Independence Day celebrations full of energy.",
    "Honor peace and truth with Gandhi Jayanti reflecting values that still inspire.",
  ];

  const hashtags = [
    "#MarketingTips #GrowthStrategy",
    "#StartupTools #DigitalMarketing",
    "#PetCareTips #PetLife",
    "#CoffeeTime #DailyBrew",
    "#BurgerLove #FoodCravings",
    "#AffordableFashion #StyleOnBudget",
    "#SneakerCulture #StreetStyle",
    "#DiamondJewelry #LuxuryStyle",
    "#Smartwatch #TechLifestyle",
    "#AromaFragrance #ScentLife",
    "#Infrastructure #UrbanDevelopment",
    "#LuxuryInteriors #ElegantLiving",
    "#LuxuryArchitecture #DesignExcellence",
    "#DentalCare #HealthySmile",
    "#EyeCare #VisionHealth",
    "#FurnitureDesign #HomeUpgrade",
    "#EventDecor #CelebrateInStyle",
    "#AudioTech #SoundExperience",
    "#BeachResort #TravelVibes",
    "#LuxuryCruise #OceanVibes",
    "#SportsAcademy #TrainLikeAPro",
    "#CampingLife #OutdoorVibes",
    "#KidsEthnicWear #TraditionalStyle",
    "#SmartphoneLife #TechUpgrade",
    "#Holi #FestivalOfColors",
    "#ValentinesDay #LoveVibes",
    "#DurgaPuja #FestiveVibes",
    "#GaneshChaturthi #DivineVibes",
    "#Ramadan #SpiritualVibes",
    "#IndependenceDay #ProudNation",
    "#GandhiJayanti #PeaceAndTruth",
  ];

  const times = [
    "9:00 AM EST",
    "6:30 PM CET",
    "7:30 PM IST",
    "8:15 PM GMT",
    "11:00 AM PST",
  ];

  const types = [
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Educational", color: "bg-[#f97316]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Reels", color: "bg-[#e64980]" },
    { name: "Engagement", color: "bg-[#f03e3e]" },
    { name: "Cultural Day", color: "bg-[#f97316]" },
    { name: "Cultural Day", color: "bg-[#e64980]" },
    { name: "Festival", color: "bg-[#f03e3e]" },
    { name: "Festival", color: "bg-[#f97316]" },
    { name: "Festival", color: "bg-[#f97316]" },
    { name: "National Day", color: "bg-[#f97316]" },
    { name: "National Day", color: "bg-[#f97316]" },
  ];

  // Your local images from the /public folder
  const images = [
    "/images/img1.jpeg",
    "/images/img2.jpeg", 
    "/images/3.png",
    "/images/4.png",
    "/images/5.png",
    "/images/6.png",
    "/images/7.png",
    "/images/8.png",
    "/images/9.png",
    "/images/10.png",
    "/images/11.png",
    "/images/12.png",
    "/images/13.png",
    "/images/14.png",
    "/images/15.png",
    "/images/16.png",
    "/images/17.png",
    "/images/18.png",
    "/images/19.png",
    "/images/20.png",
    "/images/21.png",
    "/images/23.png",
    "/images/26.png",
    "/images/27.png",
    "/images/holi.jpg",
    "/images/valintine.png",
    "/images/durga.jpg",
    "/images/ganesha.png",
    "/images/Eid.jpg",
    "/images/Indep.jpg",
    "/images/ghandhi.jpg",
  ];

  // 2. Generating the 31 days base content (day number is fixed per slot)
  const baseContents = Array.from({ length: 31 }, (_, i) => {
    const typeObj = types[i % types.length];
    return {
      caption: captions[i],
      hashtags: hashtags[i],
      time: times[i % times.length],
      image: images[i % images.length],
      type: typeObj.name,
      badgeClass: typeObj.color,
    };
  });

  const allDays: ContentDay[] = baseContents.map((content, i) => ({
    day: i + 1,
    ...content,
  }));

  const [view, setView] = useState<"weekly" | "monthly">("weekly");

  const days = view === "weekly" ? allDays.slice(0, 7) : allDays;

  return (
    <div className="py-16 sm:py-28 px-6 md:px-10 font-sans" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #fff7f0 100%)" }}>
      <header className="mb-10 sm:mb-14 text-center">
        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
            </svg>
            Content Calendar
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Your Next 30 Days{" "}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Are Ready
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2 mb-8">
          See your monthly posting schedule with professionally designed posts, reels, promotions, festivals, and special occasions planned in advance so your social media never goes silent.
        </p>

        {/* Weekly / Monthly toggle */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-gray-200">
          {(["weekly", "monthly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                view === v
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "text-gray-500 hover:text-orange-500"
              }`}
            >
              {v === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </header>

      {/* Day-of-week header row */}
      <div className="hidden lg:grid grid-cols-7 mb-4 text-center font-bold text-gray-400 text-xs uppercase tracking-wider">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-4 ${
        view === "weekly"
          ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-7"
          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7"
      }`}>
        {days.map((item) => (
          <div
            key={item.day}
            className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-lg text-gray-700 leading-none">
                {item.day}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full text-white font-bold uppercase ${item.badgeClass}`}
              >
                {item.type}
              </span>
            </div>

            {/* Platform Icons */}
            <div className="flex gap-1.5 text-gray-300 mb-2">
              <Facebook size={12} />
              <Instagram size={12} />
              <Twitter size={12} />
              <Linkedin size={12} />
              <Youtube size={12} />
              <ThreadsIcon size={12} />
            </div>

            {/* Image from local folder */}
            <img
              src={item.image}
              alt={`AI-generated social media post preview for day ${item.day}`}
              className="w-full h-24 object-cover rounded-md mb-2 bg-gray-100"
              loading="lazy"
            />

            <div className="flex-grow">
              <p className="text-[11px] leading-tight text-gray-800 font-medium mb-1 line-clamp-2">
                {item.caption}
              </p>
              <p className="text-[10px] text-orange-500 font-medium truncate">
                {item.hashtags}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center text-gray-400 gap-1">
              <Clock size={10} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaCalendar;
