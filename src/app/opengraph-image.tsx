import { ImageResponse } from "next/og";

export const alt = "Jeffrey Agyemang Acheampong — Aspiring Cybersecurity Analyst & Digital Media Creator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#000000",
          color: "#F5F5F5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#A3A3A3", letterSpacing: 2 }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#C6FF3D" }} />
          KUMASI, GHANA — PORTFOLIO
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 800, letterSpacing: -5, lineHeight: 0.95 }}>
          <div style={{ display: "flex" }}>I secure systems</div>
          <div style={{ display: "flex" }}>
            &amp; tell stories<span style={{ color: "#C6FF3D" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#A3A3A3" }}>
          <span style={{ color: "#F5F5F5", fontWeight: 700 }}>Jeffrey Agyemang Acheampong</span>
          <span>Cybersecurity · Photography · Video · Live streaming</span>
        </div>
      </div>
    ),
    size
  );
}
