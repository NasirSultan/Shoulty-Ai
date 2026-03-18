// api/authApi.tsx
import axios from "axios";
import { SHOUTLY_API_BASE_URL, API_ENDPOINTS } from "./configApi";

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

export const logout = () => {
    localStorage.removeItem("shoutly_token");
};

// ── User ──────────────────────────────────────────────────────────────────────

export const fetchProfile = async () => {
    const response = await shoutlyClient.get(API_ENDPOINTS.userProfile);
    return response.data;
};

export default shoutlyClient;
