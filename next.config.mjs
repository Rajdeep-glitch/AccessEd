/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure server-only libs are resolved at runtime instead of bundled
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (!config.externals) config.externals = []
      if (Array.isArray(config.externals)) {
        config.externals.push('pdf-parse', 'mammoth')
      }
    }
    return config
  },
}

export default nextConfig
