import type { NextConfig } from "next";

/**
 * Static security headers. The Content-Security-Policy (with a per-request nonce)
 * is set in src/proxy.ts.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Dev only: Keystatic's GitHub mode moves the local admin to 127.0.0.1 (GitHub OAuth needs it),
  // so the dev server must accept that origin. Has no effect on production builds.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 828, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
  },
  // Content files are read at request time (pages are dynamic because of the CSP nonce),
  // so make sure they ship with the serverless functions.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./public/media/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
