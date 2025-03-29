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
    },
    serverComponentsExternalPackages: []
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone'
}

export default nextConfig
