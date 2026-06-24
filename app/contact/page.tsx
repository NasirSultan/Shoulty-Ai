"use client";

import { useState } from "react";
import { Send, Phone, Mail, User, BookOpen } from "lucide-react";

export default function ContactFormPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setStatus("success");
                setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
            } else {
                setStatus("error");
                setErrorMessage(data.error || "Failed to send message.");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("An unexpected error occurred.");
        }
    };

    return (
        <main className="bg-[#faf9f6] text-[#111] min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <span className="inline-block bg-gray-200 text-orange-500 px-4 py-1 rounded-full font-semibold text-sm mb-6 uppercase tracking-wide">
                        Contact Us
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight uppercase mb-4">
                        GET IN{" "}
                        <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-transparent bg-clip-text">
                            TOUCH
                        </span>
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Have a question or want to see how Shoutly AI can transform your social media? Fill out the form below and our team will get back to you shortly.
                    </p>
                </div>

                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100">
                    {status === "success" ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Message Sent!</h2>
                            <p className="text-gray-600 mb-8">
                                Thank you for reaching out. We've received your message and will get back to you at {formData.email || 'your email'} as soon as possible.
                            </p>
                            <button
                                onClick={() => setStatus("idle")}
                                className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-orange-500 transition-colors"
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Mobile */}
                                <div className="space-y-2">
                                    <label htmlFor="mobile" className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="+91 99017 00660"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help?"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-bold uppercase tracking-wider text-gray-500">
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Tell us about your project or inquiry..."
                                    required
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:bg-white focus:outline-none transition-all resize-none"
                                />
                            </div>

                            {status === "error" && (
                                <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white transition-all shadow-lg ${
                                    status === "loading"
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-black hover:bg-orange-500 shadow-orange-500/20"
                                }`}
                            >
                                {status === "loading" ? "Sending Message..." : "Send Message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
