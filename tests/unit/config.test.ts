import { describe, expect, it } from 'vitest';
import { validateRuntimeConfig } from '../../src/config/env';

const productionEnv = (): NodeJS.ProcessEnv => ({
  NODE_ENV: 'production', PUBLIC_SITE_URL: 'https://stocktech.test', PUBLIC_APP_URL: 'https://app.stocktech.test',
  PUBLIC_CONTACT_EMAIL: 'contacto@stocktech.test', PUBLIC_WHATSAPP_NUMBER: '5491112345678', SITE_MODE: 'prelaunch', TRIAL_DAYS: '15',
  FOUNDERS_SLOTS: '10', FOUNDERS_DISCOUNT: '20', EXPERIMENT_HERO_WEIGHT_A: '50', EXPERIMENT_HERO_WEIGHT_B: '50',
  LEAD_EMAIL_TO: 'leads@stocktech.test', LEAD_EMAIL_FROM: 'web@stocktech.test', EMAIL_PROVIDER: 'smtp', SMTP_HOST: 'smtp.stocktech.test',
  SMTP_USER: 'user', SMTP_PASSWORD: 'secret', SMTP_PORT: '587', SMTP_SECURE: 'false',
  LEGAL_DATA_CONTROLLER_NAME: 'EzeTech SAS', LEGAL_ADDRESS: 'CABA, Argentina', LEGAL_JURISDICTION: 'Argentina', LEGAL_LAST_UPDATED: '2026-08-26', LEGAL_PRIVACY_VERSION: 'v1.0', LEAD_RETENTION_MONTHS: '12',
  PRICE_COMERCIO_ARS_MONTHLY: '40000', PRICE_NEGOCIO_ARS_MONTHLY: '60000', PRICE_EMPRESA_ARS_MONTHLY: '95000',
});

describe('runtime config', () => {
  it('APP_LINKS_ENABLED ausente es false', () => expect(validateRuntimeConfig(productionEnv()).appLinksEnabled).toBe(false));
  it('APP_LINKS_ENABLED="true" es true', () => expect(validateRuntimeConfig({ ...productionEnv(), APP_LINKS_ENABLED: 'true' }).appLinksEnabled).toBe(true));
  it('acepta una configuración productiva completa', () => expect(validateRuntimeConfig(productionEnv()).commercial.trialDays).toBe(15));
  it('acepta un remitente SMTP con nombre visible', () => expect(validateRuntimeConfig({ ...productionEnv(), LEAD_EMAIL_FROM: 'StockTech <web@stocktech.test>' }).email.from).toBe('StockTech <web@stocktech.test>'));
  it('rechaza un remitente SMTP con formato inválido', () => expect(() => validateRuntimeConfig({ ...productionEnv(), LEAD_EMAIL_FROM: 'StockTech <web@stocktech.test' })).toThrow(/emails/i));
  it('rechaza una medición habilitada sin proveedor configurado', () => expect(() => validateRuntimeConfig({ ...productionEnv(), ANALYTICS_ENABLED: 'true' })).toThrow(/proveedor/i));
  it('rechaza un identificador GA4 inválido', () => expect(() => validateRuntimeConfig({ ...productionEnv(), GA4_MEASUREMENT_ID: 'UA-123' })).toThrow(/GA4_MEASUREMENT_ID/i));
  it('rechaza un token Cloudflare inválido', () => expect(() => validateRuntimeConfig({ ...productionEnv(), CLOUDFLARE_WEB_ANALYTICS_TOKEN: 'not-a-token' })).toThrow(/CLOUDFLARE_WEB_ANALYTICS_TOKEN/i));
  it('falla ante un placeholder', () => expect(() => validateRuntimeConfig({ ...productionEnv(), PUBLIC_SITE_URL: 'https://example-stocktech.com.ar' })).toThrow(/placeholders/i));
  it('falla ante trial histórico', () => expect(() => validateRuntimeConfig({ ...productionEnv(), TRIAL_DAYS: '14' })).toThrow(/15/));
  it('falla ante pesos que no suman 100', () => expect(() => validateRuntimeConfig({ ...productionEnv(), EXPERIMENT_HERO_WEIGHT_A: '70' })).toThrow(/pesos/i));
  it('no permite proveedor console en producción', () => expect(() => validateRuntimeConfig({ ...productionEnv(), EMAIL_PROVIDER: 'console' })).toThrow(/smtp/i));

  describe('precios por variable de entorno', () => {
    const names = ['PRICE_COMERCIO_ARS_MONTHLY', 'PRICE_NEGOCIO_ARS_MONTHLY', 'PRICE_EMPRESA_ARS_MONTHLY'] as const;
    for (const name of names) {
      it(`en producción falla sin ${name}`, () => {
        const env = productionEnv(); delete env[name];
        expect(() => validateRuntimeConfig(env)).toThrow(new RegExp(name));
      });
      it(`en producción falla con ${name} vacío`, () => expect(() => validateRuntimeConfig({ ...productionEnv(), [name]: '' })).toThrow(new RegExp(name)));
      for (const bad of ['0', '-100', '34900.5', 'abc']) {
        it(`falla con ${name}=${bad}`, () => expect(() => validateRuntimeConfig({ ...productionEnv(), [name]: bad })).toThrow(new RegExp(name)));
      }
    }
    it('con valores válidos las tarjetas usan esos precios', () => {
      expect(validateRuntimeConfig(productionEnv()).commercial.plans.map((plan) => plan.price)).toEqual([40_000, 60_000, 95_000]);
    });
    it('en desarrollo usa los valores actuales', () => {
      const prices = validateRuntimeConfig({ NODE_ENV: 'development' }).commercial.plans.map((plan) => plan.price);
      expect(prices).toEqual([34_900, 54_900, 89_900]);
    });
  });
});
