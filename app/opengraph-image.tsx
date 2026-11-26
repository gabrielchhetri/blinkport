import { ImageResponse } from "next/og";

import { siteName } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f5f4ee",
          color: "#1b2926",
          display: "flex",
          height: "100%",
          padding: "54px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#1d302b",
            borderRadius: "24px",
            color: "#f5f4ee",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", width: "72%" }}>
            <div style={{ color: "#ee9a72", fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Temporary sharing
            </div>
            <div style={{ fontFamily: "Georgia", fontSize: 78, lineHeight: 1.02 }}>{siteName}</div>
            <div style={{ color: "#d8e0d8", fontSize: 30, lineHeight: 1.35 }}>
              Share text, code, and files up to 5 MB. Gone in ten minutes.
            </div>
          </div>

          <div style={{ display: "flex", gap: 18 }}>
            {["Text notes", "Code snippets", "Small files"].map((item) => (
              <div
                key={item}
                style={{
                  background: "rgba(245,244,238,0.08)",
                  border: "1px solid rgba(245,244,238,0.18)",
                  borderRadius: 999,
                  color: "#f5f4ee",
                  display: "flex",
                  fontSize: 24,
                  padding: "14px 22px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
