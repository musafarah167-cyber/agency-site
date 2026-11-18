import type { MetadataRoute } from 'next';
import { offers, serviceLink } from '../content/growth';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/solutions/',
    '/industries/',
    '/about/',
    '/contact/',
    '/demo/',
    ...offers.map((o) => serviceLink(o.slug)),
  ].map((url) => ({ url: 'https://clearsign.uk' + url }));
}
