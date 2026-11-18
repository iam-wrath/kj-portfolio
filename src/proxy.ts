import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request nonce-based Content Security Policy.
 * Site pages get a strict policy; the Keystatic admin gets a slightly relaxed one it needs to run.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const isAdmin = request.nextUrl.pathname.startsWith("/keystatic");

  const directives = isAdmin
    ? [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://i.ytimg.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        // Keystatic (GitHub mode, public repo) reads file contents from raw.githubusercontent.com.
        "connect-src 'self' https://api.github.com https://github.com https://raw.githubusercontent.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://github.com",
        "frame-ancestors 'none'",
      ]
    : [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
        // GSAP and next/image write inline style attributes.
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://i.ytimg.com https://i.vimeocdn.com",
        "font-src 'self'",
        `connect-src 'self'${isDev ? " ws:" : ""}`,
        "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "manifest-src 'self'",
        ...(isDev ? [] : ["upgrade-insecure-requests"]),
      ];
  const csp = directives.join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|media|favicon.ico|icon.svg|apple-icon|manifest.webmanifest|opengraph-image|twitter-image|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
