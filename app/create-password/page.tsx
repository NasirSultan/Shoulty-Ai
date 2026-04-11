"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { emailLogin, getPendingAuthFlow, setAccountPassword } from "@/api/authApi";

function CreatePasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const pendingFlow = getPendingAuthFlow();
    const email = searchParams.get("email") || pendingFlow?.email || "";

    const handleCreatePassword = async () => {
        if (!email) {
            setError("Missing email context. Please start signup again.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            await setAccountPassword(email, password);
            const { user } = await emailLogin(email, password);
            localStorage.setItem("shoutly_user", JSON.stringify(user));
            window.dispatchEvent(new Event("auth-changed"));
            router.push(`/account-setup?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    "Failed to set password. Please try again.",
            );
        } finally {
            setSubmitting(false);
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
                    className="text-3xl text-center text-black mb-2"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    New Password
                </h1>

                {/* Subtitle */}
                <p
                    className="text-center text-gray-600 mb-6"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Set the new password for your account so you can login and access all features.
                </p>

                {/* New Password */}
                <label className="block text-sm text-gray-700 mb-1 font-arial">
                    Enter new password
                </label>
                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="8 symbols at least"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border font-arial border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black pr-12 text-black"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Confirm Password */}
                <label className="block text-sm text-gray-700 mb-1 font-arial">
                    Confirm password
                </label>
                <div className="relative mb-6">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="8 symbols at least"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border font-arial border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black pr-12 text-black"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                        {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Button */}
                <button
                    onClick={handleCreatePassword}
                    disabled={submitting}
                    className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition"
                >
                    {submitting ? "CREATING PASSWORD..." : "CREATE PASSWORD"}
                </button>

            </div>
        </div>
    );
}

export default function CreatePasswordPage() {
    return (
        <Suspense fallback={null}>
            <CreatePasswordContent />
        </Suspense>
    );
}
