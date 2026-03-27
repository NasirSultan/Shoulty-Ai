import { API_ENDPOINTS } from "./configApi";

export interface GeneratedTextChunk {
  index: number;
  text: string;
}

interface StreamCallbacks<TChunk> {
  onChunk: (chunk: TChunk) => void;
  onDone?: () => void;
  signal?: AbortSignal;
}

export interface GenerateTextsRequest {
  prompt: string;
}

const parseErrorMessage = (text: string, status: number): string => {
  if (!text) {
    return status >= 500
      ? "Text generator is temporarily unavailable. Please try again in a moment."
      : `Text generator request failed (${status}).`;
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

const streamTextGenerator = async (
  request: GenerateTextsRequest,
  callbacks: StreamCallbacks<GeneratedTextChunk>
) => {
  const response = await fetch(API_ENDPOINTS.textGeneratorGenerate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(request),
    signal: callbacks.signal,
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(parseErrorMessage(errText, response.status));
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

    callbacks.onChunk(parsed as GeneratedTextChunk);
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

export const streamGenerateTexts = async (
  request: GenerateTextsRequest,
  callbacks: StreamCallbacks<GeneratedTextChunk>
) => {
  await streamTextGenerator(request, callbacks);
};
