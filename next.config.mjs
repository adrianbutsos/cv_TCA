/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      // Force browser build of jsPDF to avoid Node.js worker/fflate SSR errors
      'jspdf': 'jspdf/dist/jspdf.es.min.js',
    },
  },
  webpack: (config) => {
    // Also alias for webpack (non-turbopack) builds
    config.resolve.alias['jspdf'] = 'jspdf/dist/jspdf.es.min.js'
    return config
  },
}

export default nextConfig
