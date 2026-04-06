/**
 * Alias endpoint for text generation with prompt validation.
 * POST /api/generate/text
 * 
 * This endpoint forwards requests to /api/generator/texts with the same validation logic.
 * Used by frontend components that expect the /api/generate/text path.
 * 
 * Request: { "prompt": "user input text here" }
 * Response: Server-sent events (SSE) stream
 * Error codes: 400 (missing/empty prompt), 502 (upstream failure)
 */

export const runtime = "nodejs";

const UPSTREAM_URL = "https://ai-shoutly-backend.onrender.com/api/generator/texts";

export async function POST(request: Request) {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ message: "Invalid request body." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // ── Case #4: Generate Text API Validation ───────────────────────────────────
    // CRITICAL: Validate that 'prompt' field is present in request body.
    // API execution requires a prompt to generate text.
    if (!body || typeof body.prompt !== "string" || body.prompt.trim() === "") {
        return new Response(
            JSON.stringify({
                message: "Invalid request: 'prompt' field is required and must be a non-empty string.",
                error: "MISSING_PROMPT",
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    console.log("📝 [generate/text] Processing request with prompt:", body.prompt.substring(0, 50) + "...");

    let upstream: Response;
    try {
        console.log("📝 [generate/text] Forwarding to upstream:", UPSTREAM_URL);
        upstream = await fetch(UPSTREAM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to reach upstream.";
        console.error("❌ [generate/text] Upstream fetch failed:", message);
        return new Response(JSON.stringify({ message }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }

    if (!upstream.ok) {
        const text = await upstream.text().catch(() => "");
        console.error(`❌ [generate/text] Upstream returned ${upstream.status}:`, text);
        return new Response(text || `Upstream error ${upstream.status}`, {
            status: upstream.status,
            headers: { "Content-Type": "text/plain" },
        });
    }

    console.log("✅ [generate/text] Streaming response from upstream");
    return new Response(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}
