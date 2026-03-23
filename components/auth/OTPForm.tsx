"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyOtpCode, verifyOtpForReset, sendResetOtp } from "@/api/authApi";

export default function OTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const type = searchParams.get("type");
    const isResetFlow = type === "reset";
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (!email) {
            setError("Email is missing. Please restart the flow.");
            return;
        }

        const mergedOtp = otp.join("");
        if (mergedOtp.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            if (isResetFlow) {
                await verifyOtpForReset(email, mergedOtp);
                router.push(`/new-password?type=reset&email=${encodeURIComponent(email)}`);
            } else {
                await verifyOtpCode(email, mergedOtp);
                router.push("/success");
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    "OTP verification failed. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!isResetFlow) return;
        if (!email) {
            setError("Email is missing. Please restart the flow.");
            return;
        }

        try {
            setResending(true);
            setError("");
            setInfo("");
            await sendResetOtp(email);
            setInfo("A new OTP has been sent to your email.");
            setTimer(30);
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
                    Verification
                </h1>

                {/* Subtitle */}
                <p
                    className="text-center text-gray-600 mb-6"
                    style={{ fontFamily: "Arial", fontWeight: 200, fontSize: "14px" }}
                >
                    Enter your 6-digit code that you received on your email.
                </p>

                {/* OTP Inputs */}
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-3 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}

                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-full h-14 text-center text-lg border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                style={{ fontFamily: "Arial", fontWeight: 400 }}
                            />
                        ))}
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

                    {/* Timer */}
                    <p
                        className="text-center text-sm text-gray-600 mb-6"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    >
                        00:{timer.toString().padStart(2, "0")}
                    </p>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading || otp.some((d) => !d)}
                        className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    >
                        {loading ? "Verifying..." : "Continue"}
                    </button>
                </form>

                {/* Resend */}
                <p
                    className="mt-6 text-center text-sm text-gray-600"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    If you didn’t receive a code!{" "}
                    <button
                        className="text-black hover:underline"
                        onClick={handleResend}
                        disabled={resending || !isResetFlow}
                    >
                        {resending ? "Resending..." : "Resend"}
                    </button>
                </p>

                <p
                    className="mt-4 text-center text-sm text-gray-600"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    <Link href="/sign-in" className="text-black hover:underline font-semibold">
                        Back to Sign In
                    </Link>
                </p>

            </div>
        </div>
    );
}
