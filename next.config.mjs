/*
<ai_context>
Configures Next.js for the app.
</ai_context>
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  poweredByHeader: false,
  reactStrictMode: true
}

export default nextConfig
