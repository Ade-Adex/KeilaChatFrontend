// import type { NextConfig } from 'next'

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '/**',
//       },
//     ],
//   },
// }

// export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /*
   * Keep your existing Cloudinary configuration intact
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  /*
   * 🛡️ Add the Enterprise Reverse Proxy Engine
   * This forces the browser to treat backend API calls as first-party requests,
   * completely resolving the "Refresh token missing" production cookie block.
   */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig