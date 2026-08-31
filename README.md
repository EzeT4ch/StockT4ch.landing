# StockTech — Web comercial V2.1

Implementación productiva de la web comercial de StockTech. Reproduce el diseño congelado de `Web Comercial StockTech v2.1.dc.html` con Astro SSR, TypeScript estricto, Node standalone, Nginx y Docker.

## Arquitectura

```text
Internet
  → Nginx (único puerto público, compresión, proxy y política de caché)
    → Astro/Node standalone (SSR, middleware, Actions, email y health checks)
```

- La home se renderiza bajo demanda para asignar la variante A/B antes de producir HTML.
- Las páginas, componentes y endpoints entregan HTML primero; no hay framework UI hidratado.
- El JavaScript cliente se limita a navegación móvil, animaciones explicativas, analytics y formulario.
- La configuración comercial vive en `src/config/commercial.ts`; environment y validación viven en `src/config/env.ts`.
- El rate limit y la entrega de leads dependen de puertos reemplazables.

## Desarrollo local

Requiere Node 22.12 o superior y npm.

```bash
npm install
npm run dev
```

El modo desarrollo usa URLs locales, analytics de consola y entrega de leads a logs estructurados. No requiere SMTP.

Comandos útiles:

```bash
npm run check
npm test
npm run build
npm run test:e2e
```

## Docker

Copiá `.env.example` fuera del control de versiones como `.env.production`, completá valores reales y ejecutá:

```bash
docker compose --env-file .env.production up -d --build
docker compose logs -f web nginx
docker compose down
```

Nginx queda publicado en `http://localhost:8080` por defecto. En un servidor público definí `NGINX_PORT=80`. El contenedor `web` no publica puertos: usa una red interna para el proxy y una red de salida aislada para enviar leads por SMTP. La home y el HTML no se cachean de forma compartida para no mezclar cohortes A/B; los assets hash de `/_astro/` usan cache immutable.

## HTTPS en producción

El Compose base inicia en HTTP para que el proyecto funcione localmente sin certificados. Cuando `stocktech.com.ar` y `www.stocktech.com.ar` resuelvan al servidor, emití el primer certificado de Let's Encrypt y activá el override de producción:

```bash
CONTACT_EMAIL=$(sed -n 's/^PUBLIC_CONTACT_EMAIL=//p' .env.production)
sudo docker compose --env-file .env.production stop nginx
sudo certbot certonly --standalone --non-interactive --agree-tos --email "$CONTACT_EMAIL" -d stocktech.com.ar -d www.stocktech.com.ar
sudo docker compose --env-file .env.production -f compose.yaml -f compose.production.yaml up -d --build
```

`compose.production.yaml` expone 443, redirige HTTP y `www` a `https://stocktech.com.ar`, monta los certificados en modo lectura y atiende los desafíos de renovación. Luego del primer certificado, configurá la renovación por webroot y verificála con:

```bash
sudo certbot reconfigure --cert-name stocktech.com.ar --webroot -w /opt/stocktech/certbot/www
sudo certbot renew --dry-run
```

## Environment

| Variable | Uso |
| --- | --- |
| `PUBLIC_SITE_URL` | URL canónica pública de la web |
| `PUBLIC_APP_URL` | URL de la aplicación Angular |
| `PUBLIC_CONTACT_EMAIL` | Email público de contacto |
| `PUBLIC_WHATSAPP_NUMBER` | Número internacional sólo con dígitos |
| `SITE_MODE` | `prelaunch` o `launched` |
| `TRIAL_DAYS` | Debe ser `15` |
| `FOUNDERS_SLOTS` | Cupo fundador, hoy `10` |
| `FOUNDERS_DISCOUNT` | Descuento, hoy `20` |
| `EXPERIMENTS_ENABLED` | Habilita infraestructura A/B |
| `EXPERIMENT_HERO_ENABLED` | Habilita `hero_copy_v1` |
| `EXPERIMENT_HERO_WEIGHT_A/B` | Pesos enteros que deben sumar 100 |
| `ANALYTICS_ENABLED` | Habilita adapters externos |
| `ANALYTICS_DEBUG` | Registra eventos en consola |
| `GA4_MEASUREMENT_ID` | ID opcional de GA4 |
| `META_PIXEL_ID` | ID opcional de Meta Pixel |
| `LEAD_EMAIL_TO/FROM` | Destino y remitente de leads |
| `EMAIL_PROVIDER` | `smtp` en producción; `console` para desarrollo/test |
| `SMTP_HOST/PORT/USER/PASSWORD/SECURE` | Configuración SMTP sólo servidor |
| `LEGAL_DATA_CONTROLLER_NAME/ADDRESS/JURISDICTION` | Identificación del responsable y ley aplicable en los textos legales |
| `LEGAL_LAST_UPDATED` | Fecha `AAAA-MM-DD` publicada en los textos legales |
| `LEAD_RETENTION_MONTHS` | Plazo de conservación de leads, entre 1 y 60 meses |
| `NODE_ENV` | `development`, `test` o `production` |

Las variables con secretos no usan prefijo `PUBLIC_`. El contenedor ejecuta `npm run check:production` antes de levantar Node y falla ante variables faltantes, URLs locales/ficticias, pesos inválidos, trial distinto de 15 o residuos históricos.

## A/B testing

El único experimento activo es `hero_copy_v1` y cambia exclusivamente el H1.

- A: “Vendé, controlá tu stock y facturá desde un solo lugar.”
- B: “Vendé, controlá tu stock y facturá sin saltar entre sistemas.”

El middleware lee o crea `st_exp_hero_v1`, una cookie first-party, `HttpOnly`, `SameSite=Lax`, `Secure` en producción, path `/` y 30 días. El contexto `{ experimentId, variant, version }` llega a `Astro.locals`, analytics y leads.

Para deshabilitarlo: `EXPERIMENT_HERO_ENABLED=false`. Para cambiar distribución, modificá los dos pesos manteniendo suma 100. En desarrollo/preview puede forzarse con `/?exp_hero=A` o `/?exp_hero=B`; el override no se acepta ni persiste en producción.

Si cambia materialmente el texto, creá `hero_copy_v2`, una cookie nueva y una versión nueva. No reutilices `st_exp_hero_v1`.

La métrica primaria en prelaunch es `LAUNCH_SIGNUP`; no declares ganador sólo con clicks. Compará conversión por visitantes expuestos y esperá un tamaño de muestra definido antes de cerrar el experimento.

## Analytics y consentimiento

La UI llama a `AnalyticsPort`, no a proveedores. Los adapters disponibles son consola, GA4, Meta Pixel y composite. Cada evento incorpora automáticamente experimento, variante y página. El adaptador GA4 filtra los parámetros: nunca transmite nombres, emails, WhatsApps ni otros datos de formularios.

Eventos: `EXPERIMENT_EXPOSURE`, `CTA_CLICK`, `FORM_START`, `FORM_SUBMIT`, `FORM_ERROR`, `LAUNCH_SIGNUP`, `TRIAL_START`, `WHATSAPP_CLICK`, `PLAN_CLICK`, `FOUNDER_SIGNUP`, `DEMO_VIDEO_PLAY` y `PRICING_VIEW`.

`PRICING_VIEW` se dispara una sola vez al alcanzar 35% de visibilidad. `DEMO_VIDEO_PLAY` queda reservado para cuando `DemoMedia` reciba un video real.

Con `ANALYTICS_ENABLED=false` todo sigue funcionando. Para habilitar GA4, definí `ANALYTICS_ENABLED=true` y `GA4_MEASUREMENT_ID=G-XXXXXXXX`; la configuración falla si se habilita medición sin proveedor. El banner permite aceptar o rechazar medición, guarda la decisión en `st_analytics_consent` por seis meses y la persona puede cambiarla desde el pie de página. La cookie técnica A/B no contiene PII y no depende de ese consentimiento.

`CLOUDFLARE_WEB_ANALYTICS_TOKEN` habilita exclusivamente el beacon de Cloudflare Web Analytics para visitas agregadas y rendimiento. Se carga siempre, no recibe eventos comerciales ni datos de formularios, y no reemplaza el consentimiento de GA4. Configurá el hostname de Cloudflare con el dominio canónico `stocktech.com.ar`.

GA4 recibe los eventos en minúscula: `generate_lead` es la conversión principal de prelaunch y `whatsapp_click`, `cta_click`, `form_start`, `form_submit`, `form_error`, `experiment_exposure` y `pricing_view` sirven para analizar el embudo. Registrá como dimensiones personalizadas `experiment_id`, `experiment_variant`, `cta_placement` y `branch_range` si necesitás segmentarlas en informes.

## Leads y email

El formulario usa Astro Actions con Zod estricto. El servidor vuelve a validar y normalizar nombre, comercio, rubro, WhatsApp, email, sucursales, consentimiento expreso, honeypot y `submissionId`.

Flujo:

```text
Action → validación → MemoryRateLimiter → LeadService → LeadDeliveryPort → SMTP
```

El email se genera en servidor con contenido escapado e incluye fecha/hora, source, submission ID y contexto A/B. El cliente sólo recibe `{ success: true }` o un error genérico.

El limiter actual es local en memoria (5 intentos cada 15 minutos por origen) y la idempotencia básica dura 30 minutos. Esto es correcto para una única instancia. Antes de escalar horizontalmente, implementá `RateLimiterPort` e idempotencia sobre Redis u otro store compartido.

### Resend SMTP

El adaptador SMTP ya es compatible con Resend. Verificá el dominio remitente en Resend y creá una API key con permiso `sending_access`; nunca la pegues en el código ni en el chat. Configurá `smtp.resend.com`, puerto `465`, usuario `resend`, `SMTP_SECURE=true` y la API key como `SMTP_PASSWORD` en el secreto del entorno. Cada email lleva una clave de idempotencia derivada del `submissionId` para evitar duplicados.

## Prelaunch → launched

Cambiá solamente:

```dotenv
SITE_MODE=launched
```

Los CTA, el copy del formulario y la conversión cambian de `Sumarme al lanzamiento` / `LAUNCH_SIGNUP` a `Probar gratis 15 días` / `TRIAL_START`. No hay páginas duplicadas.

## SEO

- Canonical, OpenGraph y Twitter derivan de `PUBLIC_SITE_URL`.
- `robots.txt` y `sitemap.xml` se generan en runtime con el dominio configurado. El sitemap deriva las guías desde `src/config/guides.ts` y publica su fecha de actualización.
- La home incluye `SoftwareApplication`; todas las páginas incluyen `Organization` y `WebSite`; las guías suman `Article` y `BreadcrumbList`. No se publican ratings, reviews ni métricas inventadas.
- Privacidad, términos y 404 tienen `noindex`.
- `lang="es-AR"`, un único H1 real, landmarks, skip link y headings semánticos.

Para cambiar dominio o metadata, actualizá environment y los valores centrales de `src/pages/index.astro`; no hardcodees dominios en componentes. Para crear una guía, sumala al catálogo tipado de `src/config/guides.ts`: la ruta, el índice, los enlaces relacionados y el sitemap se actualizan juntos.

Después de cada publicación, enviá `https://stocktech.com.ar/sitemap.xml` en Google Search Console y revisá las URLs nuevas con Inspección de URL. Search Console es la fuente de impresiones, consultas, CTR y posición; Cloudflare y GA4 complementan esa información con visitas y conversiones.

## Diseño y contenido

Fuente de verdad, en este orden:

1. `Web Comercial StockTech v2.1.dc.html`.
2. README V2.1 entregado con el diseño.
3. Referencias del producto existente.

Las fuentes Bricolage Grotesque, Inter e IBM Plex Mono se self-hostean desde el bundle y sólo se incluyen en los pesos usados. El ticket dentado se conserva como recurso de identidad.

### Producto real

- Dashboard y login de las referencias Angular son pantallas reales.
- La navegación real confirmada incluye Inicio, Configuración, Usuarios y Facturación.

### Recursos visuales

- Ticket/POS del hero.
- Flujo stock → venta → pago → caja → factura.
- Contingencia offline.
- Ticket ARCA.
- La demo y la foto de EzeTech se presentan como **Próximamente** hasta contar con los materiales reales.

No hay video, foto ni capturas productivas en los materiales entregados.

## Seguridad y operación

Node emite CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `frame-ancestors`. Nginx administra proxy, body limit, timeouts, compresión y cache. No se configura CORS wildcard.

Health checks:

- `GET /health/live`: proceso vivo.
- `GET /health/ready`: configuración válida y aplicación lista; no envía email ni consulta terceros.

Los logs son JSON y evitan payloads completos, passwords, cookies y tokens. Para leads se registran IDs de correlación y variante.

## Legal

`/privacidad` y `/terminos` incorporan el responsable, domicilio, finalidad, destinatarios operativos, consentimiento, conservación, derechos y jurisdicción desde configuración. Cada lead guarda la versión de política que aceptó. Antes de publicar, una revisión profesional debe confirmar esos datos, la necesidad de inscripción en el Registro Nacional de Bases de Datos y la redacción final.

## Validación

Los resultados ejecutados están en `QA-REPORT.md`, incluidos Lighthouse mobile productivo y las E2E Chromium desktop/mobile. La revisión visual manual con el navegador integrado quedó bloqueada porque no había un navegador conectado en la sesión.
