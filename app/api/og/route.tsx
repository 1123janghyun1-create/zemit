import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "zemix";
    const tagline =
      searchParams.get("tagline") || "사이드 프로젝트 메이커 커뮤니티";
    const maker = searchParams.get("maker") || "";
    const type = searchParams.get("type") || "project"; // project | builder

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            padding: "60px 70px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle gradient background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-100px",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.05) 50%, transparent 70%)",
            }}
          />

          {/* Top Brand Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "#3B82F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
                  color: "#ffffff",
                  fontSize: "26px",
                  fontWeight: 900,
                }}
              >
                Z
              </div>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                }}
              >
                zemix
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#93c5fd",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {type === "builder" ? "🛠️ Builder Profile" : "🚀 Side Project"}
            </div>
          </div>

          {/* Middle Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              zIndex: 2,
              marginTop: "20px",
            }}
          >
            <h1
              style={{
                fontSize: title.length > 25 ? "52px" : "64px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                margin: 0,
                maxHeight: "140px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                lineHeight: 1.4,
                margin: 0,
                maxWidth: "950px",
                maxHeight: "68px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tagline}
            </p>
          </div>

          {/* Bottom Footer / Maker Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "24px",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {maker ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#ffffff",
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "#71717a", fontSize: "18px" }}>by</span>
                  <span style={{ color: "#60a5fa" }}>{maker}</span>
                </div>
              ) : (
                <span style={{ color: "#71717a", fontSize: "18px" }}>
                  사이드 프로젝트 메이커 커뮤니티
                </span>
              )}
            </div>

            <div
              style={{
                color: "#71717a",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              zemix.vercel.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, {
      status: 500,
    });
  }
}
