"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getPendingAuthFlow, registerUser, verifyOtpCode } from "@/api/authApi";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";
    const source = searchParams.get("source");
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const handleVerifyContinue = async () => {
        if (otp.trim().length !== 6) {
            setError("Enter the 6-digit OTP sent to your email.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            await verifyOtpCode(email, otp.trim());
            router.push(
                source === "google"
                    ? `/account-setup?email=${encodeURIComponent(email)}`
                    : `/create-password?email=${encodeURIComponent(email)}`,
            );
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    "OTP verification failed. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        const pending = getPendingAuthFlow();
        if (!pending?.email || !pending?.name) {
            setError("Signup details are missing. Please start again.");
            return;
        }

        try {
            setResending(true);
            setError("");
            setInfo("");
            await registerUser({
                name: pending.name,
                email: pending.email,
                role: "USER",
            });
            setInfo("A new OTP has been sent to your email.");
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    "Failed to resend OTP. Please try again.",
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">

            {/* Logo */}
            <div className="mb-8">
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
                    Verify your email
                </h1>

                {/* Subtitle */}
                <p
                    className="text-center text-gray-600 mb-6"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    We sent a code to <span style={{ fontFamily: "Arial", fontWeight: 500 }}>{email}</span>
                </p>

                {/* Verification Code */}
                <label
                    className="block text-sm text-gray-700 mb-1"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Verification Code
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setOtp(value);
                    }}
                    className="w-full text-left tracking-widest text-lg py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black mb-6 placeholder:text-gray-400"
                    style={{ fontFamily: "Arial", fontWeight: 400, paddingLeft: 10 }}
                />

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


                {/* Button */}
                <button
                    onClick={handleVerifyContinue}
                    disabled={submitting || otp.trim().length !== 6}
                    className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition mb-4"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    {submitting ? "Verifying..." : "Verify & Continue"}
                </button>


                {/* Resend */}
                <p
                    className="text-center text-sm text-gray-600 cursor-pointer hover:underline"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    <button onClick={handleResend} disabled={resending}>
                        {resending ? "Resending..." : "Resend code"}
                    </button>
                </p>

            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
