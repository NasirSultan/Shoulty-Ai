import axios from "axios";
import { SHOUTLY_API_BASE_URL } from "./configApi";

const autopostClient = axios.create({
    baseURL: SHOUTLY_API_BASE_URL,
});

autopostClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("shoutly_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

autopostClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("🔒 Unauthorized! Redirecting to sign-in...");
            if (typeof window !== "undefined") {
                localStorage.removeItem("shoutly_token");
                localStorage.removeItem("shoutly_user");
                // Avoid infinite redirect loops if already on sign-in
                if (!window.location.pathname.includes("/sign-in")) {
                    window.location.href = `/sign-in?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                }
            }
        }
        return Promise.reject(error);
    }
);

export type Platform = "facebook" | "instagram" | "linkedin" | "youtube";

export interface ConnectResponse {
    redirectUrl: string;
}

export interface HandleCallbackPayload {
    sessionToken?: string;
    account_id?: string;
    network_unique_id?: string;
    username?: string;
    network?: string;
}

export interface PublishPayload {
    content: string;
    platforms: string[];
    mediaUrls?: string[];
}

export interface PostItem {
    content: string;
    scheduledAt: string;
    mediaUrls?: string[];
}

export interface SchedulePayload {
    platforms: string[];
    posts: PostItem[];
}

export const connectPlatform = async (platform: Platform): Promise<ConnectResponse> => {
    const response = await autopostClient.post("/api/autopost/connect", { platform });
    return response.data;
};

export const handleCallback = async (payload: HandleCallbackPayload): Promise<any> => {
    const response = await autopostClient.post("/api/autopost/handle-callback", payload);
    return response.data;
};

export const publishPost = async (payload: PublishPayload): Promise<any> => {
    const response = await autopostClient.post("/api/autopost/publish", payload);
    return response.data;
};

export const schedulePosts = async (payload: SchedulePayload): Promise<any> => {
    const response = await autopostClient.post("/api/autopost/schedule", payload);
    return response.data;
};
