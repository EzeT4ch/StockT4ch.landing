import { describe, expect, it } from 'vitest';
import { leadSchema } from '../../src/lib/leads/schema';

const validLead = { submissionId: crypto.randomUUID(), nombre: '  Martina  Gómez ', comercio: ' Almacén ', rubro: ' Almacén ', whatsapp: '11 5555 5555', email: 'MARTINA@TEST.COM', sucursales: '1', privacyConsent: true, privacyVersion: 'v1.0', website: '' };
describe('lead validation', () => {
  it('normaliza campos válidos', () => expect(leadSchema.parse(validLead)).toMatchObject({ nombre: 'Martina Gómez', email: 'martina@test.com' }));
  it('rechaza honeypot completo', () => expect(leadSchema.safeParse({ ...validLead, website: 'spam.test' }).success).toBe(false));
  it('rechaza payload inesperado', () => expect(leadSchema.safeParse({ ...validLead, secret: 'unexpected' }).success).toBe(false));
  it('limita longitudes', () => expect(leadSchema.safeParse({ ...validLead, nombre: 'x'.repeat(81) }).success).toBe(false));
  it('requiere consentimiento expreso', () => expect(leadSchema.safeParse({ ...validLead, privacyConsent: false }).success).toBe(false));
});
