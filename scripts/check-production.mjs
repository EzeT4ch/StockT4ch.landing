import { access, readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const required = ['PUBLIC_SITE_URL','PUBLIC_APP_URL','PUBLIC_CONTACT_EMAIL','PUBLIC_WHATSAPP_NUMBER','LEGAL_DATA_CONTROLLER_NAME','LEGAL_ADDRESS','LEGAL_JURISDICTION','LEGAL_LAST_UPDATED','LEGAL_PRIVACY_VERSION','LEAD_RETENTION_MONTHS','LEAD_EMAIL_TO','LEAD_EMAIL_FROM','EMAIL_PROVIDER','SMTP_HOST','SMTP_USER','SMTP_PASSWORD'];
const errors = [];
for (const name of required) if (!process.env[name]?.trim()) errors.push(`${name} es obligatoria.`);
for (const name of ['PUBLIC_SITE_URL','PUBLIC_APP_URL']) {
  try {
    const url = new URL(process.env[name] ?? '');
    if (url.protocol !== 'https:' || url.hostname === 'localhost') errors.push(`${name} debe usar HTTPS y un dominio real.`);
  } catch { errors.push(`${name} no es una URL válida.`); }
}
if (process.env.TRIAL_DAYS !== '15') errors.push('TRIAL_DAYS debe ser 15.');
const weightA = Number(process.env.EXPERIMENT_HERO_WEIGHT_A ?? 50);
const weightB = Number(process.env.EXPERIMENT_HERO_WEIGHT_B ?? 50);
if (weightA < 0 || weightB < 0 || weightA + weightB !== 100) errors.push('Los pesos A/B deben sumar 100.');
const publicSecrets = Object.entries(process.env).filter(([name, value]) => name.startsWith('PUBLIC_') && /password|secret|token|private.?key/i.test(`${name}=${value ?? ''}`));
if (publicSecrets.length) errors.push('Hay secretos expuestos con prefijo PUBLIC_.');
const environmentText = Object.values(process.env).join('\n');
if (/example-stocktech|__PUBLIC_SITE_URL__|placeholder/i.test(environmentText)) errors.push('La configuración contiene placeholders prohibidos.');

const roots = ['src/components', 'src/pages', 'src/styles', 'public'];
const prohibited = [/\b14 días\b/i, /example-stocktech/i, /__PUBLIC_SITE_URL__/i, /Más elegido/i, /a definir/i, /seguís cobrando offline/i, /Manrope/i];
const scan = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (['.ts','.astro','.css','.html','.xml','.svg'].includes(extname(path))) {
      const text = await readFile(path, 'utf8');
      for (const pattern of prohibited) if (pattern.test(text)) errors.push(`${path} contiene ${pattern}.`);
    }
  }
};
for (const root of roots) {
  try { await access(root); await scan(root); } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
if (errors.length) {
  console.error(JSON.stringify({ level: 'error', event: 'production_config_invalid', errors }));
  process.exit(1);
}
console.info(JSON.stringify({ level: 'info', event: 'production_config_valid' }));
