import type { APIRoute } from 'astro';
import { getRuntimeConfig } from '../config/env';
import { guides } from '../config/guides';

export const GET: APIRoute = () => {
  const config = getRuntimeConfig();
  const pages = [{ path: '/', lastModified: undefined }, { path: '/guias', lastModified: undefined }, ...guides.map((guide) => ({ path: `/guias/${guide.slug}`, lastModified: guide.updatedAt }))];
  const urls = pages.map(({ path, lastModified }) => `<url><loc>${new URL(path, config.siteUrl)}</loc>${lastModified ? `<lastmod>${lastModified}</lastmod>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
