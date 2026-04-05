// Calendar APIs Integration
// Base URL: https://ai-shoutly-backend.onrender.com

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ai-shoutly-backend.onrender.com";

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
  prompt: string;
  subIndustries: string[];
  postTime: string; // HH:MM format
}

export interface CreatePlanResponse {
  success: boolean;
  message: string;
  planType?: "FREE" | "PAID";
  startPlan?: string;
  totalPosts?: number;
  posts?: CalendarPost[];
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
}

export interface UpdatePostResponse {
  success: boolean;
  message: string;
  post?: CalendarPost;
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
    const error = "Authentication token is required";
    console.error("❌ createMonthlyPlan:", error);
    throw new Error(error);
  }

  // Validate input
  if (!request.prompt || request.prompt.trim() === "") {
    throw new Error("Prompt cannot be empty");
  }
  if (!Array.isArray(request.subIndustries) || request.subIndustries.length === 0) {
    throw new Error("At least one sub-industry must be selected");
  }
  if (!request.postTime || !/^\d{2}:\d{2}$/.test(request.postTime)) {
    throw new Error("Post time must be in HH:MM format");
  }

  try {
    console.log("📅 createMonthlyPlan: Creating plan with request:", request);
    console.log("📅 createMonthlyPlan: Token present:", authToken ? "✓" : "✗");
    
    const response = await calendarClient.post("/api/calendar/plan", request, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ createMonthlyPlan: Success", response.data);
    return response.data as CreatePlanResponse;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to create plan";
    console.error("❌ createMonthlyPlan error:", errorMsg, error.response?.data);
    throw new Error(errorMsg);
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
    const errorMsg = error.response?.data?.message || error.message || "Failed to fetch plan";
    console.error("❌ getUserPlan error:", errorMsg, error.response?.data);
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
