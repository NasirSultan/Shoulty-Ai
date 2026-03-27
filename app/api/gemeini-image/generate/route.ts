import { NextRequest, NextResponse } from "next/server";

const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
const UPSTREAM_CANDIDATES = [
  "https://ai-shoutly-backend.onrender.com/api/gemeini-image/generate",
  "https://ai-shoutly-backend.onrender.com/api/gemini-image/generate",
  "https://backend.shoutlyai.com/api/gemeini-image/generate",
  "https://backend.shoutlyai.com/api/gemini-image/generate",
  "https://ai-shoutly-backend.onrender.com/api/display-images",
  "https://backend.shoutlyai.com/api/display-images",
];

let lastUpstreamImageUrl = "";

const isPlaceholderOpenAiKey = (value: string) =>
  !value ||
  value.includes("your-openai-api-key") ||
  value.includes("your-openai-api-key-here") ||
  value.includes("your-ope") ||
  value.startsWith("sk-your");

const extractImageUrl = (data: any): string => {
  const first = Array.isArray(data?.images) ? data.images[0] : null;
  return (
    (typeof first?.file === "string" && first.file) ||
    (typeof first?.url === "string" && first.url) ||
    (typeof data?.url === "string" && data.url) ||
    (typeof data?.imageUrl === "string" && data.imageUrl) ||
    (typeof data?.file === "string" && data.file) ||
    (typeof data?.image?.url === "string" && data.image.url) ||
    (typeof data?.image?.imageUrl === "string" && data.image.imageUrl) ||
    ""
  );
};

const pickFromDisplayImages = (data: any): string => {
  const list = Array.isArray(data?.images) ? data.images : [];
  const urls = list
    .map(
      (item: any) =>
        (typeof item?.file === "string" && item.file.trim()) ||
        (typeof item?.url === "string" && item.url.trim()) ||
        "",
    )
    .filter(Boolean);

  if (!urls.length) return "";

  const pool =
    urls.length > 1 && lastUpstreamImageUrl
      ? urls.filter((url: string) => url !== lastUpstreamImageUrl)
      : urls;
  const pickPool = pool.length ? pool : urls;
  const choice = pickPool[Math.floor(Math.random() * pickPool.length)] || "";
  if (choice) lastUpstreamImageUrl = choice;
  return choice;
};

export async function POST(request: NextRequest) {
  try {
    const openAiKey = process.env.OPENAI_API_KEY?.trim() || "";
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

    if (!prompt) {
      return NextResponse.json({ message: "Prompt is required." }, { status: 400 });
    }

    if (!isPlaceholderOpenAiKey(openAiKey)) {
      try {
        const upstreamResponse = await fetch(OPENAI_IMAGE_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt,
            n: 1,
            size: "1024x1024",
          }),
          cache: "no-store",
        });

        const upstreamText = await upstreamResponse.text();
        let upstreamData: any = null;
        try {
          upstreamData = upstreamText ? JSON.parse(upstreamText) : null;
        } catch {
          upstreamData = null;
        }

        if (upstreamResponse.ok) {
          const firstImage = Array.isArray(upstreamData?.data)
            ? upstreamData.data[0]
            : null;

          const imageUrl =
            (typeof firstImage?.url === "string" && firstImage.url.trim()) ||
            (typeof firstImage?.b64_json === "string" && firstImage.b64_json.trim()
              ? `data:image/png;base64,${firstImage.b64_json.trim()}`
              : "");

          if (imageUrl) {
            return NextResponse.json(
              {
                imageUrl,
                source: "openai-generate",
              },
              { status: 200 },
            );
          }
        }
      } catch {
        // Fall through to backend/display-image candidates.
      }
    }

    const errors: string[] = [];

    for (const upstreamUrl of UPSTREAM_CANDIDATES) {
      const isDisplayImages = upstreamUrl.endsWith("/api/display-images");
      let upstream: Response;
      try {
        upstream = await fetch(upstreamUrl, {
          method: isDisplayImages ? "GET" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: isDisplayImages
            ? undefined
            : JSON.stringify({ prompt, count: 1, aspectRatio: "1:1" }),
          cache: "no-store",
        });
      } catch {
        errors.push(`${upstreamUrl}: network-error`);
        continue;
      }

      const text = await upstream.text().catch(() => "");
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!upstream.ok) {
        errors.push(`${upstreamUrl}: ${upstream.status}`);
        continue;
      }

      const imageUrl = isDisplayImages
        ? pickFromDisplayImages(data)
        : extractImageUrl(data);

      if (!imageUrl) {
        errors.push(`${upstreamUrl}: empty-image-url`);
        continue;
      }

      return NextResponse.json(
        {
          imageUrl,
          source: isDisplayImages ? "upstream-display-images" : "upstream-generate",
          upstream: upstreamUrl,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "No working upstream image endpoint is available.",
        errors,
      },
      { status: 502 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while generating image.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
