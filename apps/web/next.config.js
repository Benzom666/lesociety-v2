/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to prevent double-render in dev mode (helps with legacy code)
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    domains: [
      "lesociety.s3.ca-central-1.amazonaws.com",
      "secrettime-cdn.s3.eu-west-2.amazonaws.com",
      "d2hill0ae3zx76.cloudfront.net",
    ],
  },

  devIndicators: {
    autoPrerender: false,
  },

  env: {
    modules: ["auth", "event"],
    MAPBOX_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1Ijoic2VjcmV0dGltZSIsImEiOiJja3poN3dhY2IwZXk3Mm5vMmlqdnpqMDNxIn0.RELof70VoVmL4Y4-C8HHmw",
  },
}

module.exports = nextConfig
