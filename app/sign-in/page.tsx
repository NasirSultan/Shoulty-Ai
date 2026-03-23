"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { emailLogin, fetchProfile, googleLogin, isProfileComplete } from "@/api/authApi";

function SignInAccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const nextPath = searchParams.get("next");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getSafeNextPath = () => {
        if (!nextPath || !nextPath.startsWith("/")) return null;
        if (nextPath.startsWith("//")) return null;
        return nextPath;
    };

    const resolveAndPersistUser = async (fallbackUser: any) => {
        try {
            const profileResp = await fetchProfile();
            const profileUser =
                (profileResp as { user?: any })?.user ||
                profileResp;

            if (profileUser && typeof profileUser === "object") {
                const merged = { ...fallbackUser, ...profileUser };
                localStorage.setItem("shoutly_user", JSON.stringify(merged));
                return merged;
            }
        } catch {
            // Fallback to login response user
        }

        localStorage.setItem("shoutly_user", JSON.stringify(fallbackUser));
        return fallbackUser;
    };

    const routeAfterLogin = (user: any) => {
        const safeNext = getSafeNextPath();
        if (safeNext) {
            router.push(safeNext);
            return;
        }

        if (isProfileComplete(user)) {
            router.push("/dashboards");
            return;
        }

        const userEmail =
            typeof user?.email === "string" ? user.email : "";
        router.push(userEmail ? `/account-setup?email=${encodeURIComponent(userEmail)}` : "/account-setup");
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const { user } = await googleLogin(credentialResponse.credential!);
            const finalUser = await resolveAndPersistUser(user);
            window.dispatchEvent(new Event("auth-changed"));
            console.log("Logged in as:", finalUser?.name || user?.name);
            routeAfterLogin(finalUser);
        } catch (err) {
            console.error("Google login failed:", err);
            setFormError("Google login failed. Please try again.");
        }
    };

    const onEmailSignIn = async () => {
        setFormError("");

        if (!email.trim() || !password.trim()) {
            setFormError("Please enter both email and password.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setFormError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setFormError("Password must be at least 6 characters.");
            return;
        }

        try {
            setIsSubmitting(true);
            const { user } = await emailLogin(email.trim(), password);
            const finalUser = await resolveAndPersistUser(user);
            window.dispatchEvent(new Event("auth-changed"));
            routeAfterLogin(finalUser);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                "Invalid email or password. Please try again.";
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">

            {/* Logo */}
            <div className="mb-5">
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
                    Welcome Back
                </h1>

                <p
                    className="text-center text-gray-600 mb-6"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Sign in to continue to your dashboard
                </p>

                {/* Google Sign-in */}
                <div className="w-full flex justify-center mb-6">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.error("Google login failed")}
                        width="400"
                    />
                </div>

                {(googleError || formError) && (
                    <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        Sign-in failed: {formError || googleError}
                    </div>
                )}

                {/* Email */}
                <label
                    className="block text-sm text-gray-700 mb-1"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Email Address
                </label>

                <div className="relative mb-5">
                    <EnvelopeIcon className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    />
                </div>

                {/* Password */}
                <label
                    className="block text-sm text-gray-700 mb-1"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    Password
                </label>

                <div className="relative mb-3">
                    <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400 text-black"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-arial">
                        Remember me
                    </label>

                    <Link
                        href="/forgot-password"
                        className="text-sm text-[#000000] hover:underline font-arial"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Sign In Button - ✅ Fixed */}
                <button
                    onClick={onEmailSignIn}
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition mb-4"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </button>

                <p className="text-center text-sm text-gray-600 font-arial">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="font-semibold text-[#000000] hover:underline font-arial">
                        Sign up
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default function SignInAccountPage() {
    return (
        <Suspense fallback={null}>
            <SignInAccountContent />
        </Suspense>
    );
}