import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statik export — Hostinger (Apache/public_html) için
  output: "export",
  trailingSlash: true,          // /ilanlar/ → /ilanlar/index.html (Apache uyumlu)
  images: { unoptimized: true }, // statik export'ta görsel optimizasyonu kapalı
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://waymate-api-3zhm.onrender.com",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  },
};

export default nextConfig;
