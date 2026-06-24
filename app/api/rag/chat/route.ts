import { NextRequest, NextResponse } from "next/server";

function getLocalFallbackAnswer(query: string) {
    const q = query.toLowerCase();

    if (/(price|pricing|plan|cost|subscription|monthly|yearly|annual)/.test(q)) {
        return [
            "ShoutlyAI pricing:",
            "- INR: ₹10,000/mo (monthly) or ₹8,000/mo billed annually at ₹96,000 (save 20%).",
            "- USD: $119/mo (monthly) or $95/mo billed annually at $1,143 (save 20%).",
            "- Annual savings: ₹24,000 or $286.",
            "If you want, I can also help you pick monthly vs yearly based on your usage.",
        ].join("\n");
    }

    if (/(feature|what does|what is|about|do)/.test(q)) {
        return "ShoutlyAI helps businesses generate and schedule social media content with AI across major platforms, with media support and analytics-friendly workflows.";
    }

    return `I received your message: "${query}". The RAG backend is not connected right now, but I can still help with basic ShoutlyAI info like pricing, features, and onboarding.`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, topK = 5 } = body;

        if (!query) {
            return NextResponse.json(
                { success: false, message: "Query is required" },
                { status: 400 }
            );
        }

        // TODO: Integrate with your actual RAG backend
        // For now, returning a demo response
        // Replace this with your actual RAG API call

        const ragBackendUrl = process.env.RAG_BACKEND_URL;
        const requestOrigin = request.nextUrl.origin.replace(/\/$/, "");
        const normalizedBackend = (ragBackendUrl || "").replace(/\/$/, "");
        const isSelfTarget =
            !normalizedBackend ||
            normalizedBackend === requestOrigin ||
            normalizedBackend === "http://localhost:3000";

        // Avoid recursive calls when backend URL points to this same Next.js app.
        if (isSelfTarget) {
            return NextResponse.json(
                {
                    success: true,
                    query,
                    answer: getLocalFallbackAnswer(query),
                    confidence: "low",
                    retrievedAt: new Date().toISOString(),
                },
                { status: 200 }
            );
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${normalizedBackend}/api/rag/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query, topK }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`RAG backend returned ${response.status}`);
            }

            const data = await response.json();
            return NextResponse.json(data);
        } catch (backendError) {
            console.error("RAG backend error:", backendError);

            // Fallback response
            return NextResponse.json(
                {
                    success: true,
                    query,
                    answer: getLocalFallbackAnswer(query),
                    confidence: "low",
                    retrievedAt: new Date().toISOString(),
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to process chat query" },
            { status: 500 }
        );
    }
}
