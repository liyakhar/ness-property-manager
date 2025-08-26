/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Ignore ESLint errors during production builds to avoid build failures
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
