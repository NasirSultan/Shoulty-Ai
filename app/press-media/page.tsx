"use client";
// pages/press.js
import Head from "next/head";

export default function Press() {
    return (
        <>
            <Head>
                <title>ShoutlyAI — Press & Newsroom</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div
                style={{
                    fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    backgroundColor: "#faf9f6",
                    color: "#111111",
                    lineHeight: 1.5,
                    margin: 0,
                    padding: 0,
                }}
            >
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "3rem 2rem 5rem",
                    }}
                >
                    {/* HEADER: Category-defining */}
                    <span
                        style={{
                            display: "inline-block",
                            background: "#f3f4f6",
                            color: "#f97316",
                            fontWeight: 600,
                            padding: "0.5rem 1.2rem",
                            borderRadius: "60px",
                            fontSize: "0.85rem",
                            border: "1px solid #e5e7eb",
                            marginBottom: "2rem",
                            letterSpacing: "0.3px",
                            textTransform: "uppercase",
                        }}
                    >
                        📰 PRESS · NEWSROOM · MEDIA
                    </span>

                    <h1
                        style={{
                            fontSize: "clamp(3rem, 8vw, 5rem)",
                            fontWeight: 800,
                            lineHeight: 1,
                            marginBottom: "1.5rem",
                        }}
                    >
                        BUILDING THE
                        <br />
                        <span
                            style={{
                                background:
                                    "linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 80%)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                backgroundSize: "200% 200%",
                                animation: "gradientShift 8s ease infinite",
                                fontWeight: 700,
                            }}
                        >
                            AI MARKETING
                        </span>
                        <br />
                        CATEGORY.
                    </h1>

                    <p
                        style={{
                            fontSize: "1.2rem",
                            color: "#4b5563",
                            maxWidth: "700px",
                            marginBottom: "3rem",
                            fontWeight: 400,
                            lineHeight: 1.7,
                        }}
                    >
                        ShoutlyAI isn't just another SaaS tool. We're architecting the future of
                        brand presence — where one prompt generates 365 days of content, and agencies
                        become optional.
                    </p>

                    {/* Authority Strip */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "2rem",
                            justifyContent: "space-between",
                            margin: "3rem 0",
                            padding: "2rem 0",
                            borderTop: "1px solid #f0f0f0",
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        {[
                            { icon: "🌍", text: "Global Operations · Bangalore · New York · Singapore" },
                            { icon: "🤖", text: "Proprietary AI · Brand Voice Engine" },
                            { icon: "🏢", text: "Enterprise-Ready · SOC2 · GDPR" },
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "#fef7f0",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#f97316",
                                        fontWeight: 700,
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div>{item.text}</div>
                            </div>
                        ))}
                    </div>

                    {/* BRAND STATEMENT */}
                    <div
                        style={{
                            background: "#ffffff",
                            borderRadius: "32px",
                            padding: "2.5rem",
                            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #f0f0f0",
                            margin: "2rem 0",
                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: 500,
                                color: "#1f2937",
                                lineHeight: 1.6,
                            }}
                        >
                            "We're building the infrastructure for AI-powered brand growth.{" "}
                            <span
                                style={{
                                    background:
                                        "linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 80%)",
                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",
                                    color: "transparent",
                                    fontWeight: 700,
                                }}
                            >
                                One prompt. 365 days. Zero agencies.
                            </span>{" "}
                            Media inquiries? Partnerships? Major announcements? You're in the right place."
                        </p>

                        <div
                            style={{
                                marginTop: "2rem",
                                display: "flex",
                                gap: "2rem",
                                color: "#6b7280",
                            }}
                        >
                            <span>⚡ Founded 2026</span>
                            <span>🚀 100+ early customers</span>
                            <span>📸 3,000+ posts generated</span>
                        </div>
                    </div>

                    {/* NEWSROOM SECTION */}
                    <div style={{ margin: "5rem 0" }}>
                        <h2 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 700, marginBottom: "2rem" }}>
                            📢 NEWSROOM
                        </h2>
                        <p style={{ color: "#4b5563", marginBottom: "2rem", fontSize: "1.1rem" }}>
                            Major announcements, product launches, and strategic partnerships live here.
                            This space is filling up fast. Watch closely.
                        </p>

                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "32px",
                                padding: "1.5rem 2rem",
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            {[
                                { date: "COMING Q2 2026", title: "ShoutlyAI Launches Enterprise Suite with Custom AI Training", badge: "🚀 PRODUCT" },
                                { date: "COMING Q2 2026", title: "Strategic Partnership Announcement: Global Social Platform Integration", badge: "🤝 PARTNERSHIP" },
                                { date: "COMING Q3 2026", title: "ShoutlyAI Raises Seed Funding to Accelerate AI Development", badge: "💰 FUNDING" },
                                { date: "COMING Q3 2026", title: "Festival Intelligence 2.0: Hyper-Local Content Engine", badge: "✨ FEATURE" },
                                { date: "COMING Q4 2026", title: "ShoutlyAI Expands to Europe: London HQ Opens", badge: "🌍 EXPANSION" },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: "2rem 0",
                                        borderBottom: idx === 4 ? "none" : "1px solid #f0f0f0",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span style={{
                                        color: "#f97316",
                                        fontWeight: 600,
                                        fontSize: "0.9rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        minWidth: "100px",
                                    }}>{item.date}</span>
                                    <span style={{
                                        fontSize: "1.3rem",
                                        fontWeight: 600,
                                        flex: 1,
                                        margin: "0.5rem 0",
                                    }}>{item.title}</span>
                                    <span style={{
                                        background: "#f3f4f6",
                                        padding: "0.3rem 1rem",
                                        borderRadius: "60px",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: "#f97316",
                                    }}>{item.badge}</span>
                                </div>
                            ))}
                        </div>

                        <p style={{ textAlign: "center", marginTop: "2rem", color: "#9ca3af", fontStyle: "italic" }}>
                            * Official press releases will be published here as they launch.
                        </p>
                    </div>

                    {/* You can continue converting the rest (media resources, contact card, vision card, partnerships) the same way */}
                </div>
            </div>

            <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
        </>
    );
}