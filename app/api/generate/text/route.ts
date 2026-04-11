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

const UPSTREAM_URLS = [
    "https://ai-shoutly-backend.onrender.com/api/generator/texts",
    "https://backend.shoutlyai.com/api/generator/texts",
];

const tryUpstreamRequest = async (url: string, body: unknown) => {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });
};

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

    let upstream: Response | null = null;
    const failures: Array<{ url: string; status?: number; message: string }> = [];

    for (const url of UPSTREAM_URLS) {
        for (let attempt = 1; attempt <= 2; attempt += 1) {
            try {
                console.log(`📝 [generate/text] Forwarding to upstream (${attempt}/2):`, url);
                const candidate = await tryUpstreamRequest(url, body);
                if (candidate.ok) {
                    upstream = candidate;
                    break;
                }

                const text = await candidate.text().catch(() => "");
                failures.push({
                    url,
                    status: candidate.status,
                    message: text || `Upstream error ${candidate.status}`,
                });

                if (candidate.status < 500 || attempt === 2) {
                    break;
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to reach upstream.";
                failures.push({ url, message });
                if (attempt === 2) {
                    break;
                }
            }
        }

        if (upstream) break;
    }

    if (!upstream) {
        const last = failures[failures.length - 1];
        console.error("❌ [generate/text] Upstream retries exhausted:", failures);
        return new Response(
            JSON.stringify({
                message: last?.message || "Text generator is temporarily unavailable.",
                attempts: failures.map((f) => ({ url: f.url, status: f.status || null })),
            }),
            {
                status: 502,
                headers: { "Content-Type": "application/json" },
            }
        );
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
