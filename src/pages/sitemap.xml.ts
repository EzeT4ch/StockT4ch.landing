import type { APIRoute } from 'astro';
import { getRuntimeConfig } from '../config/env';

const paths = ['/', '/guias/control-de-stock', '/guias/facturacion-arca', '/guias/como-controlar-stock-negocio', '/guias/sistema-gestion-pymes'];
export const GET: APIRoute = () => {
  const config = getRuntimeConfig();
  const urls = paths.map((path) => `<url><loc>${new URL(path, config.siteUrl)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
