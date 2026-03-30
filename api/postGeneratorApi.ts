import { API_ENDPOINTS } from "./configApi";

export interface GeneratedPost {
  image?: {
    imageUrl?: string;
    deleteUrl?: string;
  };
  text?: string;
  hashtags?: string[];
  source?: "DB" | "LLM";
  index?: number;
}

export interface GeneratedPostChunk {
  index: number;
  post: GeneratedPost;
}

export interface GeneratedSavedPostChunk extends GeneratedPostChunk {
  saved?: {
    image?: unknown;
    calendarPost?: unknown;
    content?: unknown;
  };
}

export interface GeneratePostsRequest {
  industryId: string;
  subIndustryId: string;
  prompt: string;
}

export interface PromptOnlyImagesRequest {
  prompt: string;
  count?: number;
  aspectRatio?: "1:1" | "16:9" | "9:16";
}

export interface PromptOnlyImage {
  id: string;
  url: string;
  title: string;
}

export interface GenerateAndSavePostsRequest extends GeneratePostsRequest {
  userId: string;
  postTime: string;
}

interface StreamCallbacks<TChunk> {
  onChunk: (chunk: TChunk) => void;
  onDone?: () => void;
  signal?: AbortSignal;
}

const parseErrorMessage = (text: string, status: number): string => {
  if (!text) {
    return status >= 500
      ? "Post generator is temporarily unavailable. Please try again in a moment."
      : `Post generator request failed (${status}).`;
  }

  try {
    const parsed = JSON.parse(text) as {
      message?: string;
      error?: { message?: string } | string;
    };

    const nestedError =
      typeof parsed?.error === "string"
        ? parsed.error
        : parsed?.error?.message;
    const message = parsed?.message || nestedError;
    if (message && typeof message === "string") return message;
  } catch {
    // Ignore JSON parse failure and use raw text fallback.
  }

  if (/upstream error\s*503/i.test(text) || status >= 500) {
    return "Post generator is temporarily unavailable. Please try again in a moment.";
  }

  return text;
};

const parseSseEventData = (rawEvent: string): string | null => {
  const dataLines = rawEvent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim());

  if (!dataLines.length) return null;
  return dataLines.join("\n");
};

const streamPostGenerator = async <TChunk>(
  endpoint: string,
  body: object,
  callbacks: StreamCallbacks<TChunk>,
  fallbackEndpoint?: string
) => {
  const doRequest = (url: string) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
      signal: callbacks.signal,
    });

  let response = await doRequest(endpoint);

  if (!response.ok) {
    if (response.status === 503 && fallbackEndpoint) {
      // Lambda proxy got a 503 from Render — try the direct upstream URL instead.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      response = await doRequest(fallbackEndpoint);
      if (!response.ok && (response.status === 503 || response.status === 504)) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        response = await doRequest(fallbackEndpoint);
      }
    } else if (response.status === 503) {
      // No fallback available — simple single retry via the same proxy.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      response = await doRequest(endpoint);
    } else if (response.status === 504 && fallbackEndpoint) {
      // Lambda timed out (Render cold start). Retry directly from the browser.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      response = await doRequest(fallbackEndpoint);
      if (!response.ok && (response.status === 503 || response.status === 504)) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        response = await doRequest(fallbackEndpoint);
      }
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(parseErrorMessage(errText, response.status));
    }
  }

  if (!response.body) {
    throw new Error("Streaming response body is missing.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let doneCalled = false;

  const processRawEvent = (rawEvent: string) => {
    const dataString = parseSseEventData(rawEvent);
    if (!dataString) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(dataString);
    } catch {
      return;
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "done" in parsed &&
      (parsed as { done?: boolean }).done
    ) {
      if (!doneCalled) {
        doneCalled = true;
        callbacks.onDone?.();
      }
      return;
    }

    callbacks.onChunk(parsed as TChunk);
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundaryIdx = buffer.indexOf("\n\n");
    while (boundaryIdx !== -1) {
      const rawEvent = buffer.slice(0, boundaryIdx).trim();
      buffer = buffer.slice(boundaryIdx + 2);
      if (rawEvent) processRawEvent(rawEvent);
      boundaryIdx = buffer.indexOf("\n\n");
    }
  }

  const tail = buffer.trim();
  if (tail) processRawEvent(tail);

  if (!doneCalled) {
    callbacks.onDone?.();
  }
};

export const streamGeneratePosts = async (
  request: GeneratePostsRequest,
  callbacks: StreamCallbacks<GeneratedPostChunk>
) => {
  await streamPostGenerator<GeneratedPostChunk>(
    API_ENDPOINTS.postGeneratorGenerate,
    request,
    callbacks,
    API_ENDPOINTS.postGeneratorGenerateDirect
  );
};

export const streamGenerateAndSavePosts = async (
  request: GenerateAndSavePostsRequest,
  callbacks: StreamCallbacks<GeneratedSavedPostChunk>
) => {
  await streamPostGenerator<GeneratedSavedPostChunk>(
    API_ENDPOINTS.postGeneratorGenerateAndSave,
    request,
    callbacks,
    API_ENDPOINTS.postGeneratorGenerateAndSaveDirect
  );
};

export const generatePromptOnlyImages = async (
  request: PromptOnlyImagesRequest
): Promise<PromptOnlyImage[]> => {
  const response = await fetch("/api/prompt-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    console.warn(
      message || `Prompt image generation failed (${response.status}); falling back to stock images.`
    );
    return [];
  }

  const data = await response.json();
  return Array.isArray(data?.images) ? data.images : [];
};

const getStringByKeys = (
  data: Record<string, unknown> | null | undefined,
  keys: string[]
): string | null => {
  if (!data) return null;

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return null;
};

export const resolveGeneratorProfileFields = (
  user: Record<string, unknown> | null | undefined
) => ({
  userId: getStringByKeys(user, ["userId", "id", "_id"]),
  industryId: getStringByKeys(user, [
    "industryId",
    "industry_id",
    "selectedIndustryId",
  ]),
  subIndustryId: getStringByKeys(user, [
    "subIndustryId",
    "sub_industry_id",
    "selectedSubIndustryId",
  ]),
});
