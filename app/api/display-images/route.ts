export const runtime = "nodejs";

const UPSTREAM_BASE = "https://backend.shoutlyai.com/api/display-images";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subIndustryId = searchParams.get("subIndustryId");
    const allowRandomPreview = searchParams.get("allowRandomPreview") === "1";

    // ── Case #1: Require Sub-Industry ID ──────────────────────────────────────
    // CRITICAL: If no subIndustryId is provided, reject the request unless the
    // caller explicitly opts into random preview mode for homepage/library UI.
    if (!subIndustryId || subIndustryId.trim() === "") {
        if (allowRandomPreview) {
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
                return Response.json({ error: message, message }, { status: 502 });
            }

            if (!upstreamRandom.ok) {
                const text = await upstreamRandom.text().catch(() => "");
                const errorMsg = text || `Upstream error ${upstreamRandom.status}`;
                return new Response(JSON.stringify({ error: errorMsg, status: upstreamRandom.status }), {
                    status: upstreamRandom.status,
                    headers: { "Content-Type": "application/json" },
                });
            }

            const data = await upstreamRandom.json();
            return Response.json(data);
        }

        return Response.json(
            { error: "Bad request", message: "subIndustryId is required" },
            { status: 400 }
        );
    }

    const upstreamUrl = `${UPSTREAM_BASE}?subIndustryId=${encodeURIComponent(subIndustryId)}`;

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
        return Response.json({ error: message, message }, { status: 502 });
    }

    if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        const errorMsg = text || `Upstream error ${upstream.status}`;
        return new Response(JSON.stringify({ error: errorMsg, status: upstream.status }), {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
        });
    }

    const data = await upstream.json();
    return Response.json(data);
}
