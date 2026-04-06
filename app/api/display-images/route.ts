export const runtime = "nodejs";

const UPSTREAM_BASE = "https://ai-shoutly-backend.onrender.com/api/display-images";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subIndustryId = searchParams.get("subIndustryId");
    const allowRandomPreview = searchParams.get("allowRandomPreview") === "1";

    // ── Case #1: Require Sub-Industry ID ──────────────────────────────────────
    // CRITICAL: If no subIndustryId is provided, reject the request unless the
    // caller explicitly opts into random preview mode for homepage/library UI.
    if (!subIndustryId || subIndustryId.trim() === "") {
        if (allowRandomPreview) {
            console.log("📸 [display-images] Random preview mode enabled.");

            let upstreamRandom: Response;
            try {
                upstreamRandom = await fetch(UPSTREAM_BASE, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                });
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to reach upstream.";
                console.error("❌ [display-images] Random preview upstream fetch failed:", message);
                return Response.json({ error: message, message }, { status: 502 });
            }

            if (!upstreamRandom.ok) {
                const text = await upstreamRandom.text().catch(() => "");
                const errorMsg = text || `Upstream error ${upstreamRandom.status}`;
                console.error(`❌ [display-images] Random preview upstream returned ${upstreamRandom.status}:`, errorMsg);
                return new Response(JSON.stringify({ error: errorMsg, status: upstreamRandom.status }), {
                    status: upstreamRandom.status,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const data = await upstreamRandom.json();
            return Response.json(data);
        }

        console.warn("❌ [display-images] subIndustryId is required but was not provided.");
        return Response.json(
            { error: "Bad request", message: "subIndustryId is required" },
            { status: 400 }
        );
    }

    const upstreamUrl = `${UPSTREAM_BASE}?subIndustryId=${encodeURIComponent(subIndustryId)}`;

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
