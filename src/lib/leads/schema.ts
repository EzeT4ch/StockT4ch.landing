import { z } from 'astro/zod';

const cleanText = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const leadSchema = z.object({
  submissionId: z.uuid(),
  nombre: z.string().min(2, 'Ingresá tu nombre.').max(80).transform(cleanText),
  comercio: z.string().min(2, 'Ingresá el nombre del comercio.').max(100).transform(cleanText),
  rubro: z.string().min(2, 'Ingresá el rubro.').max(80).transform(cleanText),
  whatsapp: z.string().trim().min(8).max(24).regex(/^[\d\s+()-]+$/, 'Ingresá un WhatsApp válido.'),
  email: z.email('Ingresá un email válido.').trim().max(160).transform((value) => value.toLowerCase()),
  sucursales: z.enum(['1', '2-3', '4+']),
  privacyConsent: z.literal(true, 'Necesitamos tu consentimiento para contactarte.'),
  privacyVersion: z.string().regex(/^v\d+(?:\.\d+){0,2}$/),
  website: z.string().max(0, 'Solicitud rechazada.'),
}).strict();

export type ValidatedLeadInput = z.infer<typeof leadSchema>;
