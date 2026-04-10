"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
    ImageIcon,
    Globe,
    Phone,
    Instagram,
    Facebook,
    Linkedin,
    Twitter,
    Youtube
} from "lucide-react";
import {
    clearPendingAuthFlow,
    fetchProfile,
    getPendingAuthFlow,
    isProfileComplete,
    setUserProfile,
} from "@/api/authApi";
import { useIndustries } from "@/hooks/useIndustries";

function BrandSetupPageContent() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [brandName, setBrandName] = useState("");
    const [website, setWebsite] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedSubIndustry, setSelectedSubIndustry] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [resolvedEmail, setResolvedEmail] = useState("");
    const { industries, loading: loadingIndustries } = useIndustries();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const queryEmail = searchParams.get("email");
        const pendingFlow = getPendingAuthFlow();
        const pendingEmail = pendingFlow?.email || "";

        let storedUserEmail = "";
        if (typeof window !== "undefined") {
            try {
                const rawUser = localStorage.getItem("shoutly_user");
                if (rawUser) {
                    const parsedUser = JSON.parse(rawUser) as { email?: string };
                    storedUserEmail = parsedUser.email || "";
                }
            } catch {
                storedUserEmail = "";
            }
        }

        setResolvedEmail(queryEmail || pendingEmail || storedUserEmail || "");
    }, [searchParams]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const rawUser = localStorage.getItem("shoutly_user");
            if (!rawUser) return;

            const parsedUser = JSON.parse(rawUser) as any;
            if (isProfileComplete(parsedUser)) {
                router.replace("/dashboards");
            }
        } catch {
            // ignore invalid local user payload
        }
    }, [router]);

    const connectedSocialMap: Record<string, string> = {
        Instagram: "INSTAGRAM",
        Facebook: "FACEBOOK",
        LinkedIn: "LINKEDIN",
        "X (Twitter)": "TWITTER",
        YouTube: "YOUTUBE",
    };

    const buildLocalProfile = (base: Record<string, unknown>) => {
        const selectedIndustryObj = industries.find(
            (industry) => String(industry.id) === selectedIndustry,
        );
        const selectedSubIndustryObj = (
            selectedIndustryObj?.subIndustries || []
        ).find((subIndustry) => String(subIndustry.id) === selectedSubIndustry);

        return {
            ...base,
            email: resolvedEmail,
            brandName: brandName.trim(),
            website: website.trim(),
            phone: phone.trim(),
            industryId: selectedIndustry,
            subIndustryId: selectedSubIndustry,
            industry_id: selectedIndustry,
            sub_industry_id: selectedSubIndustry,
            selectedIndustryId: selectedIndustry,
            selectedSubIndustryId: selectedSubIndustry,
            industryName:
                selectedIndustryObj?.name || (base.industryName as string | undefined),
            subIndustryName:
                selectedSubIndustryObj?.name ||
                (base.subIndustryName as string | undefined),
        };
    };

    const persistLatestProfile = async (fallbackResponse: unknown) => {
        if (typeof window === "undefined") return;

        let profileFromApi: Record<string, unknown> | null = null;
        try {
            const profileResponse = await fetchProfile();
            const fresh =
                ((profileResponse as { user?: Record<string, unknown> })?.user ||
                    (profileResponse as Record<string, unknown>)) ??
                null;
            if (fresh && typeof fresh === "object") {
                profileFromApi = fresh;
            }
        } catch {
            profileFromApi = null;
        }

        const fallback =
            (((fallbackResponse as { user?: Record<string, unknown> })?.user ||
                (fallbackResponse as Record<string, unknown>)) as
                | Record<string, unknown>
                | undefined) || {};

        const localUser = buildLocalProfile(profileFromApi || fallback);
        localStorage.setItem("shoutly_user", JSON.stringify(localUser));
        window.dispatchEvent(new Event("auth-changed"));
    };

    const handleBrandSetupContinue = () => {
        if (!resolvedEmail) {
            setError("Missing signup email. Please start the flow again.");
            return;
        }

        if (!brandName.trim() || !website.trim()) {
            setError("Brand name and website are required.");
            return;
        }

        if (!selectedIndustry || !selectedSubIndustry) {
            setError("Industry and sub-industry are required.");
            return;
        }

        setError("");
        setStep(3);
    };

    const buildProfileErrorMessage = (err: any) => {
        const baseMessage =
            err?.response?.data?.message ||
            "Failed to update profile. Please try again.";

        const retryDebug = err?.profileRetryDebug as
            | Array<{ label: string; status?: number; message: string }>
            | undefined;

        if (!retryDebug || retryDebug.length === 0) return baseMessage;

        const compact = retryDebug
            .map((entry) => `${entry.label}: ${entry.status || "ERR"}`)
            .join(" | ");

        return `${baseMessage} (${compact})`;
    };

    const handleCompleteSetup = async () => {
        if (!resolvedEmail) {
            setError("Missing signup email. Please start the flow again.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const response = await setUserProfile({
                email: resolvedEmail,
                brandName: brandName.trim(),
                website: website.trim(),
                phone: phone.trim(),
                industryId: selectedIndustry,
                subIndustryId: selectedSubIndustry,
                connectedSocials: selectedAccounts.map(
                    (account) => connectedSocialMap[account],
                ),
            });

            await persistLatestProfile(response);

            clearPendingAuthFlow();
            router.push("/dashboards/settings/brand");
        } catch (err: any) {
            setError(buildProfileErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkipSocialAccounts = async () => {
        if (submitting) return;
        setSubmitting(true);
        setError("");

        try {
            const response = await setUserProfile({
                email: resolvedEmail,
                brandName: brandName.trim(),
                website: website.trim(),
                phone: phone.trim(),
                industryId: selectedIndustry,
                subIndustryId: selectedSubIndustry,
                connectedSocials: [],
            });
            await persistLatestProfile(response);
            clearPendingAuthFlow();
            router.push("/dashboards/settings/brand");
        } catch (err: any) {
            setError(buildProfileErrorMessage(err));
        } finally {
            setSubmitting(false);
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
                    style={{ height: "auto" }}
                />
            </div>

            {/* Title */}
            <h1 className="text-2xl text-black mb-1 text-center font-arial">
                Let's Set Up Your Account
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 text-center mb-6 font-arial">
                This will only take a few minutes.
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md mb-8">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2 font-arial">
                    <span className={step === 1 ? "text-black font-medium font-arial" : ""}>
                        Brand Info
                    </span>
                    {/* <span className={step === 2 ? "text-black font-medium font-arial" : ""}>
                        Brand Colors
                    </span>*/}
                    <span className="font-arial">Connect Accounts</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className={`h-2 bg-black rounded-full transition-all duration-300 ${step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
                            }`}
                    />
                </div>

            </div>

            {/* Card */}
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-lg p-8">

                {/* ================= STEP 1 ================= */}
                {step === 1 && (
                    <>
                        <h2 className="text-lg font-medium text-black mb-1 font-arial">
                            Brand Information
                        </h2>

                        <p className="text-sm text-gray-600 mb-4 font-arial">
                            Add your brand details to personalize your workspace
                        </p>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-arial">
                                <ImageIcon size={16} />
                                Brand Name
                            </label>
                            <input
                                type="text"
                                placeholder="Brand name add..."
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                className="w-full py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial text-gray-900 bg-white"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-arial">
                                <Globe size={16} />
                                Website URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://yourcompany.com"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial text-gray-900 bg-white"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-arial">
                                <Phone size={16} />
                                Phone Number (Optional)
                            </label>
                            <input
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial text-gray-900 bg-white"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-arial">
                                Industry
                            </label>
                            <select
                                value={selectedIndustry}
                                onChange={(e) => {
                                    const nextIndustryId = e.target.value;
                                    setSelectedIndustry(nextIndustryId);
                                    setSelectedSubIndustry("");
                                }}
                                className="w-full py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial text-gray-900 bg-white"
                                disabled={loadingIndustries}
                            >
                                <option value="">
                                    {loadingIndustries ? "Loading industries..." : "Select industry"}
                                </option>
                                {industries.map((industry) => (
                                    <option key={String(industry.id)} value={String(industry.id)}>
                                        {industry.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1 font-arial">
                                Sub-Industry
                            </label>
                            <select
                                value={selectedSubIndustry}
                                onChange={(e) => setSelectedSubIndustry(e.target.value)}
                                className="w-full py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial text-gray-900 bg-white"
                                disabled={!selectedIndustry || loadingIndustries}
                            >
                                <option value="">
                                    {!selectedIndustry
                                        ? "Select industry first"
                                        : "Select sub-industry"}
                                </option>
                                {(industries.find((industry) => String(industry.id) === selectedIndustry)?.subIndustries || []).map((subIndustry) => (
                                    <option key={String(subIndustry.id)} value={String(subIndustry.id)}>
                                        {subIndustry.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-arial">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleBrandSetupContinue}
                            className="w-full h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition font-arial"
                        >
                            Continue
                        </button>
                    </>
                )}

                {/* ================= STEP 2 ================= */}
                {/*    {step === 2 && (
                    <>
                        <h2 className="text-lg font-medium text-black mb-1 font-arial">
                            Choose Your Brand Colors
                        </h2>

                        <p className="text-sm text-gray-600 mb-6 font-arial">
                            These will be used for post overlays and backgrounds
                        </p>

                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-5 mb-6">

                            <div className="w-full">
                                <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-arial">
                                    <Palette size={16} />
                                    Primary Color
                                </label>

                                <div className="flex items-center gap-3">
                                    
                                    <div className="w-12 h-10 rounded-md bg-blue-500 border" />

                                    
                                    <input
                                        type="text"
                                        placeholder="#8B5CF6"
                                        className="flex-1 min-w-0 py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="flex items-center gap-2 text-sm text-gray-700 mb-2 font-arial">
                                    <Palette size={16} />
                                    Secondary Color
                                </label>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-10 rounded-md bg-purple-500 border" />
                                    <input
                                        type="text"
                                        placeholder="#EC4899"
                                        className="flex-1 min-w-0 py-3 px-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black font-arial"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-6 rounded-xl h-36 bg-gradient-to-r from-purple-500 to-pink-500 flex flex-col items-center justify-center text-white">
                            <span className="text-xs opacity-80 font-arial">Preview</span>
                            <span className="text-lg font-medium font-arial">
                                Your Brand Color
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 h-12 bg-white border border-gray-300 text-black rounded-xl hover:bg-gray-50 transition font-arial"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition font-arial"
                            >
                                Continue
                            </button>

                        </div>
                    </>
                )} */}
                {/* ================= STEP 3 ================= */}
                {step === 3 && (
                    <>
                        <h2 className="text-lg font-medium text-black mb-1 font-arial">
                            Connect Your Social Accounts
                        </h2>

                        <p className="text-sm text-gray-600 mb-6 font-arial">
                            Select platforms where you want to auto-schedule posts.
                        </p>

                        {/* Social Accounts */}
                        <div className="space-y-3 mb-4">
                            {[
                                { name: "Instagram", icon: Instagram },
                                { name: "Facebook", icon: Facebook },
                                { name: "LinkedIn", icon: Linkedin },
                                { name: "X (Twitter)", icon: Twitter },
                                { name: "YouTube", icon: Youtube },
                            ].map(({ name, icon: Icon }) => {
                                const active = selectedAccounts.includes(name);

                                return (
                                    <div
                                        key={name}
                                        onClick={() =>
                                            setSelectedAccounts((prev) =>
                                                prev.includes(name)
                                                    ? prev.filter((item) => item !== name)
                                                    : [...prev, name]
                                            )
                                        }
                                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition
              ${active
                                                ? "border-green-500 text-green-600"
                                                : "border-gray-300 text-black"
                                            }`}
                                    >
                                        <Icon
                                            size={20}
                                            className={active ? "text-green-600" : "text-black"}
                                        />
                                        <span className="font-arial">{name}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mb-6 rounded-xl border border-blue-300 bg-blue-50 px-4 py-3">
                            <p className="text-sm text-blue-700 font-arial">
                                You can connect more accounts later from settings
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-arial">
                                {error}
                            </div>
                        )}


                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 h-12 bg-white border border-gray-300 text-black rounded-xl hover:bg-gray-50 transition font-arial"
                            >
                                Back
                            </button>

                            <button
                                onClick={() => handleCompleteSetup()}
                                disabled={submitting}
                                className="flex-1 h-12 bg-[#000000] text-white rounded-xl hover:opacity-90 transition font-arial"
                            >
                                {submitting ? "Saving..." : "Complete Setup"}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleSkipSocialAccounts}
                            disabled={submitting}
                            className="mt-3 w-full text-center text-sm text-gray-500 hover:text-black transition font-arial underline underline-offset-2"
                        >
                            Skip for now — connect accounts later
                        </button>
                    </>
                )}


            </div>
        </div>
    );
}

export default function BrandSetupPage() {
    return (
        <Suspense fallback={null}>
            <BrandSetupPageContent />
        </Suspense>
    );
}
