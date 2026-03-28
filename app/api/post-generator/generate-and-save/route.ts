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

    // Wrap the upstream body in a transform stream with immediate heartbeat to prevent gateway timeout
    const encoder = new TextEncoder();
    let lastDataTime = Date.now();
    const HEARTBEAT_INTERVAL = 25000; // 25 seconds
    const heartbeatInterval = setInterval(() => {
        controller?.enqueue(encoder.encode(": heartbeat\n\n"));
        lastDataTime = Date.now();
    }, HEARTBEAT_INTERVAL);

    let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

    const wrappedStream = new ReadableStream({
        async start(ctrl) {
            controller = ctrl;
            // Send immediate connection confirmation to prevent gateway timeout
            ctrl.enqueue(encoder.encode(": connected\n\n"));
            lastDataTime = Date.now();
        },
        async pull(ctrl) {
            if (!upstream.body) return;
            const reader = upstream.body.getReader();
            try {
                const { done, value } = await reader.read();
                if (done) {
                    clearInterval(heartbeatInterval);
                    ctrl.close();
                } else {
                    lastDataTime = Date.now();
                    ctrl.enqueue(value);
                }
            } catch (err) {
                clearInterval(heartbeatInterval);
                ctrl.error(err);
            } finally {
                reader.releaseLock();
            }
        },
    });

    // Ensure heartbeat stops if stream ends prematurely
    wrappedStream.pipeTo(new WritableStream({
        close() {
            clearInterval(heartbeatInterval);
        },
        abort() {
            clearInterval(heartbeatInterval);
        },
    })).catch(() => clearInterval(heartbeatInterval));

    return new Response(wrappedStream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}