import nodemailer from 'nodemailer';
import type { RuntimeConfig } from '../../config/env';
import type { LeadDeliveryPort } from './lead-delivery-port';
import type { LeadMessage } from '../leads/types';

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export class SmtpLeadDelivery implements LeadDeliveryPort {
  private readonly transporter;

  public constructor(private readonly config: RuntimeConfig['email']) {
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.password },
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 10_000,
    });
  }

  public async deliver(message: LeadMessage, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Lead delivery aborted.');
    const { lead, experiment } = message;
    const rows = [
      ['Fecha/hora', message.acceptedAt],
      ['Nombre', lead.nombre],
      ['Comercio', lead.comercio],
      ['Rubro', lead.rubro],
      ['WhatsApp', lead.whatsapp],
      ['Email', lead.email],
      ['Sucursales', lead.sucursales],
      ['Consentimiento', `Aceptado (${lead.privacyVersion})`],
      ['Source/page', message.source],
      ['Experimento', experiment.experimentId],
      ['Variante', experiment.variant],
      ['Submission ID', lead.submissionId],
    ] as const;
    const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
    const html = `<h1>Nuevo lead StockTech</h1><table>${rows.map(([label, value]) => `<tr><th align="left">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('')}</table>`;
    await this.transporter.sendMail({
      to: this.config.to,
      from: this.config.from,
      replyTo: lead.email,
      subject: `Nuevo lead StockTech · ${lead.comercio}`,
      text,
      html,
      headers: { 'Resend-Idempotency-Key': `stocktech-lead/${lead.submissionId}` },
    });
  }
}
