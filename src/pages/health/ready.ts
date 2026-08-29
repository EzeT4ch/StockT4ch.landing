import type { APIRoute } from 'astro';
import { getRuntimeConfig } from '../../config/env';

export const GET: APIRoute = () => {
  try {
    getRuntimeConfig();
    return new Response(JSON.stringify({ status: 'ready' }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(JSON.stringify({ status: 'not_ready' }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
};
