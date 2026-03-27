export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM_URL = "https://ai-shoutly-backend.onrender.com/api/generator/posts";

const encoder = new TextEncoder();

const sseHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
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

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    const writeChunk = async (chunk: string | Uint8Array) => {
        await writer.write(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
    };

    const heartbeat = setInterval(() => {
        void writeChunk(": ping\n\n").catch(() => undefined);
    }, 15000);

    void (async () => {
        try {
            await writeChunk(": connected\n\n");

            const upstream = await fetch(UPSTREAM_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                },
                body: rawBody,
                cache: "no-store",
            });

            if (!upstream.ok || !upstream.body) {
                const text = upstream.ok
                    ? "Streaming response body is missing."
                    : await upstream.text().catch(() => "");

                await writeChunk(
                    `data: ${JSON.stringify({ error: { message: text || `Upstream error ${upstream.status}` } })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
                );
                return;
            }

            const reader = upstream.body.getReader();
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    if (value) await writeChunk(value);
                }
            } finally {
                reader.releaseLock();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to reach upstream.";
            await writeChunk(
                `data: ${JSON.stringify({ error: { message } })}\n\ndata: ${JSON.stringify({ done: true })}\n\n`,
            ).catch(() => undefined);
        } finally {
            clearInterval(heartbeat);
            await writer.close().catch(() => undefined);
        }
    })();

    return new Response(readable, {
        status: 200,
        headers: sseHeaders,
    });
}