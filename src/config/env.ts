import { createCommercialConfig, type CommercialConfig, type SiteMode } from './commercial';

export type EmailProvider = 'smtp' | 'console';

export interface RuntimeConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly siteUrl: URL;
  readonly appUrl: URL;
  readonly appLinksEnabled: boolean;
  readonly contactEmail: string;
  readonly whatsappNumber: string;
  readonly whatsappUrl: string;
  readonly commercial: CommercialConfig;
  readonly experiments: {
    readonly enabled: boolean;
    readonly heroEnabled: boolean;
    readonly heroWeightA: number;
    readonly heroWeightB: number;
  };
  readonly analytics: {
    readonly enabled: boolean;
    readonly debug: boolean;
    readonly ga4MeasurementId: string | null;
    readonly metaPixelId: string | null;
    readonly cloudflareWebAnalyticsToken: string | null;
  };
  readonly email: {
    readonly provider: EmailProvider;
    readonly to: string;
    readonly from: string;
    readonly smtp: {
      readonly host: string;
      readonly port: number;
      readonly user: string;
      readonly password: string;
      readonly secure: boolean;
    };
  };
  readonly legal: {
    readonly dataControllerName: string;
    readonly address: string;
    readonly jurisdiction: string;
    readonly leadRetentionMonths: number;
    readonly lastUpdated: string;
    readonly privacyVersion: string;
  };
}

const prohibited = ['example-stocktech.com.ar', '__PUBLIC_SITE_URL__'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailSenderPattern = /^(?:[^<>\r\n]+ <[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Valor booleano inválido: ${value}`);
};

const parseInteger = (name: string, value: string | undefined, fallback: number): number => {
  const parsed = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${name} debe ser un entero.`);
  return parsed;
};

const parseUrl = (name: string, value: string): URL => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url;
  } catch {
    throw new Error(`${name} debe ser una URL HTTP(S) válida.`);
  }
};

const requireValue = (name: string, value: string | undefined, fallback: string, production: boolean): string => {
  const result = value?.trim() || (production ? '' : fallback);
  if (!result) throw new Error(`${name} es obligatoria en producción.`);
  return result;
};

export const validateRuntimeConfig = (env: NodeJS.ProcessEnv): RuntimeConfig => {
  const rawNodeEnv = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(rawNodeEnv)) throw new Error('NODE_ENV inválido.');
  const nodeEnv = rawNodeEnv as RuntimeConfig['nodeEnv'];
  const production = nodeEnv === 'production';
  const siteUrlValue = requireValue('PUBLIC_SITE_URL', env.PUBLIC_SITE_URL, 'http://localhost:4321', production);
  const appUrlValue = requireValue('PUBLIC_APP_URL', env.PUBLIC_APP_URL, 'http://localhost:4200', production);
  const contactEmail = requireValue('PUBLIC_CONTACT_EMAIL', env.PUBLIC_CONTACT_EMAIL, 'contacto@stocktech.local', production);
  const whatsappNumber = requireValue('PUBLIC_WHATSAPP_NUMBER', env.PUBLIC_WHATSAPP_NUMBER, '5491100000000', production).replace(/\D/g, '');
  const siteMode = (env.SITE_MODE ?? 'prelaunch') as SiteMode;
  const trialDays = parseInteger('TRIAL_DAYS', env.TRIAL_DAYS, 15);
  const founderSlots = parseInteger('FOUNDERS_SLOTS', env.FOUNDERS_SLOTS, 10);
  const founderDiscount = parseInteger('FOUNDERS_DISCOUNT', env.FOUNDERS_DISCOUNT, 20);
  const heroWeightA = parseInteger('EXPERIMENT_HERO_WEIGHT_A', env.EXPERIMENT_HERO_WEIGHT_A, 50);
  const heroWeightB = parseInteger('EXPERIMENT_HERO_WEIGHT_B', env.EXPERIMENT_HERO_WEIGHT_B, 50);
  const emailProvider = (env.EMAIL_PROVIDER ?? (production ? '' : 'console')) as EmailProvider;
  const emailTo = requireValue('LEAD_EMAIL_TO', env.LEAD_EMAIL_TO, contactEmail, production);
  const emailFrom = requireValue('LEAD_EMAIL_FROM', env.LEAD_EMAIL_FROM, contactEmail, production);
  const dataControllerName = requireValue('LEGAL_DATA_CONTROLLER_NAME', env.LEGAL_DATA_CONTROLLER_NAME, 'EzeTech', production);
  const legalAddress = requireValue('LEGAL_ADDRESS', env.LEGAL_ADDRESS, 'No disponible en desarrollo', production);
  const jurisdiction = requireValue('LEGAL_JURISDICTION', env.LEGAL_JURISDICTION, 'Argentina', production);
  const legalLastUpdated = requireValue('LEGAL_LAST_UPDATED', env.LEGAL_LAST_UPDATED, '2026-08-26', production);
  const leadRetentionMonths = parseInteger('LEAD_RETENTION_MONTHS', env.LEAD_RETENTION_MONTHS, 12);
  const privacyVersion = requireValue('LEGAL_PRIVACY_VERSION', env.LEGAL_PRIVACY_VERSION, 'v1.0', production);
  const analyticsEnabled = parseBoolean(env.ANALYTICS_ENABLED, false);
  const analyticsDebug = parseBoolean(env.ANALYTICS_DEBUG, !production);
  const ga4MeasurementId = env.GA4_MEASUREMENT_ID?.trim() || null;
  const metaPixelId = env.META_PIXEL_ID?.trim() || null;
  const cloudflareWebAnalyticsToken = env.CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim() || null;

  const errors: string[] = [];
  if (!['prelaunch', 'launched'].includes(siteMode)) errors.push('SITE_MODE debe ser prelaunch o launched.');
  if (trialDays !== 15) errors.push('TRIAL_DAYS debe ser 15.');
  if (founderSlots < 1 || founderSlots > 100) errors.push('FOUNDERS_SLOTS debe estar entre 1 y 100.');
  if (founderDiscount < 1 || founderDiscount > 90) errors.push('FOUNDERS_DISCOUNT debe estar entre 1 y 90.');
  if (heroWeightA < 0 || heroWeightB < 0 || heroWeightA + heroWeightB !== 100) errors.push('Los pesos A/B deben ser positivos y sumar 100.');
  if (!emailPattern.test(contactEmail) || !emailPattern.test(emailTo) || !emailSenderPattern.test(emailFrom)) errors.push('Los emails configurados deben ser válidos.');
  if (whatsappNumber.length < 10 || whatsappNumber.length > 15) errors.push('PUBLIC_WHATSAPP_NUMBER debe tener entre 10 y 15 dígitos.');
  if (!['smtp', 'console'].includes(emailProvider)) errors.push('EMAIL_PROVIDER debe ser smtp o console.');
  if (leadRetentionMonths < 1 || leadRetentionMonths > 60) errors.push('LEAD_RETENTION_MONTHS debe estar entre 1 y 60.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(legalLastUpdated)) errors.push('LEGAL_LAST_UPDATED debe tener formato AAAA-MM-DD.');
  if (!/^v\d+(?:\.\d+){0,2}$/.test(privacyVersion)) errors.push('LEGAL_PRIVACY_VERSION debe tener formato v1, v1.0 o v1.0.0.');
  if (ga4MeasurementId && !/^G-[A-Z0-9]{4,20}$/.test(ga4MeasurementId)) errors.push('GA4_MEASUREMENT_ID debe tener formato G-XXXXXXXX.');
  if (cloudflareWebAnalyticsToken && !/^[a-f0-9]{32}$/i.test(cloudflareWebAnalyticsToken)) errors.push('CLOUDFLARE_WEB_ANALYTICS_TOKEN debe tener 32 caracteres hexadecimales.');
  if (analyticsEnabled && !ga4MeasurementId && !metaPixelId) errors.push('ANALYTICS_ENABLED requiere al menos un proveedor configurado.');
  if (production && emailProvider !== 'smtp') errors.push('EMAIL_PROVIDER debe ser smtp en producción.');
  if (production && prohibited.some((placeholder) => Object.values(env).some((value) => value?.includes(placeholder)))) errors.push('La configuración contiene placeholders prohibidos.');

  const smtpHost = env.SMTP_HOST?.trim() ?? '';
  const smtpUser = env.SMTP_USER?.trim() ?? '';
  const smtpPassword = env.SMTP_PASSWORD ?? '';
  if (emailProvider === 'smtp' && (!smtpHost || !smtpUser || !smtpPassword)) errors.push('SMTP_HOST, SMTP_USER y SMTP_PASSWORD son obligatorias para SMTP.');
  if (errors.length > 0) throw new Error(`Configuración inválida:\n- ${errors.join('\n- ')}`);

  const siteUrl = parseUrl('PUBLIC_SITE_URL', siteUrlValue);
  const appUrl = parseUrl('PUBLIC_APP_URL', appUrlValue);
  if (production && (siteUrl.hostname === 'localhost' || appUrl.hostname === 'localhost')) throw new Error('Las URLs de producción no pueden usar localhost.');

  return {
    nodeEnv,
    siteUrl,
    appUrl,
    appLinksEnabled: parseBoolean(env.APP_LINKS_ENABLED, false),
    contactEmail,
    whatsappNumber,
    whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, quiero saber más sobre StockTech.')}`,
    commercial: createCommercialConfig({ mode: siteMode, trialDays, founderSlots, founderDiscount }),
    experiments: {
      enabled: parseBoolean(env.EXPERIMENTS_ENABLED, true),
      heroEnabled: parseBoolean(env.EXPERIMENT_HERO_ENABLED, true),
      heroWeightA,
      heroWeightB,
    },
    analytics: {
      enabled: analyticsEnabled,
      debug: analyticsDebug,
      ga4MeasurementId,
      metaPixelId,
      cloudflareWebAnalyticsToken,
    },
    email: {
      provider: emailProvider,
      to: emailTo,
      from: emailFrom,
      smtp: {
        host: smtpHost,
        port: parseInteger('SMTP_PORT', env.SMTP_PORT, 587),
        user: smtpUser,
        password: smtpPassword,
        secure: parseBoolean(env.SMTP_SECURE, false),
      },
    },
    legal: { dataControllerName, address: legalAddress, jurisdiction, leadRetentionMonths, lastUpdated: legalLastUpdated, privacyVersion },
  };
};

let cachedConfig: RuntimeConfig | undefined;

export const getRuntimeConfig = (): RuntimeConfig => {
  cachedConfig ??= validateRuntimeConfig(process.env);
  return cachedConfig;
};

export const resetRuntimeConfigForTests = (): void => {
  cachedConfig = undefined;
};
