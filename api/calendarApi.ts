// Calendar APIs Integration
// Base URL: https://backend.shoutlyai.com

import axios from "axios";
import { API_BASE_URL } from "./configApi";

const BASE_URL = API_BASE_URL;

// Create axios instance with automatic token injection
const calendarClient = axios.create({
  baseURL: BASE_URL,
});

calendarClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("shoutly_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📅 Token attached to request");
    }
  }
  return config;
});

// ── Types ──────────────────────────────────────────────────────────────────
export interface DisplayImage {
  id: string;
  file: string;
  subIndustryId: string;
}

export interface CalendarPost {
  id: string;
  userId: string;
  subIndustryId: string;
  contentId: string;
  reelId: string;
  imageId: string;
  type: "IMAGE" | "REEL";
  postTime: string; // ISO format
  status: "SCHEDULED" | "PUBLISHED" | "DRAFT";
}

export interface CreatePlanRequest {
  postTime: string; // HH:MM format
}

export interface CreatePlanResponse {
  success: boolean;
  message: string;
  planType?: "FREE" | "PAID";
  startPlan?: string;
  // The create endpoint returns the fully resolved post list — same shape as
  // GET /api/calendar/plan's `posts` (content text/hashtags, media file URL
  // already resolved), not the raw CalendarPost row.
  meta?: {
    totalPosts: number;
  };
  posts?: Post[];
}

export interface GetPlanResponse {
  success: boolean;
  message?: string;
  meta?: {
    totalPosts: number;
    connectedSocials: unknown[];
  };
  posts?: Post[];
}

export interface Post {
  postId: string;
  postTime: string;
  status: "SCHEDULED" | "PUBLISHED" | "DRAFT";
  content: {
    contentId: string;
    text: string;
    hashtags: string[];
  };
  media: {
    type: "IMAGE" | "REEL";
    id: string;
    file: string;
  };
}

export interface UpdatePostRequest {
  postTime?: string;
  contentText?: string;
  reelId?: string;
  imageUrl?: string;
  /** Only forward this when it maps to a real backend PostStatus value
   *  (SCHEDULED/POSTING/SKIP/POSTED/FAILED) — omit rather than send an
   *  unmapped value like a frontend-only "draft" status. */
  status?: string;
  /** IANA timezone, e.g. "Asia/Karachi". Used to interpret postTime. */
  timezone?: string;
}

export interface UpdatePostResponse {
  success: boolean;
  message: string;
  // updatePost now returns through formatPost() on the backend, same shape
  // as GET /calendar/plan and GET /calendar/post/:id — not the raw row.
  post?: Post;
}

export interface GetPostDetailResponse {
  success: boolean;
  message?: string;
  post?: Post;
}

export interface ErrorResponse {
  success: false;
  statusCode?: number;
  message: string;
  error?: string;
}

// ── Utility: Get Authorization Header ──────────────────────────────────────
// NOTE: These are deprecated, use calendarClient axios instance instead

// ────────────────────────────────────────────────────────────────────────────
// 1. RANDOM IMAGE API - Get One Image by SubIndustry
// ────────────────────────────────────────────────────────────────────────────
export async function getRandomImageBySubIndustry(
  subIndustryId: string
): Promise<DisplayImage> {
  if (!subIndustryId) {
    throw new Error("subIndustryId is required");
  }

  const url = new URL(`${BASE_URL}/api/display-images/one-image`);
  url.searchParams.append("subIndustryId", subIndustryId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.message || `Failed to fetch image (${response.status})`);
  }

  const data = (await response.json()) as { image: DisplayImage };
  return data.image;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. CREATE MONTHLY PLAN
// ────────────────────────────────────────────────────────────────────────────
export async function createMonthlyPlan(
  request: CreatePlanRequest,
  token?: string
): Promise<CreatePlanResponse> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null);

  if (!authToken) {
    return { success: false, message: "Authentication token is required" };
  }

  try {
    const res = await fetch(`${BASE_URL}/api/calendar/plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({ postTime: request.postTime.slice(0, 5) }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      return { success: false, message: "Session expired — unauthorized." };
    }

    // Return the body as-is — backend sends { success, message, ... }
    // If backend returned a non-success shape without a success field, normalise it
    if (typeof data.success === "undefined") {
      return { success: !res.ok, message: data.message || (res.ok ? "OK" : "Request failed") };
    }
    return data as CreatePlanResponse;
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to create plan" };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 3. GET USER PLAN
// ────────────────────────────────────────────────────────────────────────────
export async function getUserPlan(token?: string): Promise<GetPlanResponse> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null);

  if (!authToken) {
    const error = "Authentication token is required";
    console.error("❌ getUserPlan:", error);
    throw new Error(error);
  }

  try {
    console.log("📋 getUserPlan: Fetching from", `${BASE_URL}/api/calendar/plan`);
    console.log("📋 getUserPlan: Token present:", authToken ? "✓" : "✗");

    const response = await calendarClient.get("/api/calendar/plan", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    console.log("✅ getUserPlan: Success", response.data);
    return response.data as GetPlanResponse;
  } catch (error: any) {
    // ── Handle 401 Unauthorized (session expired) ──────────────────────────────
    if (error.response?.status === 401) {
      const err = new Error("Session expired. Please login again.");
      (err as any).statusCode = 401;
      throw err;
    }

    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch plan";
    console.error("❌ getUserPlan error:", errorMsg, error.response?.data);
    const err = new Error(errorMsg);
    (err as any).statusCode = error.response?.status || 500;
    throw err;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 3b. CREATE CALENDAR POST
// ────────────────────────────────────────────────────────────────────────────
export interface CreatePostRequest {
  subIndustryId: string;
  /** "HH:mm" (24-hour) ONLY — the backend always uses today's date regardless
   *  of anything else sent. There is currently no way to schedule a future day
   *  through this endpoint (see calendar.service.ts toUTC()). */
  postTime: string;
  contentText?: string;
  /** Existing hosted image URL. If both imageUrl and a file are provided, imageUrl wins. */
  imageUrl?: string;
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  post?: CalendarPost;
}

/** POST /api/calendar/post — always multipart/form-data (backend uses FileInterceptor).
 *  Every created post is status SCHEDULED; there is no "publish immediately" flag. */
export async function createCalendarPost(
  request: CreatePostRequest,
  token?: string,
  file?: File
): Promise<CreatePostResponse> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null);

  if (!authToken) {
    throw new Error("Authentication token is required");
  }
  if (!request.subIndustryId) {
    throw new Error("subIndustryId is required");
  }
  if (!/^\d{2}:\d{2}$/.test(request.postTime)) {
    throw new Error("postTime must be in HH:mm format");
  }

  const formData = new FormData();
  formData.append("subIndustryId", request.subIndustryId);
  formData.append("postTime", request.postTime);
  if (request.contentText) formData.append("contentText", request.contentText);
  if (request.imageUrl) {
    formData.append("imageUrl", request.imageUrl);
  } else if (file) {
    formData.append("image", file);
  }

  try {
    const response = await calendarClient.post(`/api/calendar/post`, formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as CreatePostResponse;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to create post";
    throw new Error(errorMsg);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 4. UPDATE CALENDAR POST
// ────────────────────────────────────────────────────────────────────────────
export async function updateCalendarPost(
  postId: string,
  request: UpdatePostRequest,
  token?: string,
  file?: File
): Promise<UpdatePostResponse> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null);

  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  if (!postId) {
    throw new Error("Post ID is required");
  }

  // Validate optional fields
  if (request.postTime && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(request.postTime)) {
    throw new Error("Post time must be in ISO format");
  }
  if (request.contentText && request.contentText.trim() === "") {
    throw new Error("Content text cannot be empty");
  }

  try {
    if (file) {
      // File upload: multipart/form-data
      const formData = new FormData();
      formData.append("image", file);
      if (request.postTime) formData.append("postTime", request.postTime);
      if (request.contentText) formData.append("contentText", request.contentText);
      if (request.reelId) formData.append("reelId", request.reelId);
      if (request.status) formData.append("status", request.status);
      if (request.timezone) formData.append("timezone", request.timezone);

      const response = await calendarClient.patch(`/api/calendar/post/${postId}`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data as UpdatePostResponse;
    } else {
      // JSON only
      const response = await calendarClient.patch(`/api/calendar/post/${postId}`, request, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data as UpdatePostResponse;
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to update post";
    throw new Error(errorMsg);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 5. GET POST DETAIL BY ID
// ────────────────────────────────────────────────────────────────────────────
export async function getPostDetail(
  postId: string,
  token?: string
): Promise<GetPostDetailResponse> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null);

  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  if (!postId) {
    throw new Error("Post ID is required");
  }

  try {
    const response = await calendarClient.get(`/api/calendar/post/${postId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data as GetPostDetailResponse;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch post";
    throw new Error(errorMsg);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper functions for common operations
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all posts for the current user and group by date
 */
export async function getPostsByDate(
  token?: string
): Promise<Map<string, Post[]>> {
  const planResponse = await getUserPlan(token);

  if (!planResponse.success || !planResponse.posts) {
    return new Map();
  }

  const postsByDate = new Map<string, Post[]>();

  planResponse.posts.forEach((post) => {
    const dateKey = new Date(post.postTime).toISOString().split("T")[0];
    if (!postsByDate.has(dateKey)) {
      postsByDate.set(dateKey, []);
    }
    postsByDate.get(dateKey)!.push(post);
  });

  return postsByDate;
}

/**
 * Create a plan and get the generated posts
 */
export async function createPlanAndFetch(
  request: CreatePlanRequest,
  token?: string
): Promise<Post[]> {
  const createResponse = await createMonthlyPlan(request, token);

  if (!createResponse.success) {
    throw new Error(createResponse.message || "Failed to create plan");
  }

  // Re-fetch to get full post details with all fields
  const planResponse = await getUserPlan(token);

  return planResponse.posts || [];
}

export interface CreateManualPostRequest {
  /** Full ISO datetime, e.g. "2026-07-25T14:30:00" — any date, not just today. */
  postTime: string;
  contentText?: string;
  /** Existing hosted image URL. Ignored if imageFile is provided — the file
   *  itself is uploaded instead. */
  imageUrl?: string;
  /** IANA timezone, e.g. "Asia/Karachi". Defaults to the user's saved
   *  profile timezone on the backend if omitted. */
  timezone?: string;
}

export interface CreateManualPostResponse {
  success: boolean;
  message: string;
  // createManualPost returns through formatPost() on the backend, same shape
  // as GET /calendar/plan and GET /calendar/post/:id.
  post?: Post;
}

/** POST /api/calendar/post/manual — for user-created personal posts (as
 *  opposed to auto-generated ones from the monthly plan). Does not require
 *  subIndustryId — the backend resolves the user's own industry server-side.
 *  Supports any postTime date, not just today.
 *
 *  Pass imageFile for a real upload (sent as multipart/form-data, matching
 *  the backend's FileInterceptor). Only fall back to imageUrl when there is
 *  no new file — e.g. reusing an already-hosted URL. Never pass a blob:
 *  object URL here; those only resolve inside the tab that created them and
 *  will silently fail to load for everyone else once saved. */
export async function createManualPost(
  request: CreateManualPostRequest,
  token?: string,
  imageFile?: File
): Promise<CreateManualPostResponse> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("shoutly_token") : null);

  if (!authToken) {
    throw new Error("Authentication token is required");
  }

  try {
    if (imageFile) {
      // File upload: multipart/form-data
      const formData = new FormData();
      formData.append("postTime", request.postTime);
      if (request.contentText) formData.append("contentText", request.contentText);
      if (request.timezone) formData.append("timezone", request.timezone);
      formData.append("image", imageFile);

      const response = await calendarClient.post(`/api/calendar/post/manual`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data as CreateManualPostResponse;
    } else {
      // JSON only
      const response = await calendarClient.post(`/api/calendar/post/manual`, request, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data as CreateManualPostResponse;
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to create post";
    throw new Error(errorMsg);
  }
}