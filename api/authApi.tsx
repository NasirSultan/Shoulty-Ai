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
    try {
        const response = await axios.post(API_ENDPOINTS.googleLogin, { idToken });
        const { token, user } = response.data;
        localStorage.setItem("shoutly_token", token);
        return { token, user };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const apiMessage =
                (error.response?.data as { message?: string } | undefined)?.message;

            if (status === 401) {
                throw new Error(
                    apiMessage ||
                        "Google session expired or invalid. Please sign in again."
                );
            }

            throw new Error(apiMessage || "Google sign-in failed. Please try again.");
        }

        throw new Error("Google sign-in failed. Please try again.");
    }
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
    // If there's a file, use FormData; otherwise use JSON
    const hasFile = payload.brandLogo && payload.brandLogo instanceof File;

    // Add token header if available
    const headers: Record<string, string> = {};

    if (typeof window !== "undefined") {
        const token = localStorage.getItem("shoutly_token");
        if (token) {
            headers.Authorization = `Bearer ${token}`;
            console.log("[setUserProfile] Token present:", token.substring(0, 20) + "...");
        } else {
            console.warn("[setUserProfile] No token found in localStorage");
        }
    }

    let data: FormData | Record<string, unknown>;
    const coreJsonData: Record<string, unknown> = {
        email: payload.email,
        brandName: payload.brandName,
        website: payload.website,
        phone: payload.phone || "",
    };
    
    if (hasFile) {
        // Use FormData for file upload
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
        data = formData;
        console.log("[setUserProfile] Using FormData (file upload)");
    } else {
        // Use JSON for non-file requests
        // Build a minimal payload with only core fields that backend supports
        const jsonData: Record<string, unknown> = {
            ...coreJsonData,
        };

        // Add connectedSocials if not empty
        if (payload.connectedSocials && payload.connectedSocials.length > 0) {
            jsonData.connectedSocials = payload.connectedSocials;
        }

        // Try to add industry fields if provided - backend might not support these
        if (payload.industryId) {
            jsonData.industryId = payload.industryId;
        }
        if (payload.subIndustryId) {
            jsonData.subIndustryId = payload.subIndustryId;
        }

        data = jsonData;
        headers["Content-Type"] = "application/json";
        console.log("[setUserProfile] Using JSON (no file)");
    }

    // Debug log
    console.log("[setUserProfile] API Endpoint:", API_ENDPOINTS.setProfile);
    console.log("[setUserProfile] Sending data:", data);

    try {
        if (hasFile) {
            const response = await axios.post(API_ENDPOINTS.setProfile, data, {
                headers,
            });
            console.log("[setUserProfile] Success response:", response.data);
            return response.data;
        }

        const payloadAttempts: Array<{ label: string; data: Record<string, unknown> }> = [
            { label: "camelCase industry fields", data: data as Record<string, unknown> },
        ];

        if (payload.industryId || payload.subIndustryId) {
            // Retry with snake_case keys for backends that don't accept camelCase.
            payloadAttempts.push({
                label: "snake_case industry fields",
                data: {
                    ...coreJsonData,
                    ...(payload.connectedSocials && payload.connectedSocials.length > 0
                        ? { connectedSocials: payload.connectedSocials }
                        : {}),
                    ...(payload.industryId ? { industry_id: payload.industryId } : {}),
                    ...(payload.subIndustryId ? { sub_industry_id: payload.subIndustryId } : {}),
                },
            });

            // Final fallback ensures profile still updates if industry fields are rejected.
            payloadAttempts.push({
                label: "core profile only",
                data: {
                    ...coreJsonData,
                    ...(payload.connectedSocials && payload.connectedSocials.length > 0
                        ? { connectedSocials: payload.connectedSocials }
                        : {}),
                },
            });
        }

        let lastError: unknown;
        const attemptStatuses: Array<{ label: string; status?: number; message: string }> = [];
        for (let i = 0; i < payloadAttempts.length; i++) {
            const attempt = payloadAttempts[i];
            try {
                if (i > 0) {
                    console.warn(`[setUserProfile] Retry attempt ${i + 1}/${payloadAttempts.length} with fallback payload shape.`);
                    console.log("[setUserProfile] Retry payload:", attempt.data);
                }
                const response = await axios.post(API_ENDPOINTS.setProfile, attempt.data, {
                    headers,
                });
                console.log("[setUserProfile] Success response:", response.data);
                return response.data;
            } catch (err: unknown) {
                lastError = err;
                const status = axios.isAxiosError(err) ? err.response?.status : undefined;
                const message = axios.isAxiosError(err)
                    ? ((err.response?.data as { message?: string } | undefined)?.message || err.message)
                    : (err instanceof Error ? err.message : "Unknown error");
                attemptStatuses.push({
                    label: attempt.label,
                    status,
                    message,
                });
                // Retry only for backend errors or payload-shape validation failures.
                const retryable = status === 500 || status === 400 || status === 422;
                if (!retryable || i === payloadAttempts.length - 1) {
                    if (err && typeof err === "object") {
                        (err as { profileRetryDebug?: Array<{ label: string; status?: number; message: string }> }).profileRetryDebug = attemptStatuses;
                    }
                    throw err;
                }
            }
        }

        throw lastError;
    } catch (error: unknown) {
        console.error("[setUserProfile] Full error object:", error);
        
        if (error instanceof Error) {
            console.error("[setUserProfile] Error message:", error.message);
            console.error("[setUserProfile] Error stack:", error.stack);
        }

        // Check if it's an axios error
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status: number; statusText: string; data: unknown } };
            console.error("[setUserProfile] Axios error:", {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
            });
            
            // Backend 500 error - might be an incompatibility issue
            if (axiosError.response?.status === 500) {
                console.error("[setUserProfile] Backend returned 500 - endpoint may have an issue or field validation failure");
            }
        }
        
        throw error;
    }
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

export const updateProfile = async (payload: {
    name?: string;
    displayName?: string;
    password?: string;
    phone?: string;
    jobTitle?: string;
    industryId?: string;
    subIndustryId?: string;
    timezone?: string;
    language?: string;
    brandName?: string;
    brandLogo?: string;
    website?: string;
    emailNotification?: boolean;
    pushNotification?: boolean;
    weeklyNotification?: boolean;
    file?: File | null;
}) => {
    const hasFile = payload.file && payload.file instanceof File;
    const headers: Record<string, string> = {};

    let data: FormData | Record<string, unknown>;

    if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        if (payload.name) formData.append("name", payload.name);
        if (payload.displayName) formData.append("displayName", payload.displayName);
        if (payload.password) formData.append("password", payload.password);
        if (payload.phone) formData.append("phone", payload.phone);
        if (payload.jobTitle) formData.append("jobTitle", payload.jobTitle);
        if (payload.industryId) formData.append("industryId", payload.industryId);
        if (payload.subIndustryId) formData.append("subIndustryId", payload.subIndustryId);
        if (payload.timezone) formData.append("timezone", payload.timezone);
        if (payload.language) formData.append("language", payload.language);
        if (payload.brandName) formData.append("brandName", payload.brandName);
        if (payload.brandLogo) formData.append("brandLogo", payload.brandLogo);
        if (payload.website) formData.append("website", payload.website);
        if (payload.emailNotification !== undefined) formData.append("emailNotification", String(payload.emailNotification));
        if (payload.pushNotification !== undefined) formData.append("pushNotification", String(payload.pushNotification));
        if (payload.weeklyNotification !== undefined) formData.append("weeklyNotification", String(payload.weeklyNotification));
        if (payload.file) formData.append("file", payload.file);
        data = formData;
    } else {
        // Use JSON for non-file requests
        data = {};
        if (payload.name !== undefined) (data as any).name = payload.name;
        if (payload.displayName !== undefined) (data as any).displayName = payload.displayName;
        if (payload.password !== undefined) (data as any).password = payload.password;
        if (payload.phone !== undefined) (data as any).phone = payload.phone;
        if (payload.jobTitle !== undefined) (data as any).jobTitle = payload.jobTitle;
        if (payload.industryId !== undefined) (data as any).industryId = payload.industryId;
        if (payload.subIndustryId !== undefined) (data as any).subIndustryId = payload.subIndustryId;
        if (payload.timezone !== undefined) (data as any).timezone = payload.timezone;
        if (payload.language !== undefined) (data as any).language = payload.language;
        if (payload.brandName !== undefined) (data as any).brandName = payload.brandName;
        if (payload.brandLogo !== undefined) (data as any).brandLogo = payload.brandLogo;
        if (payload.website !== undefined) (data as any).website = payload.website;
        if (payload.emailNotification !== undefined) (data as any).emailNotification = payload.emailNotification;
        if (payload.pushNotification !== undefined) (data as any).pushNotification = payload.pushNotification;
        if (payload.weeklyNotification !== undefined) (data as any).weeklyNotification = payload.weeklyNotification;
        headers["Content-Type"] = "application/json";
    }

    try {
        const response = await shoutlyClient.patch(API_ENDPOINTS.profileUpdate, data, {
            headers: Object.keys(headers).length > 0 ? headers : undefined,
        });
        return response.data;
    } catch (error) {
        console.error("[updateProfile] Error:", error);
        throw error;
    }
};

export const updatePassword = async (payload: {
    currentPassword: string;
    newPassword: string;
}) => {
    try {
        const response = await shoutlyClient.patch(API_ENDPOINTS.passwordUpdate, {
            currentPassword: payload.currentPassword,
            newPassword: payload.newPassword,
        });
        return response.data;
    } catch (error) {
        console.error("[updatePassword] Error:", error);
        throw error;
    }
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
