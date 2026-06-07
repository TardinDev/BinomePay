import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://binomepay.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/login', '/register', '/terms']
  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.6,
  }))
}
