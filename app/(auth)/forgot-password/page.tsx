"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { sendResetOtp } from "@/api/authApi";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const handleSubmit = async () => {
        setError("");
        setInfo("");

        if (!email.trim()) {
            setError("Please enter your registered email.");
            return;
        }

        setLoading(true);

        try {
            await sendResetOtp(email.trim());
            setInfo("OTP sent successfully.");
            router.push(`/verify-email?type=reset&email=${encodeURIComponent(email.trim())}`);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    "Failed to send OTP. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">

            {/* Logo */}
            <div className="mb-6">
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={180}
                    height={120}
                    priority
                    className="mx-auto"
                />
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

                {/* Title */}
                <h1
                    className="text-2xl text-center text-black mb-2"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Forgot Password
                </h1>

                {/* Subtitle */}
                <p
                    className="text-center text-gray-600 mb-6"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Enter your registered email. We will send a 6-digit OTP to reset your password.
                </p>

                {/* Email Label */}
                <label
                    className="block text-sm text-gray-700 mb-1"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Email
                </label>

                {/* Email Input */}
                <div className="relative mb-6">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    />
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {info && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {info}
                    </div>
                )}

                {/* Continue Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    {loading ? "Processing..." : "Continue"}
                </button>

                <p className="mt-5 text-center text-sm text-gray-600" style={{ fontFamily: "Arial", fontWeight: 400 }}>
                    Remembered your password?{" "}
                    <Link href="/sign-in" className="text-black hover:underline font-semibold">
                        Back to Sign In
                    </Link>
                </p>

            </div>
        </div>
    );
}
