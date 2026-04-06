"use client";
import Head from "next/head";

export default function ContactPage() {
    return (
        <main className="bg-[#faf9f6] text-[#111]">
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <section className="mb-16">
                    <span className="inline-block bg-gray-200 text-orange-500 px-4 py-1 rounded-full font-semibold text-sm mb-6">
                        🌍 GLOBAL HEADQUARTERS
                    </span>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight uppercase">
                        LET'S{" "}
                        <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-transparent bg-clip-text">
                            BUILD
                        </span>
                        <br />
                        THE FUTURE.
                    </h1>

                    <p className="text-gray-600 text-lg mt-6 max-w-3xl">
                        We're not just a tool. We're your AI growth partner — helping brands
                        scale content, automate creativity, and dominate social at
                        lightspeed. From Bangalore to New York, we're building the
                        infrastructure for AI-powered brand growth.
                    </p>

                    <div className="mt-6 flex items-center gap-3 bg-white border px-4 py-2 rounded-full w-fit shadow-sm">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm">
                            24/7 Global Operations — Bangalore · New York · Singapore · London
                        </span>
                    </div>
                </section>

                {/* Locations */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold mb-8">📍 WHERE TO FIND US</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Bangalore */}
                        <div className="bg-white p-8 rounded-3xl border hover:border-orange-500 hover:bg-orange-50 transition">
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                🇮🇳 Bangalore
                            </h3>

                            <p className="text-gray-500 mb-4">
                                No: 371 Gokula Pride, 4th Floor, JP Nagar
                                <br />
                                8th phase, Bangalore - 560083
                            </p>

                            <p className="text-orange-500 font-semibold text-sm mb-6">
                                ⚡ ASIA PACIFIC HQ · IST (GMT+5:30)
                            </p>

                            <a
                                href="tel:+919901700660"
                                className="flex items-center gap-3 text-lg font-semibold"
                            >
                                📞 +91 99017 00660
                            </a>
                        </div>

                        {/* New York */}
                        <div className="bg-white p-8 rounded-3xl border hover:border-orange-500 hover:bg-orange-50 transition">
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                🇺🇸 New York
                            </h3>

                            <p className="text-gray-500 mb-4">
                                20 W 34th St, Suite 1010,
                                <br />
                                New York, NY 10001
                            </p>

                            <p className="text-orange-500 font-semibold text-sm mb-6">
                                ⚡ AMERICAS HQ · EST (GMT-5)
                            </p>
                        </div>
                    </div>
                </section>

                {/* Global Contact */}
                <section className="bg-white border rounded-[32px] p-10 shadow-sm mb-20">
                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Emails */}
                        <div className="md:col-span-2">
                            <h3 className="text-2xl font-bold mb-6">📧 GLOBAL CONTACT</h3>

                            <div className="space-y-6">
                                <ContactRow
                                    icon="✉️"
                                    label="SALES & ENTERPRISE"
                                    value="sales@shoutlyai.com"
                                />
                                <ContactRow
                                    icon="🤝"
                                    label="PARTNERSHIPS"
                                    value="partners@shoutlyai.com"
                                />
                                <ContactRow
                                    icon="🛟"
                                    label="SUPPORT"
                                    value="support@shoutlyai.com"
                                />
                                <ContactRow
                                    icon="🌐"
                                    label="GLOBAL INQUIRIES"
                                    value="hello@shoutlyai.com"
                                />
                            </div>
                        </div>

                        {/* Availability summary */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">🌍 SUPPORT HOURS</h3>
                            <p className="text-gray-600">
                                Our global team is available around the clock via email for
                                sales, support, and partnership requests.
                            </p>

                            <p className="text-orange-500 mt-6 font-semibold">
                                ⏰ 24/7 · Follow the sun support
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section>
                    <h2 className="text-3xl font-bold mb-10">HOW CAN WE HELP?</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <CTA
                            icon="🚀"
                            title="Scale with AI"
                            desc="Enterprise plans, volume pricing, and custom workflows."
                            email="sales@shoutlyai.com"
                            highlight
                        />

                        <CTA
                            icon="🤝"
                            title="Partner with us"
                            desc="Agencies, integrators, resellers — build with us."
                            email="partners@shoutlyai.com"
                            highlight
                        />

                        <CTA
                            icon="🛟"
                            title="We're here 24/7"
                            desc="Technical issues or account help."
                            email="support@shoutlyai.com"
                        />
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t mt-20 pt-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-500">
                    <div className="flex gap-6 flex-wrap">
                        <span className="text-orange-500 font-semibold">BANGALORE</span>
                        <span className="text-orange-500 font-semibold">NEW YORK</span>
                        <span>SINGAPORE</span>
                        <span>LONDON</span>
                        <span>DUBAI</span>
                    </div>

                    <div>© 2025 ShoutlyAI · Global AI Operations</div>
                </footer>
            </div>
        </main>
    );
}

function ContactRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-4 border-b pb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center text-xl">
                {icon}
            </div>

            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <a
                    href={`mailto:${value}`}
                    className="text-lg font-semibold hover:text-orange-500 transition"
                >
                    {value}
                </a>
            </div>
        </div>
    );
}

function CTA({
    icon,
    title,
    desc,
    email,
    highlight,
}: {
    icon: string;
    title: string;
    desc: string;
    email: string;
    highlight?: boolean;
}) {
    return (
        <div className="bg-white border rounded-3xl p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-3">{icon}</div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{desc}</p>

            <a
                href={`mailto:${email}`}
                className={`px-6 py-3 rounded-full font-semibold ${highlight
                        ? "bg-black text-white hover:bg-orange-500"
                        : "border hover:border-orange-500"
                    }`}
            >
                {email}
            </a>
        </div>
    );
}