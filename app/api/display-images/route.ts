export const runtime = "nodejs";

const UPSTREAM_BASE = "https://ai-shoutly-backend.onrender.com/api/display-images";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subIndustryId = searchParams.get("subIndustryId");

    const upstreamUrl = subIndustryId
        ? `${UPSTREAM_BASE}?subIndustryId=${encodeURIComponent(subIndustryId)}`
        : UPSTREAM_BASE;

    console.log("📸 [display-images] Calling upstream:", upstreamUrl);

    let upstream: Response;
    try {
        upstream = await fetch(upstreamUrl, {
            method: "GET",
            headers: { 
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reach upstream.";
        console.error("❌ [display-images] Upstream fetch failed:", message);
        return Response.json({ error: message, message }, { status: 502 });
    }

    if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        const errorMsg = text || `Upstream error ${upstream.status}`;
        console.error(`❌ [display-images] Upstream returned ${upstream.status}:`, errorMsg);
        return new Response(JSON.stringify({ error: errorMsg, status: upstream.status }), {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
        });
    }

    const data = await upstream.json();
    console.log("✅ [display-images] Success, returning data");
    return Response.json(data);
}
