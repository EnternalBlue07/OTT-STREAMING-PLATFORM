/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ["better-sqlite3", "pg"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  devIndicators: false,
  // Hardcode the production API URL so Vercel builds always point to Render backend.
  // This overrides NEXT_PUBLIC_API_BASE at build time.
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "https://ott-streaming-platform.onrender.com",
  },
};

export default nextConfig;
