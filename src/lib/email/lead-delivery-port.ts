import type { LeadMessage } from '../leads/types';

export interface LeadDeliveryPort {
  deliver(message: LeadMessage, signal: AbortSignal): Promise<void>;
}
