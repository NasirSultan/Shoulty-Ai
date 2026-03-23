import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "About Shoutly AI";
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
            "linear-gradient(135deg, #172554 0%, #1d4ed8 48%, #f97316 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700 }}>Shoutly AI</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 70, fontWeight: 800, lineHeight: 1.08 }}>
            About Us
          </div>
          <div style={{ fontSize: 30, opacity: 0.95 }}>
            Building the future of AI social media automation.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
