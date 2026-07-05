"use client";
import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", query: "" });
    const [status, setStatus] = useState<Status>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "phone") {
            // Allow only digits, +, -, (, ), and spaces
            const cleaned = value.replace(/[^\d\s+\-()]/g, "");
            setForm(prev => ({ ...prev, phone: cleaned }));
            return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.query) return;
        setStatus("loading");
        setErrorMsg("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    query: form.query,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setForm({ name: "", email: "", phone: "", query: "" });
            } else {
                setStatus("error");
                setErrorMsg(data.error || "Something went wrong.");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Network error. Please try again.");
        }
    };

    return (
        <section className="mt-16 mb-20 rounded-[40px] overflow-hidden shadow-2xl shadow-orange-100/60 border border-orange-100">
            <div className="grid lg:grid-cols-5">

                {/* Left panel */}
                <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 p-10 flex flex-col justify-between relative overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-black/10 rounded-full" />

                    <div className="relative z-10">
                        <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                            Get in touch
                        </span>
                        <h2 className="text-4xl font-black text-white leading-tight mb-4">
                            Let's talk<br />about your<br />goals.
                        </h2>
                        <p className="text-orange-100 text-sm leading-relaxed">
                            Fill in the form and our team will get back to you within 24 hours.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-5 mt-10">
                        {[
                            { icon: "📍", label: "Bangalore, India" },
                            { icon: "🌐", label: "hello@shoutlyai.com" },
                            { icon: "📞", label: "+91 99017 00660" },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-3">
                                <span className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-base shrink-0">
                                    {item.icon}
                                </span>
                                <span className="text-white text-sm font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel — form */}
                <div className="lg:col-span-3 bg-white p-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Send us a message</h3>
                    <p className="text-gray-400 text-sm mb-8">We read every message and reply fast.</p>

                    {status === "success" && (
                        <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl">
                            <span className="text-2xl mt-0.5">🎉</span>
                            <div>
                                <p className="font-bold">Message sent!</p>
                                <p className="text-sm text-green-700">We'll be in touch within 24 hours.</p>
                            </div>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl">
                            <span className="text-2xl mt-0.5">⚠️</span>
                            <div>
                                <p className="font-bold">Failed to send</p>
                                <p className="text-sm text-red-700">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                            {/* Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Full Name <span className="text-orange-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Email Address <span className="text-orange-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.46 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                </span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition"
                                />
                            </div>
                        </div>

                        {/* Query */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Your Query <span className="text-orange-500">*</span>
                            </label>
                            <textarea
                                name="query"
                                value={form.query}
                                onChange={handleChange}
                                placeholder="Tell us how we can help — the more detail, the better..."
                                required
                                rows={5}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition resize-none"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex items-center gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="group relative inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full overflow-hidden shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                            >
                                <span className="relative z-10">
                                    {status === "loading" ? "Sending..." : "Send Message"}
                                </span>
                                {status !== "loading" && (
                                    <svg className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                                )}
                                {status === "loading" && (
                                    <svg className="relative z-10 w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                )}
                            </button>
                            <span className="text-xs text-gray-400">* Required fields</span>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default function ContactPage() {
    return (
        <main className="bg-[#faf9f6] text-[#111]">
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <section className="mb-16">
                    <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-orange-200 mb-6">
                        🌍 Global Headquarters
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

                    <div className="mt-6 flex items-center gap-3 bg-white border border-orange-100 px-4 py-2 rounded-full w-fit shadow-sm">
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
                        <div className="bg-white p-8 rounded-3xl border border-orange-100 shadow-xl shadow-orange-100/40 hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-1 transition-all duration-300">
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
                        <div className="bg-white p-8 rounded-3xl border border-orange-100 shadow-xl shadow-orange-100/40 hover:border-orange-500 hover:bg-orange-50 hover:-translate-y-1 transition-all duration-300">
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
                <section className="bg-white border border-orange-100 rounded-[32px] p-10 shadow-xl shadow-orange-100/40 mb-20">
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

                {/* Contact Form */}
                <ContactForm />

                {/* Footer */}
                <footer className="border-t border-orange-100 mt-20 pt-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-500">
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
        <div className="flex items-center gap-4 border-b border-orange-100 pb-4">
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
        <div className="bg-white border border-orange-100 rounded-3xl p-8 shadow-xl shadow-orange-100/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-3">{icon}</div>

            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{desc}</p>

            <a
                href={`mailto:${email}`}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${highlight
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:brightness-110 shadow-md shadow-orange-200"
                        : "border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500"
                    }`}
            >
                {email}
            </a>
        </div>
    );
}