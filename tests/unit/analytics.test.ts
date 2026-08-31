import { describe, expect, it } from 'vitest';
import { toGa4EventName, toGa4Parameters } from '../../src/lib/analytics/client';

describe('GA4 analytics mapping', () => {
  it('uses GA4-safe event names for commercial conversions', () => {
    expect(toGa4EventName('LAUNCH_SIGNUP')).toBe('generate_lead');
    expect(toGa4EventName('WHATSAPP_CLICK')).toBe('whatsapp_click');
  });

  it('allows only non-identifying event parameters', () => {
    expect(toGa4Parameters({
      experiment: 'hero_copy_v1', variant: 'A', page: '/', placement: 'hero', email: 'private@example.com', whatsapp: '+5491112345678', fields: ['email', 'privacyConsent'],
    })).toEqual({ experiment_id: 'hero_copy_v1', experiment_variant: 'A', page_path: '/', cta_placement: 'hero', invalid_fields: 'email,privacyConsent' });
  });
});
