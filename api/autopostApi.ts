import axios from "axios";
import { API_BASE_URL } from "./configApi";

/* ──────────────────────────────────────────────────────────────
   AXIOS CLIENT (OLD – KEEP THIS FOR AUTH + INTERCEPTORS)
────────────────────────────────────────────────────────────── */
const autopostClient = axios.create({
  baseURL: API_BASE_URL,
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

        if (!window.location.pathname.includes("/sign-in")) {
          window.location.href = `/sign-in?next=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

/* ──────────────────────────────────────────────────────────────
   FETCH BASE (NEW SYSTEM)
────────────────────────────────────────────────────────────── */
const API_BASE = "https://ai-shoutly-backend.onrender.com/api/autopost";

function authHeaders() {
  const token = localStorage.getItem("shoutly_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* ──────────────────────────────────────────────────────────────
   TYPES (MERGED)
────────────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────────────
   NEW FUNCTIONS (FETCH)
────────────────────────────────────────────────────────────── */

/** Get OAuth redirect URL */
export async function getConnectUrl(network: string): Promise<ConnectResponse> {
  const res = await fetch(`${API_BASE}/connect`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ platform: network }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch authorization URL");

  return data;
}

/** Get connected accounts */
export async function getConnectionStatus() {
  const res = await fetch(`${API_BASE}/connection-status`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch connection status");
  return res.json();
}

/** Analytics overview */
export async function getAccountsOverview() {
  const res = await fetch(`${API_BASE}/accounts-overview`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch accounts overview");
  return res.json();
}

/** Handle OAuth callback */
export async function handlePlatformCallback(payload: HandleCallbackPayload) {
  const res = await fetch(`${API_BASE}/handle-callback`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to finalize connection");

  return data;
}

/* ──────────────────────────────────────────────────────────────
   OLD IMPORTANT FUNCTIONS (RESTORED – USING AXIOS)
────────────────────────────────────────────────────────────── */

/** Publish instantly */
export const publishPost = async (payload: PublishPayload): Promise<any> => {
  const response = await autopostClient.post("/api/autopost/publish", payload);
  return response.data;
};

/** Schedule posts */
export const schedulePosts = async (payload: SchedulePayload): Promise<any> => {
  const response = await autopostClient.post("/api/autopost/schedule", payload);
  return response.data;
};

/** (Optional) Keep old connect if still used */
export const connectPlatform = async (platform: Platform): Promise<ConnectResponse> => {
  const response = await autopostClient.post("/api/autopost/connect", { platform });
  return response.data;
};

/** (Optional) Old callback handler */
export const handleCallback = async (payload: HandleCallbackPayload): Promise<any> => {
  const response = await autopostClient.post("/api/autopost/handle-callback", payload);
  return response.data;
};