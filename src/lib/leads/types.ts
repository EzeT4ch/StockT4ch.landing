import type { ExperimentContext } from '../experiments/types';

export interface LeadInput {
  readonly submissionId: string;
  readonly nombre: string;
  readonly comercio: string;
  readonly rubro: string;
  readonly whatsapp: string;
  readonly email: string;
  readonly sucursales: '1' | '2-3' | '4+';
  readonly privacyConsent: true;
  readonly privacyVersion: string;
  readonly website: string;
}

export interface NormalizedLead extends Omit<LeadInput, 'website'> {}

export interface LeadMessage {
  readonly acceptedAt: string;
  readonly source: '/';
  readonly lead: NormalizedLead;
  readonly experiment: ExperimentContext;
}
