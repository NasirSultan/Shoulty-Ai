import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shoutly AI Pricing";
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
            "linear-gradient(135deg, #111827 0%, #1f2937 45%, #ea580c 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700 }}>Shoutly AI</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.08 }}>
            Pricing Plans
          </div>
          <div style={{ fontSize: 30, opacity: 0.95 }}>
            Pick the plan that fits your growth stage.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
