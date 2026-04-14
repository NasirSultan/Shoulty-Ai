import { API_BASE_URL } from "./configApi";

export interface FacebookPage {
  pageId: string;
  pageName?: string;
  isDefault?: boolean;
}

export interface FacebookPostPayload {
  message: string;
  title?: string;
  imageUrl?: string;
  hashtags?: string[];
}

interface FacebookPostResponse {
  success: boolean;
  data?: {
    postId: string;
    pageId: string;
  };
  message?: string;
}

function getAuthToken(explicitToken?: string): string {
  if (explicitToken) {
    return explicitToken;
  }

  if (typeof window === "undefined") {
    throw new Error("Authentication token is required.");
  }

  const token = localStorage.getItem("shoutly_token");
  if (!token) {
    throw new Error("Authentication token not found. Please sign in.");
  }

  return token;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybeMessage = (payload as { message?: unknown }).message;
  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }

  return fallback;
}

export async function getFacebookAuthUrl(token?: string): Promise<string> {
  const authToken = getAuthToken(token);

  const response = await fetch(`${API_BASE_URL}/api/facebook/auth`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const payload = (await parseJsonSafe(response)) as { url?: string; message?: string } | null;

  if (!response.ok || !payload?.url) {
    throw new Error(extractMessage(payload, "Failed to start Facebook OAuth."));
  }

  return payload.url;
}

export async function getFacebookPages(token?: string): Promise<FacebookPage[]> {
  const authToken = getAuthToken(token);

  const response = await fetch(`${API_BASE_URL}/api/facebook/pages`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(extractMessage(payload, "Failed to fetch Facebook pages."));
  }

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload as FacebookPage[];
}

export async function selectFacebookPage(pageId: string, token?: string): Promise<void> {
  const authToken = getAuthToken(token);

  const response = await fetch(`${API_BASE_URL}/api/facebook/select-page`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ pageId }),
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new Error(extractMessage(payload, "Failed to select Facebook page."));
  }
}

export async function createFacebookPost(payload: FacebookPostPayload, token?: string): Promise<FacebookPostResponse> {
  const authToken = getAuthToken(token);

  const response = await fetch(`${API_BASE_URL}/api/facebook/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const parsed = (await parseJsonSafe(response)) as FacebookPostResponse | null;

  if (!response.ok) {
    throw new Error(extractMessage(parsed, "Failed to publish Facebook post."));
  }

  return parsed ?? { success: false, message: "Invalid response from server." };
}

export async function createFacebookDirectPost(payload: FacebookPostPayload, token?: string): Promise<FacebookPostResponse> {
  const authToken = getAuthToken(token);

  const response = await fetch(`${API_BASE_URL}/api/facebook/direct-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });

  const parsed = (await parseJsonSafe(response)) as FacebookPostResponse | null;

  if (!response.ok) {
    throw new Error(extractMessage(parsed, "Failed to publish Facebook direct post."));
  }

  return parsed ?? { success: false, message: "Invalid response from server." };
}