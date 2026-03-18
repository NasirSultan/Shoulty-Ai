"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { googleLogin } from "@/api/authApi";
import ShoutlyLogo from "../common/ShoutlyLogo";
import AuthBackground from "./AuthBackground";

export default function SignUpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState(googleError ? `Sign-in failed: ${googleError}` : "");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGoogleSignIn = async () => {
        try {
            setError("");
        } catch (err) {
            console.error("Google sign-in error:", err);
            setError("Something went wrong with Google sign-in. Please try again.");
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const { user } = await googleLogin(credentialResponse.credential!);
            localStorage.setItem("shoutly_user", JSON.stringify(user));
            window.dispatchEvent(new Event("auth-changed"));
            router.push("/account-setup");
        } catch (err) {
            console.error("Google sign-up failed:", err);
            setError("Google sign-up failed. Please try again.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!formData.fullName || !formData.email || !formData.password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            // Replace this with real signup logic for your backend
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push("/verify-email");
        } catch (err) {
            console.error("Signup error:", err);
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 sm:p-10 overflow-hidden">
            <AuthBackground />

            <div className="w-full max-w-[480px] z-10 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-10">
                    <Link href="/">
                        <ShoutlyLogo />
                    </Link>
                </div>

                {/* Main Card */}
                <div className="w-full bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center">
                    <h1 className="text-center text-[32px] font-bold text-gray-900 mb-8">
                        Create Account
                    </h1>

                    {/* Google Login */}
                    <div className="w-full flex justify-center mb-8">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google sign-up failed. Please try again.")}
                            width="400"
                            text="signup_with"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2.5 ml-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-5 text-gray-900 text-sm focus:bg-white focus:border-brand-500 transition-all outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2.5 ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-5 text-gray-900 text-sm focus:bg-white focus:border-brand-500 transition-all outline-none shadow-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2.5 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-14 text-gray-900 text-sm focus:bg-white focus:border-brand-500 transition-all outline-none shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-black text-white rounded-xl font-bold text-base hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-70 mt-4"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {error && (
                        <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                    )}

                    <p className="mt-8 text-center text-sm font-bold text-gray-500">
                        Already have an account?{" "}
                        <Link href="/signin" className="text-gray-900 font-bold hover:text-brand-600 transition-colors">
                            Sign in
                        </Link>
                    </p>

                    <p className="mt-6 text-center text-[11px] text-gray-400 leading-relaxed px-4">
                        By creating an account, you agree to our <Link href="/terms" className="underline font-bold text-gray-400">Terms of Service</Link> and <br /> <Link href="/privacy" className="underline font-bold text-gray-400">Privacy Policy</Link>
                    </p>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}