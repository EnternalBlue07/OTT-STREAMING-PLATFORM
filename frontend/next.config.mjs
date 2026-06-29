/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double-render hydration issues
  // better-sqlite3 / pg are native server-only deps; keep them external on the server.
  serverExternalPackages: ["better-sqlite3", "pg"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  devIndicators: false,
};

export default nextConfig;
