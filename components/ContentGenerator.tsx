"use client";
import React, { useState } from "react";
import { fetchImages } from "@/api/homeApi";

interface ImageItem {
    id?: string;
    file?: string;
    url?: string;
    name?: string;
    title?: string;
}

interface ContentGeneratorProps {
    selectedSubIndustry: string | null;
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

export default function ContentGenerator({
    selectedSubIndustry,
    searchTerm,
    onSearchChange
}: ContentGeneratorProps) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const refreshImages = async () => {
        if (!selectedSubIndustry) return;

        setLoadingImages(true);
        try {
            const data = await fetchImages(selectedSubIndustry);
            setImages(data);
        } catch {
        } finally {
            setLoadingImages(false);
        }
    };

    React.useEffect(() => {
        if (selectedSubIndustry) {
            refreshImages();
        } else {
            setImages([]);
        }
    }, [selectedSubIndustry]);

    const filteredImages = images.filter((img) => {
        if (!searchTerm) return true;
        return (
            img.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm bg-slate-50/50">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                    2
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Generate content
                </h3>
            </div>

            {!selectedSubIndustry ? (
                <p className="text-slate-500 text-sm">
                    Please select an industry and sub-industry first.
                </p>
            ) : (
                <>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {loadingImages ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse"></div>
                            ))
                        ) : (
                            filteredImages.slice(0, 6).map((img, index) => (
                                <div key={img.id || index} className="aspect-square bg-slate-200 rounded-lg overflow-hidden">
                                    {img.url ? (
                                        <img
                                            src={img.url}
                                            alt={img.name || img.title || 'Content image'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 text-xs">
                                            No image
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={refreshImages}
                        disabled={loadingImages}
                        className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        {loadingImages ? 'Loading...' : 'Refresh Images'}
                    </button>
                </>
            )}
        </div>
    );
}