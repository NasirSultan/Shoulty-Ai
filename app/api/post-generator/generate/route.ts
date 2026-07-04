export const runtime = "edge";

const UPSTREAM_URL = "https://backend.shoutlyai.com/api/generator/posts";
const UPSTREAM_FALLBACK = "https://backend.shoutlyai.com/api/generator/posts";

export async function POST(request: Request) {
    const rawBody = await request.text();
    const clientSignal = request.signal;

    const forward = async (url: string) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
                "ngrok-skip-browser-warning": "true",
            },
            body: rawBody,
            signal: clientSignal,
        });
    };

    let upstream: Response | null = null;
    let lastError: string = "";

    for (let i = 0; i < 4; i++) {
        const url = i === 3 ? UPSTREAM_FALLBACK : UPSTREAM_URL;
        try {
            upstream = await forward(url);
            if (upstream.ok) break;
            lastError = `Status ${upstream.status}`;
            if (upstream.status < 500) break;
        } catch (err: any) {
            if (err?.name === "AbortError" || clientSignal.aborted) return new Response(null, { status: 499 });
            lastError = err instanceof Error ? err.message : "Fetch failed";
        }
        if (i < 3) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }

    if (!upstream || !upstream.ok) {
        return new Response(lastError || "Failed to reach generator backend", {
            status: upstream?.status || 502,
        });
    }

    const { readable, writable } = new TransformStream();
    upstream.body?.pipeTo(writable).catch((err: any) => {
        const msg: string = err?.message ?? String(err);
        if (
            err?.name === "AbortError" ||
            msg.includes("ResponseAborted") ||
            msg.includes("aborted") ||
            msg.includes("ECONNRESET")
        ) return;
        console.error("[Proxy] Stream error:", msg);
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
