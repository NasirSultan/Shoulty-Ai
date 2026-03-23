import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shoutly AI - One Prompt, 365 Days of Content";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #f97316 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 1,
            opacity: 0.95,
          }}
        >
          Shoutly AI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.08,
              fontWeight: 800,
              maxWidth: 940,
            }}
          >
            One Prompt, 365 Days of Social Media Content
          </div>
          <div style={{ fontSize: 30, opacity: 0.95 }}>
            Generate, brand, and schedule in minutes.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
