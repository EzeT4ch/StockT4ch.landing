import { describe, expect, it, vi } from 'vitest';
import type { LeadDeliveryPort } from '../../src/lib/email/lead-delivery-port';
import { LeadService } from '../../src/lib/leads/lead-service';
import type { LeadMessage } from '../../src/lib/leads/types';
import { MemoryRateLimiter } from '../../src/lib/rate-limit/memory-rate-limiter';

const input = () => ({ submissionId: crypto.randomUUID(), nombre: 'Martina', comercio: 'Almacén', rubro: 'Almacén', whatsapp: '11 5555 5555', email: 'martina@test.com', sucursales: '1' as const, privacyConsent: true as const, privacyVersion: 'v1.0', website: '' });
const context = { requestKey: '127.0.0.1', requestId: 'req-test', experiment: { experimentId: 'hero_copy_v1' as const, variant: 'B' as const, version: 1 as const } };

describe('lead submission integration', () => {
  it('entrega el lead con contexto de experimento', async () => {
    let delivered: LeadMessage | undefined;
    const delivery: LeadDeliveryPort = { deliver: vi.fn(async (message) => { delivered = message; }) };
    await expect(new LeadService(new MemoryRateLimiter(), delivery).submit(input(), context)).resolves.toEqual({ success: true });
    expect(delivered?.experiment).toMatchObject({ experimentId: 'hero_copy_v1', variant: 'B' });
  });
  it('no duplica un submissionId', async () => {
    const delivery: LeadDeliveryPort = { deliver: vi.fn(async () => undefined) };
    const service = new LeadService(new MemoryRateLimiter(), delivery);
    const lead = input();
    await service.submit(lead, context); await service.submit(lead, context);
    expect(delivery.deliver).toHaveBeenCalledTimes(1);
  });
  it('no revela el error del proveedor al cliente del servicio', async () => {
    const delivery: LeadDeliveryPort = { deliver: vi.fn(async () => { throw new Error('SMTP secret detail'); }) };
    await expect(new LeadService(new MemoryRateLimiter(), delivery).submit(input(), context)).rejects.toThrow('SMTP secret detail');
  });
});
