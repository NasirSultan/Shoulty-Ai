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

const INDUSTRIES_CACHE_KEY = "shoutly:industries:v1";
const INDUSTRIES_CACHE_TTL_MS = 30 * 60 * 1000;

let industriesMemoryCache:
    | { data: Array<{ id: string; name: string; subIndustries: SubIndustry[] }>; timestamp: number }
    | null = null;
let industriesInFlight: Promise<Array<{ id: string; name: string; subIndustries: SubIndustry[] }>> | null = null;

const normalizeIndustries = (payload: unknown) => {
    const industriesArray = Array.isArray(payload)
        ? payload
        : (payload as { industries?: Industry[]; data?: Industry[] })?.industries ||
          (payload as { industries?: Industry[]; data?: Industry[] })?.data ||
          [];

    return industriesArray.map((ind: Industry) => ({
        id: ind.id,
        name: ind.name,
        subIndustries: ind.subIndustries || [],
    }));
};

const readIndustriesFromSession = () => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(INDUSTRIES_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
            timestamp: number;
            data: Array<{ id: string; name: string; subIndustries: SubIndustry[] }>;
        };

        if (!parsed?.timestamp || !Array.isArray(parsed?.data)) return null;
        if (Date.now() - parsed.timestamp > INDUSTRIES_CACHE_TTL_MS) return null;
        return parsed;
    } catch {
        return null;
    }
};

const writeIndustriesToSession = (data: Array<{ id: string; name: string; subIndustries: SubIndustry[] }>) => {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(
            INDUSTRIES_CACHE_KEY,
            JSON.stringify({ timestamp: Date.now(), data })
        );
    } catch {
        // Ignore storage quota or private-mode storage errors.
    }
};

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
    const now = Date.now();

    if (industriesMemoryCache && now - industriesMemoryCache.timestamp <= INDUSTRIES_CACHE_TTL_MS) {
        return industriesMemoryCache.data;
    }

    const sessionCached = readIndustriesFromSession();
    if (sessionCached) {
        industriesMemoryCache = sessionCached;
        return sessionCached.data;
    }

    if (industriesInFlight) {
        return industriesInFlight;
    }

    const requestPromise = (async () => {
        try {
            const url = API_ENDPOINTS.industries;
            console.log("🏢 Fetching industries from:", url);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000);

            let res: Response;
            try {
                res = await fetch(url, {
                    signal: controller.signal,
                    cache: "force-cache",
                });
            } finally {
                clearTimeout(timeoutId);
            }

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const normalized = normalizeIndustries(data);

            industriesMemoryCache = { data: normalized, timestamp: Date.now() };
            writeIndustriesToSession(normalized);
            return normalized;
        } catch (error) {
            if (industriesMemoryCache?.data?.length) {
                return industriesMemoryCache.data;
            }

            const staleSession = readIndustriesFromSession();
            if (staleSession?.data?.length) {
                return staleSession.data;
            }

            console.error("Industry fetch failed:", error);
            return [];
        } finally {
            industriesInFlight = null;
        }
    })();

    industriesInFlight = requestPromise;
    return requestPromise;
};