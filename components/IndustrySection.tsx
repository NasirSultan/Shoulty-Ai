"use client";

import React from "react";
import Link from "next/link";

const industries = [
    { name: "Real Estate", icon: "🏠", href: "/real-estate.html" },
    { name: "Health & Wellness", icon: "🧘", href: "/Dieticians.html" },
    { name: "Finance", icon: "💰", href: "/mutual-fund.html" },
    { name: "Fashion", icon: "👗", href: "/CLOTHING-AND-BOUTIQUE.html" },
    { name: "Technology", icon: "💻", href: "/coding-academy.html" },
    { name: "Retail", icon: "🛍️", href: "/textile.html" },
    { name: "Food & Drink", icon: "🍷", href: "/Cafe.html" },
    { name: "Travel", icon: "✈️", href: "/package.html" },
    { name: "Beauty", icon: "💄", href: "/perfume.html" },
    { name: "Education", icon: "🎓", href: "/SCHOOL-AND-CLG.html" },
    { name: "Fitness", icon: "🏋️", href: "/GYM.html" },
    { name: "Legal", icon: "⚖️", href: "/CA_GST.html" },
];

export default function IndustrySection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Made for Your Business</h2>
                    <p className="text-gray-500 text-lg font-medium">Built for professionals across every major industry.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {industries.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group bg-gray-50/50 border border-gray-100 p-8 rounded-[32px] text-center transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:border-white hover:-translate-y-1"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
