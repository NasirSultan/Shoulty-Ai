// api/homeApi.ts
import { API_ENDPOINTS } from "./configApi";

interface SubIndustry {
    id: string | number;
    name: string;
}

interface Industry {
    id: string;
    name: string;
    subIndustries?: SubIndustry[];
}

export const fetchImages = async (subIndustryId?: string | null) => {
    try {
        let url = API_ENDPOINTS.displayImages;
        if (subIndustryId) {
            url += `?subIndustryId=${subIndustryId}`;
        }
        console.log("📸 Fetching images from:", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("📸 Images response:", data);
        const images = Array.isArray(data)
            ? data
            : Array.isArray(data.images)
            ? data.images
            : data.data || [];
        console.log("📸 Processed images:", images);
        return images;
    } catch (error) {
        console.error("Failed to fetch images:", error);
        return [];
    }
};

export const fetchIndustries = async () => {
    try {
        const url = API_ENDPOINTS.industries;
        console.log("🏢 Fetching industries from:", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("🏢 Industries response:", data);
        const industriesArray = Array.isArray(data)
            ? data
            : data?.industries || data?.data || [];
        console.log("🏢 Industries array:", industriesArray);
        return industriesArray.map((ind: Industry) => ({
            id: ind.id,
            name: ind.name,
            subIndustries: ind.subIndustries || [],
        }));
    } catch (error) {
        console.error("Industry fetch failed:", error);
        return [];
    }
};