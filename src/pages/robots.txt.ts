import type { APIRoute } from 'astro';
import { getRuntimeConfig } from '../config/env';

export const GET: APIRoute = () => {
  const config = getRuntimeConfig();
  return new Response(`User-agent: *\nAllow: /\nDisallow: /_actions/\nSitemap: ${new URL('/sitemap.xml', config.siteUrl)}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
