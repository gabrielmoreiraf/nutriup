import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CSP: em dev o Next precisa de 'unsafe-eval' (HMR); em prod fica mais restrito.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.anthropic.com https://api.stripe.com",
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  // PGlite (dev local) e bcryptjs são pacotes nativos/WASM — não empacotar no bundle.
  serverExternalPackages: ["@electric-sql/pglite", "bcryptjs"],
  // Preview local acessa via 127.0.0.1 além de localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
