import { defineMiddleware } from 'astro:middleware';
import { getRuntimeConfig } from './config/env';
import { HERO_EXPERIMENT_COOKIE, resolveHeroExperiment } from './lib/experiments/hero';
import { log } from './lib/logging/logger';

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
let startupLogged = false;

export const onRequest = defineMiddleware(async (context, next) => {
  const config = getRuntimeConfig();
  if (!startupLogged) {
    log('info', 'application_startup', { nodeEnv: config.nodeEnv, siteMode: config.commercial.mode });
    startupLogged = true;
  }
  const requestId = context.request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID();
  context.locals.requestId = requestId;
  context.locals.experiment = null;

  if (context.url.pathname === '/') {
    const cookieValue = context.cookies.get(HERO_EXPERIMENT_COOKIE)?.value;
    const overrideValue = context.url.searchParams.get('exp_hero') ?? undefined;
    const result = resolveHeroExperiment({
      options: {
        enabled: config.experiments.enabled && config.experiments.heroEnabled,
        weightA: config.experiments.heroWeightA,
        weightB: config.experiments.heroWeightB,
      },
      ...(cookieValue === undefined ? {} : { cookieValue }),
      ...(overrideValue === undefined ? {} : { overrideValue }),
      allowOverride: config.nodeEnv !== 'production',
    });
    context.locals.experiment = result.context;
    if (result.shouldSetCookie) {
      context.cookies.set(HERO_EXPERIMENT_COOKIE, result.context.variant, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        path: '/',
        maxAge: COOKIE_MAX_AGE_SECONDS,
      });
    }
    if (result.overridden) {
      log('info', 'experiment_override', { experimentId: result.context.experimentId, variant: result.context.variant, requestId });
    }
  }

  let response: Response;
  try {
    response = await next();
  } catch (error) {
    log('error', 'server_error', { requestId, path: context.url.pathname, reason: error instanceof Error ? error.message : 'unknown' });
    throw error;
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Request-Id', requestId);
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://static.cloudflareinsights.com; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com https://cloudflareinsights.com; frame-src 'none'; upgrade-insecure-requests",
  );
  if (context.url.pathname === '/') {
    response.headers.set('Cache-Control', 'private, no-store');
  }
  return response;
});
