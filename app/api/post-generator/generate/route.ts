export const runtime = "edge";

export async function POST(request: Request) {
    let rawBody = "";
    try {
        rawBody = await request.text();
    } catch {
        return new Response(JSON.stringify({ message: "Invalid request body." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const url = new URL(request.url);
    const proxyUrl = `${url.origin}/api/proxy/stream-posts`;

    let upstream: Response;
    try {
        upstream = await fetch(proxyUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
            },
            body: rawBody,
            cache: "no-store",
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reach proxy.";
        return new Response(JSON.stringify({ message }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        return new Response(text || `Proxy error ${upstream.status}`, {
            status: upstream.status,
            headers: { "Content-Type": "text/plain" },
        });
    }

    return new Response(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}
