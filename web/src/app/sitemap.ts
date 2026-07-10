import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nirmalspices.in';

  // Base static routes
  const routes = [
    '',
    '/shop',
    '/faq',
    '/shipping-policy',
    '/return-policy',
    '/privacy-policy',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic product routes
  try {
    const res = await api.get('/products?limit=100');
    const products = res.data.data || [];
    
    const productRoutes = products.map((p: any) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...routes, ...productRoutes];
  } catch {
    return routes;
  }
}
