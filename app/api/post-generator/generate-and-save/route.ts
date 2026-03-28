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

    // Create a simple heartbeat wrapper using ReadableStream
    const originalBody = upstream.body;
    if (!originalBody) {
        return new Response("", { status: 500 });
    }

    const encoder = new TextEncoder();
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let hasStarted = false;

    const responseStream = new ReadableStream({
        start(controller) {
            // Send immediate heartbeat to prevent gateway timeout
            controller.enqueue(encoder.encode(": connected\n\n"));
            hasStarted = true;

            // Send heartbeat every 25 seconds to keep connection alive
            heartbeatInterval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch {
                    // Ignore if stream already closed
                }
            }, 25000);
        },
        async pull(controller) {
            try {
                const reader = originalBody.getReader();
                const { done, value } = await reader.read();

                if (done) {
                    if (heartbeatInterval) clearInterval(heartbeatInterval);
                    controller.close();
                } else {
                    controller.enqueue(value);
                }

                reader.releaseLock();
            } catch (error) {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                controller.error(error);
            }
        },
        cancel() {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        },
    });

    return new Response(responseStream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}