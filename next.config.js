/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['newsapi.org', 'image.tmdb.org', 'via.placeholder.com'],
  },
  env: {
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
  },
}

module.exports = nextConfig