import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'
const repoName = 'navayuga-jarvis'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // On GitHub Pages the site is served from /repo-name/
  basePath: isProd ? `/${repoName}` : '',
  assetPrefix: isProd ? `/${repoName}/` : '',
  images: {
    unoptimized: true, // required for static export
  },
}

export default nextConfig
