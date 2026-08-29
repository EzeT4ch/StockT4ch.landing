import { ActionError, defineAction } from 'astro:actions';
import { getRuntimeConfig } from '../config/env';
import { ConsoleLeadDelivery } from '../lib/email/console-lead-delivery';
import { SmtpLeadDelivery } from '../lib/email/smtp-lead-delivery';
import { HERO_EXPERIMENT_COOKIE, isHeroVariant } from '../lib/experiments/hero';
import { LeadRateLimitError, LeadService } from '../lib/leads/lead-service';
import { leadSchema } from '../lib/leads/schema';
import { MemoryRateLimiter } from '../lib/rate-limit/memory-rate-limiter';

const limiter = new MemoryRateLimiter(5, 15 * 60 * 1000);

const getLeadService = (): LeadService => {
  const config = getRuntimeConfig();
  const delivery = config.email.provider === 'smtp'
    ? new SmtpLeadDelivery(config.email)
    : new ConsoleLeadDelivery();
  return new LeadService(limiter, delivery);
};

export const server = {
  submitLead: defineAction({
    accept: 'json',
    input: leadSchema,
    handler: async (input, context) => {
      const config = getRuntimeConfig();
      if (input.privacyVersion !== config.legal.privacyVersion) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'La política cambió. Actualizá la página y volvé a intentarlo.' });
      }
      const cookieVariant = context.cookies.get(HERO_EXPERIMENT_COOKIE)?.value;
      const variant = isHeroVariant(cookieVariant) ? cookieVariant : 'A';
      const requestKey = context.request.headers.get('x-real-ip') || context.clientAddress || 'unknown';
      const requestId = context.locals.requestId || crypto.randomUUID();
      try {
        return await getLeadService().submit(input, {
          requestKey,
          requestId,
          experiment: { experimentId: 'hero_copy_v1', variant, version: 1 },
        });
      } catch (error) {
        if (error instanceof LeadRateLimitError) {
          throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: error.message });
        }
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No pudimos enviar tus datos. Probá de nuevo.' });
      }
    },
  }),
};
