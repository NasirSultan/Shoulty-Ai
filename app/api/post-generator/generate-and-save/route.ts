export const runtime = "nodejs";

const UPSTREAM_URL = "https://ai-shoutly-backend.onrender.com/api/generator/posts";

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

    let upstream: Response;
    try {
        upstream = await fetch(UPSTREAM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
            },
            body: rawBody,
            cache: "no-store",
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reach upstream.";
        return new Response(JSON.stringify({ message }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        return new Response(text || `Upstream error ${upstream.status}`, {
            status: upstream.status,
            headers: { "Content-Type": "text/plain" },
        });
    }

    const originalBody = upstream.body;
    if (!originalBody) {
        return new Response(JSON.stringify({ message: "Upstream returned an empty stream." }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const reader = originalBody.getReader();

    // Write an immediate SSE comment so Amplify does not time out before upstream sends data.
    await writer.write(encoder.encode(": connected\n\n"));

    const heartbeat = setInterval(() => {
        void writer.write(encoder.encode(": heartbeat\n\n")).catch(() => {
            // Stream closed, interval cleanup happens in finally.
        });
    }, 25000);

    void (async () => {
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                    await writer.write(value);
                }
            }
        } catch {
            // Ignore upstream read errors and close stream gracefully.
        } finally {
            clearInterval(heartbeat);
            reader.releaseLock();
            try {
                await writer.close();
            } catch {
                // Ignore close errors when stream already aborted.
            }
        }
    })();

    return new Response(readable, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}