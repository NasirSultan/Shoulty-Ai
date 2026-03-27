import { NextRequest, NextResponse } from "next/server";

const aspectRatioToSize: Record<string, string> = {
    "1:1": "1024x1024",
    "16:9": "1536x1024",
    "9:16": "1024x1536",
};

const BACKEND_FALLBACK_IMAGES_URL =
    "https://ai-shoutly-backend.onrender.com/api/display-images";
const BACKEND_GENERATE_URLS = [
    "https://ai-shoutly-backend.onrender.com/api/gemeini-image/generate",
    "https://ai-shoutly-backend.onrender.com/api/gemini-image/generate",
    "https://backend.shoutlyai.com/api/gemeini-image/generate",
    "https://backend.shoutlyai.com/api/gemini-image/generate",
];

let lastFallbackImageUrl = "";

const toFallbackImages = (raw: unknown, count: number) => {
    const list =
        raw &&
        typeof raw === "object" &&
        Array.isArray((raw as { images?: unknown[] }).images)
            ? ((raw as { images: unknown[] }).images as unknown[])
            : [];

    const normalized = list
        .map((entry, index) => {
            if (!entry || typeof entry !== "object") return null;

            const imageObj = entry as {
                id?: string | number;
                file?: string;
                url?: string;
            };

            const url =
                (typeof imageObj.file === "string" && imageObj.file.trim()) ||
                (typeof imageObj.url === "string" && imageObj.url.trim()) ||
                "";

            if (!url) return null;

            const id =
                typeof imageObj.id === "string" || typeof imageObj.id === "number"
                    ? String(imageObj.id)
                    : `fallback-${index + 1}`;

            return {
                id,
                url,
                title: `Fallback image ${index + 1}`,
            };
        })
        .filter(Boolean) as Array<{ id: string; url: string; title: string }>;

    if (!normalized.length) return [];

    // Shuffle on every request so fallback picks vary.
    const shuffled = [...normalized];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Avoid repeating the same first image when possible.
    if (
        shuffled.length > 1 &&
        lastFallbackImageUrl &&
        shuffled[0]?.url === lastFallbackImageUrl
    ) {
        const nextDifferentIndex = shuffled.findIndex(
            (item) => item.url !== lastFallbackImageUrl,
        );

        if (nextDifferentIndex > 0) {
            [shuffled[0], shuffled[nextDifferentIndex]] = [
                shuffled[nextDifferentIndex],
                shuffled[0],
            ];
        }
    }

    const selected = shuffled.slice(0, Math.max(1, count));
    if (selected[0]?.url) {
        lastFallbackImageUrl = selected[0].url;
    }

    return selected;
};

const fetchFallbackImages = async (count: number) => {
    const response = await fetch(BACKEND_FALLBACK_IMAGES_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
    });

    if (!response.ok) return [];

    const text = await response.text();
    let parsed: unknown = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        parsed = null;
    }

    return toFallbackImages(parsed, count);
};

const extractGeneratedImageUrl = (raw: unknown): string | null => {
    if (!raw || typeof raw !== "object") return null;

    const payload = raw as {
        imageUrl?: string;
        url?: string;
        image?: { imageUrl?: string; url?: string };
        data?: { imageUrl?: string; url?: string };
        images?: Array<{ url?: string; file?: string }>;
    };

    const firstArrayImage = Array.isArray(payload.images)
        ? payload.images[0]
        : undefined;

    const candidate =
        payload.imageUrl ||
        payload.url ||
        payload.image?.imageUrl ||
        payload.image?.url ||
        payload.data?.imageUrl ||
        payload.data?.url ||
        firstArrayImage?.url ||
        firstArrayImage?.file ||
        "";

    return typeof candidate === "string" && candidate.trim()
        ? candidate.trim()
        : null;
};

const fetchBackendGeneratedImages = async (
    prompt: string,
    count: number,
    aspectRatio: string,
) => {
    for (const url of BACKEND_GENERATE_URLS) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ prompt, count, aspectRatio }),
                cache: "no-store",
            });

            if (!response.ok) continue;

            const text = await response.text();
            let parsed: unknown = null;
            try {
                parsed = text ? JSON.parse(text) : null;
            } catch {
                parsed = null;
            }

            const imageUrl = extractGeneratedImageUrl(parsed);
            if (!imageUrl) continue;

            return [
                {
                    id: `backend-gen-${Date.now()}`,
                    url: imageUrl,
                    title: "Generated image",
                },
            ];
        } catch {
            // Try next candidate endpoint.
        }
    }

    return [];
};

export async function POST(request: NextRequest) {
    try {
        const openAiKey = process.env.OPENAI_API_KEY;
        const trimmedKey = openAiKey?.trim() || "";
        const isPlaceholderKey =
            !trimmedKey ||
            trimmedKey.includes("your-openai-api-key") ||
            trimmedKey.includes("your-openai-api-key-here") ||
            trimmedKey.includes("your-ope") ||
            trimmedKey.startsWith("sk-your");

        const rawBody = await request.text();
        let body: any = null;
        try {
            body = rawBody ? JSON.parse(rawBody) : null;
        } catch {
            return NextResponse.json(
                { message: "Invalid JSON body." },
                { status: 400 },
            );
        }

        const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
        const count =
            typeof body?.count === "number" && body.count > 0 && body.count <= 4
                ? body.count
                : 4;
        const aspectRatio =
            typeof body?.aspectRatio === "string" ? body.aspectRatio : "1:1";
        const size = aspectRatioToSize[aspectRatio] || aspectRatioToSize["1:1"];

        if (!prompt) {
            return NextResponse.json(
                { message: "Prompt is required." },
                { status: 400 },
            );
        }

        if (isPlaceholderKey) {
            const backendGeneratedImages = await fetchBackendGeneratedImages(
                prompt,
                count,
                aspectRatio,
            );
            if (backendGeneratedImages.length) {
                return NextResponse.json(
                    {
                        images: backendGeneratedImages,
                        source: "backend-generate",
                    },
                    { status: 200 },
                );
            }

            const fallbackImages = await fetchFallbackImages(count);
            if (fallbackImages.length) {
                return NextResponse.json(
                    {
                        images: fallbackImages,
                        source: "backend-fallback",
                        message:
                            "Using backend fallback images because OPENAI_API_KEY is not configured.",
                    },
                    { status: 200 },
                );
            }

            return NextResponse.json(
                {
                    message:
                        "Prompt-only image generation is not configured. Set a valid OPENAI_API_KEY on the server.",
                },
                { status: 503 },
            );
        }

        const upstreamResponse = await fetch(
            "https://api.openai.com/v1/images/generations",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${trimmedKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-image-1",
                    prompt,
                    n: count,
                    size,
                }),
            },
        );

        const upstreamText = await upstreamResponse.text();
        let upstreamData: any = null;

        try {
            upstreamData = upstreamText ? JSON.parse(upstreamText) : null;
        } catch {
            upstreamData = null;
        }

        if (!upstreamResponse.ok) {
            const backendGeneratedImages = await fetchBackendGeneratedImages(
                prompt,
                count,
                aspectRatio,
            );
            if (backendGeneratedImages.length) {
                return NextResponse.json(
                    {
                        images: backendGeneratedImages,
                        source: "backend-generate",
                        message:
                            "OpenAI image generation failed; using backend generator endpoint.",
                    },
                    { status: 200 },
                );
            }

            const fallbackImages = await fetchFallbackImages(count);
            if (fallbackImages.length) {
                return NextResponse.json(
                    {
                        images: fallbackImages,
                        source: "backend-fallback",
                        message:
                            "OpenAI image generation failed; using backend fallback images.",
                    },
                    { status: 200 },
                );
            }

            return NextResponse.json(
                {
                    message:
                        upstreamData?.error?.message ||
                        upstreamText ||
                        "Prompt-only image generation failed.",
                },
                { status: upstreamResponse.status },
            );
        }

        const images = Array.isArray(upstreamData?.data)
            ? upstreamData.data
                  .map((image: any, index: number) => {
                      const directUrl =
                          typeof image?.url === "string" && image.url.trim()
                              ? image.url.trim()
                              : null;
                      const base64Data =
                          typeof image?.b64_json === "string" && image.b64_json.trim()
                              ? `data:image/png;base64,${image.b64_json.trim()}`
                              : null;
                      const url = directUrl || base64Data;
                      if (!url) return null;

                      return {
                          id: `prompt-only-${index + 1}`,
                          url,
                          title: `Prompt image ${index + 1}`,
                      };
                  })
                  .filter(Boolean)
            : [];

        return NextResponse.json({ images }, { status: 200 });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unexpected error while generating prompt-only images.";

        return NextResponse.json({ message }, { status: 500 });
    }
}
