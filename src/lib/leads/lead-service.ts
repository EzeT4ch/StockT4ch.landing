import type { ExperimentContext } from '../experiments/types';
import type { LeadDeliveryPort } from '../email/lead-delivery-port';
import { log } from '../logging/logger';
import type { RateLimiterPort } from '../rate-limit/port';
import type { ValidatedLeadInput } from './schema';

const deliveredSubmissions = new Map<string, number>();
const IDEMPOTENCY_TTL_MS = 30 * 60 * 1000;

export class LeadRateLimitError extends Error {}

export class LeadService {
  public constructor(
    private readonly rateLimiter: RateLimiterPort,
    private readonly delivery: LeadDeliveryPort,
  ) {}

  public async submit(input: ValidatedLeadInput, context: {
    requestKey: string;
    requestId: string;
    experiment: ExperimentContext;
  }): Promise<{ success: true }> {
    const now = Date.now();
    const knownAt = deliveredSubmissions.get(input.submissionId);
    if (knownAt && now - knownAt < IDEMPOTENCY_TTL_MS) return { success: true };

    const decision = this.rateLimiter.consume(context.requestKey, now);
    if (!decision.allowed) {
      log('warn', 'lead_rate_limit_triggered', { requestId: context.requestId, retryAfterSeconds: decision.retryAfterSeconds });
      throw new LeadRateLimitError('Demasiados intentos. Esperá unos minutos y probá de nuevo.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      await Promise.race([
        this.delivery.deliver({
          acceptedAt: new Date(now).toISOString(),
          source: '/',
          lead: {
            submissionId: input.submissionId,
            nombre: input.nombre,
            comercio: input.comercio,
            rubro: input.rubro,
            whatsapp: input.whatsapp,
            email: input.email,
            sucursales: input.sucursales,
            privacyConsent: input.privacyConsent,
            privacyVersion: input.privacyVersion,
          },
          experiment: context.experiment,
        }, controller.signal),
        new Promise<never>((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('Lead delivery timeout.')), { once: true })),
      ]);
      deliveredSubmissions.set(input.submissionId, now);
      log('info', 'lead_accepted', { requestId: context.requestId, submissionId: input.submissionId, variant: context.experiment.variant });
      return { success: true };
    } catch (error) {
      log('error', 'lead_delivery_failed', {
        requestId: context.requestId,
        submissionId: input.submissionId,
        reason: error instanceof Error ? error.message : 'unknown',
      });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
