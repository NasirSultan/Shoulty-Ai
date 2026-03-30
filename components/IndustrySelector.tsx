"use client";
import React, { useState } from "react";

interface SubIndustry {
    id: string | number;
    name: string;
}

interface Industry {
    id: string | number;
    name: string;
    subIndustries: SubIndustry[];
}

interface IndustrySelectorProps {
    selectedIndustry: string;
    onIndustryChange: (industryId: string) => void;
    onSubIndustryChange: (subIndustryId: string | null) => void;
    industries: Industry[];
    loading: boolean;
}

export default function IndustrySelector({
    selectedIndustry,
    onIndustryChange,
    onSubIndustryChange,
    industries,
    loading
}: IndustrySelectorProps) {
    const [showSubIndustries, setShowSubIndustries] = useState(false);

    const handleIndustryChange = (industryId: string) => {
        onIndustryChange(industryId);
        onSubIndustryChange(null);
        setShowSubIndustries(false);
    };

    const selectedIndustryData = industries.find(
        (ind) => String(ind.id) === String(selectedIndustry)
    );

    if (loading) {
        return (
            <div className="border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden bg-slate-50/50">
                <div className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden bg-slate-50/50">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                    1
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Select your industry
                </h3>
            </div>

            <select
                value={selectedIndustry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none text-slate-700"
            >
                <option value="">Choose an industry...</option>
                {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                        {industry.name}
                    </option>
                ))}
            </select>

            {selectedIndustryData && selectedIndustryData.subIndustries.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => setShowSubIndustries(!showSubIndustries)}
                        className="text-sm text-slate-600 hover:text-slate-800 underline"
                    >
                        {showSubIndustries ? 'Hide' : 'Show'} sub-industries
                    </button>

                    {showSubIndustries && (
                        <div className="mt-2 space-y-2">
                            {selectedIndustryData.subIndustries.map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => onSubIndustryChange(String(sub.id))}
                                    className="block w-full text-left p-2 rounded hover:bg-slate-100 text-sm"
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}