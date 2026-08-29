import { log } from '../logging/logger';
import type { LeadDeliveryPort } from './lead-delivery-port';
import type { LeadMessage } from '../leads/types';

export class ConsoleLeadDelivery implements LeadDeliveryPort {
  public async deliver(message: LeadMessage): Promise<void> {
    log('info', 'lead_delivery_console', {
      submissionId: message.lead.submissionId,
      experimentId: message.experiment.experimentId,
      variant: message.experiment.variant,
    });
  }
}
