"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { registerUser, savePendingAuthFlow } from "@/api/authApi";

type GoogleProfile = {
    email?: string;
    name?: string;
};

const decodeGoogleProfile = (credential: string): GoogleProfile | null => {
    try {
        const payload = credential.split(".")[1];
        if (!payload) return null;
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(normalized);
        return JSON.parse(decoded) as GoogleProfile;
    } catch {
        return null;
    }
};

export default function CreateAccountPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const showRegisterError = (message?: string) => {
        if (message === "Email already exists") {
            setError("An account with this email already exists. Please sign in instead.");
            return;
        }

        setError(message || "Failed to register. Please try again.");
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setError("");
        if (!credentialResponse.credential) {
            setError("Google sign-up failed. Missing credential.");
            return;
        }

        try {
            const profile = decodeGoogleProfile(credentialResponse.credential);
            const googleEmail = profile?.email;
            const googleName = profile?.name || "Google User";

            if (!googleEmail) {
                setError("Unable to read Google account email. Please try again.");
                return;
            }

            const data = await registerUser({
                name: googleName,
                email: googleEmail,
                role: "USER",
            });

            savePendingAuthFlow({
                name: googleName,
                email: googleEmail,
                source: "google",
            });
            router.push(`/verification?email=${encodeURIComponent(googleEmail)}&source=google`);
        } catch (err: any) {
            showRegisterError(err?.response?.data?.message);
        }
    };

    const handleRegister = async () => {
        setError("");
        if (!name || !email) {
            setError("Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            const data = await registerUser({
                name,
                email,
                role: "USER",
            });

            savePendingAuthFlow({
                name,
                email,
                source: "email",
            });
            router.push("/verification?email=" + encodeURIComponent(email));
        } catch (err: any) {
            showRegisterError(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pt-20 pb-10">

            {/* Logo */}
            <div className="mb-4 md:mb-5">
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={160}
                    height={110}
                    priority
                    className="mx-auto w-32 sm:w-40 h-auto"
                />
            </div>

            {/* Card */}
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-5 sm:p-8">

                <h1 className="text-2xl text-center text-black mb-2" style={{ fontFamily: "Arial", fontWeight: 400 }}>
                    Create Account
                </h1>

                {/* Google Sign Up Button */}
                <div className="w-full flex justify-center mb-6 md:mb-8 overflow-hidden">
                    <div className="w-full max-w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google sign-up failed. Please try again.")}
                            width="320"
                            text="signup_with"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-sm text-gray-500">or</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Full Name */}
                <label className="block text-sm text-gray-700 mb-1" style={{ fontFamily: "Arial", fontWeight: 400 }}>
                    Full Name
                </label>
                <div className="relative mb-4">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    />
                </div>

                {/* Email */}
                <label className="block text-sm text-gray-700 mb-1" style={{ fontFamily: "Arial", fontWeight: 400 }}>
                    Email Address
                </label>
                <div className="relative mb-4">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-400"
                        style={{ fontFamily: "Arial", fontWeight: 400 }}
                    />
                </div>

                {error && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition mb-4"
                    style={{ fontFamily: "Arial", fontWeight: 400 }}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-sm text-gray-600 mb-4" style={{ fontFamily: "Arial", fontWeight: 400 }}>
                    Already have an account?{" "}
                    <Link href="/sign-in" className="font-semibold text-[#000000] hover:underline">
                        Sign in
                    </Link>
                </p>

                <p className="text-center text-xs text-gray-500" style={{ fontFamily: "Arial", fontWeight: 400 }}>
                    By creating an account, you agree to our{" "}
                    <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                    <span className="underline cursor-pointer">Privacy Policy</span>
                </p>
            </div>
        </div>
    );
}