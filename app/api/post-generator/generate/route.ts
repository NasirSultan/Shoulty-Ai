export const runtime = "edge";

const UPSTREAM_URL = "https://ai-shoutly-backend.onrender.com/api/generator/posts";
const UPSTREAM_FALLBACK = "https://backend.shoutlyai.com/api/generator/posts";

export async function POST(request: Request) {
    const rawBody = await request.text();

    const forward = async (url: string) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            },
            body: rawBody,
        });
    };

    let upstream: Response | null = null;
    let lastError: string = "";

    // 4 attempts: 3 to Render, 1 to Fallback
    for (let i = 0; i < 4; i++) {
        const url = i === 3 ? UPSTREAM_FALLBACK : UPSTREAM_URL;
        try {
            console.log(`[Proxy] Attempt ${i + 1}/4 to ${url}`);
            upstream = await forward(url);
            
            if (upstream.ok) {
                console.log(`[Proxy] Success from ${url} (Status: ${upstream.status})`);
                break;
            }
            
            lastError = `Status ${upstream.status}`;
            if (upstream.status < 500) break; // Client error, don't retry
        } catch (err) {
            lastError = err instanceof Error ? err.message : "Fetch failed";
            console.warn(`[Proxy] Attempt ${i + 1} failed: ${lastError}`);
        }
        
        if (i < 3) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }

    if (!upstream || !upstream.ok) {
        return new Response(lastError || "Failed to reach generator backend", {
            status: upstream?.status || 502,
        });
    }

    // Manual stream pipe to ensure compatibility and stability
    const { readable, writable } = new TransformStream();
    upstream.body?.pipeTo(writable).catch(err => {
        console.error("[Proxy] Stream pipe error:", err);
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
