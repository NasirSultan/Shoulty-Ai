export const runtime = "nodejs";

const UPSTREAM_BASE = "https://ai-shoutly-backend.onrender.com/api/display-images";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subIndustryId = searchParams.get("subIndustryId");

    const upstreamUrl = subIndustryId
        ? `${UPSTREAM_BASE}?subIndustryId=${encodeURIComponent(subIndustryId)}`
        : UPSTREAM_BASE;

    let upstream: Response;
    try {
        upstream = await fetch(upstreamUrl, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reach upstream.";
        return Response.json({ message }, { status: 502 });
    }

    if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        return new Response(text || `Upstream error ${upstream.status}`, {
            status: upstream.status,
            headers: { "Content-Type": "text/plain" },
        });
    }

    const data = await upstream.json();
    return Response.json(data);
}
