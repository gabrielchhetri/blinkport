import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typedRoutes: true,
  async headers() {
    const headers = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://")) {
      headers.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    }

    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
