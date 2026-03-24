// api/authApi.tsx
import axios from "axios";
import { SHOUTLY_API_BASE_URL, API_ENDPOINTS } from "./configApi";

type PendingAuthFlow = {
    email: string;
    name?: string;
    source?: "email" | "google";
};

const PENDING_AUTH_KEY = "shoutly_pending_auth";

// Axios instance with base URL — token is attached automatically via interceptor
const shoutlyClient = axios.create({
    baseURL: SHOUTLY_API_BASE_URL,
});

shoutlyClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("shoutly_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const googleLogin = async (idToken: string) => {
    const response = await shoutlyClient.post(API_ENDPOINTS.googleLogin, { idToken });
    const { token, user } = response.data;
    localStorage.setItem("shoutly_token", token);
    return { token, user };
};

export const emailLogin = async (email: string, password: string) => {
    const response = await shoutlyClient.post(API_ENDPOINTS.emailLogin, {
        email,
        password,
    });
    const { token, user } = response.data;
    localStorage.setItem("shoutly_token", token);
    return { token, user };
};

export const registerUser = async (payload: {
    name: string;
    email: string;
    role?: "USER";
}) => {
    const response = await axios.post(API_ENDPOINTS.register, {
        ...payload,
        role: payload.role || "USER",
    });
    return response.data;
};

export const verifyOtpCode = async (email: string, otp: string) => {
    const response = await axios.post(API_ENDPOINTS.verifyOtp, {
        email,
        otp,
    });
    return response.data;
};

export const sendResetOtp = async (email: string) => {
    const response = await axios.post(API_ENDPOINTS.sendOtp, {
        email,
    });
    return response.data;
};

export const verifyOtpForReset = async (email: string, otp: string) => {
    const response = await axios.post(API_ENDPOINTS.verifyOtpReset, {
        email,
        otp,
    });
    return response.data;
};

export const resetPassword = async (email: string, password: string) => {
    const response = await axios.post(API_ENDPOINTS.resetPassword, {
        email,
        password,
    });
    return response.data;
};

export const setAccountPassword = async (email: string, password: string) => {
    const response = await axios.post(API_ENDPOINTS.setPassword, {
        email,
        password,
    });
    return response.data;
};

export const setUserProfile = async (payload: {
    email: string;
    brandName: string;
    website: string;
    phone?: string;
    connectedSocials: string[];
    industryId?: string;
    subIndustryId?: string;
    brandLogo?: File | null;
}) => {
    const formData = new FormData();
    formData.append("email", payload.email);
    formData.append("brandName", payload.brandName);
    formData.append("website", payload.website);
    formData.append("phone", payload.phone || "");
    payload.connectedSocials.forEach((social) => {
        formData.append("connectedSocials", social);
    });
    if (payload.industryId) {
        formData.append("industryId", payload.industryId);
    }
    if (payload.subIndustryId) {
        formData.append("subIndustryId", payload.subIndustryId);
    }
    if (payload.brandLogo) {
        formData.append("brandLogo", payload.brandLogo);
    }

    const response = await axios.post(API_ENDPOINTS.setProfile, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const savePendingAuthFlow = (flow: PendingAuthFlow) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(flow));
};

export const getPendingAuthFlow = (): PendingAuthFlow | null => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(PENDING_AUTH_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as PendingAuthFlow;
    } catch {
        sessionStorage.removeItem(PENDING_AUTH_KEY);
        return null;
    }
};

export const clearPendingAuthFlow = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PENDING_AUTH_KEY);
};

export const logout = () => {
    localStorage.removeItem("shoutly_token");
};

// ── User ──────────────────────────────────────────────────────────────────────

export const fetchProfile = async () => {
    const response = await shoutlyClient.get(API_ENDPOINTS.userProfile);
    return response.data;
};

export const isProfileComplete = (user: any): boolean => {
    if (!user || typeof user !== "object") return false;

    const brandName =
        typeof user.brandName === "string"
            ? user.brandName.trim()
            : "";
    const website =
        typeof user.website === "string"
            ? user.website.trim()
            : "";

    return Boolean(brandName && website);
};

export default shoutlyClient;
