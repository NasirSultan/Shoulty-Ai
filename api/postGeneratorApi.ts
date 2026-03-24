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

export interface GenerateAndSavePostsRequest extends GeneratePostsRequest {
  userId: string;
  postTime: string;
}

interface StreamCallbacks<TChunk> {
  onChunk: (chunk: TChunk) => void;
  onDone?: () => void;
  signal?: AbortSignal;
}

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
  callbacks: StreamCallbacks<TChunk>
) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal: callbacks.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(errText || `Post generator request failed (${response.status})`);
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
    callbacks
  );
};

export const streamGenerateAndSavePosts = async (
  request: GenerateAndSavePostsRequest,
  callbacks: StreamCallbacks<GeneratedSavedPostChunk>
) => {
  await streamPostGenerator<GeneratedSavedPostChunk>(
    API_ENDPOINTS.postGeneratorGenerateAndSave,
    request,
    callbacks
  );
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
