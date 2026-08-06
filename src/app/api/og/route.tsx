import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Global Chronicle - Breaking News";
    const category = searchParams.get("category") || "Headlines";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundImage: "linear-gradient(to bottom right, #0f172a, #1e1b4b)",
            padding: "60px",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "900",
                fontSize: "24px",
              }}
            >
              GC
            </div>
            <span style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "1px" }}>
              GLOBAL CHRONICLE
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                border: "1px solid rgba(37, 99, 235, 0.5)",
                color: "#60a5fa",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "700",
                textTransform: "uppercase",
                width: "fit-content",
              }}
            >
              {category}
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "900",
                lineHeight: "1.2",
                maxWidth: "900px",
                color: "#f8fafc",
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
              fontSize: "16px",
              color: "#94a3b8",
            }}
          >
            <span>Trusted Independent Media</span>
            <span>globalchronicle.news</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the OG image`, {
      status: 500,
    });
  }
}
