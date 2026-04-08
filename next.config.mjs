import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Resolve the exact directory where next/package.json lives,
// then use its parent as the turbopack root so Turbopack never
// mis-infers the workspace root from a parent directory.
const nextPkgDir = require.resolve('next/package.json').replace('/package.json', '')
const projectRoot = new URL('.', import.meta.url).pathname.replace(/\/$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: projectRoot,
  },
}

export default nextConfig
