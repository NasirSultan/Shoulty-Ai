export const runtime = "nodejs";

const UPSTREAM_URL = "https://ai-shoutly-backend.onrender.com/api/generator/posts";

const encoder = new TextEncoder();

const sseHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
};

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

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode(": connected\n\n"));

            void (async () => {
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
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: { message } })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
                        ),
                    );
                    controller.close();
                    return;
                }

                if (!upstream.ok || !upstream.body) {
                    const text = upstream.ok
                        ? "Streaming response body is missing."
                        : await upstream.text().catch(() => "");

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: { message: text || `Upstream error ${upstream.status}` } })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
                        ),
                    );
                    controller.close();
                    return;
                }

                const reader = upstream.body.getReader();

                try {
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        if (value) controller.enqueue(value);
                    }
                } finally {
                    reader.releaseLock();
                    controller.close();
                }
            })();
        },
        cancel() {
            return;
        },
    });

    return new Response(stream, {
        status: 200,
        headers: sseHeaders,
    });
}