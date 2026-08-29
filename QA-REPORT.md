# QA — StockTech Web Comercial V2.1

Última verificación: 2026-08-26

## Resultado

| Verificación | Resultado |
| --- | --- |
| `npm run check` | Pasa, 0 errores y 0 warnings |
| `npm run build` | Pasa, Node standalone generado |
| `npm test` | 24/24 tests pasan |
| `npm run test:e2e` | 12/12 tests pasan en Chromium desktop y Pixel 5; la suite crea su propio servidor desde el build actual |
| Lighthouse mobile productivo | Performance 93 · Accessibility 100 · Best Practices 100 · SEO 100 |
| Auditoría npm | 0 vulnerabilidades reportadas |

Las E2E cubren carga de home, H1 único dentro de `main`, overrides A/B, validación y submit exitoso, navegación, legales, 404 y overflow horizontal en 375px.

## Responsive

La CSS implementa los breakpoints congelados de 640px y 900px y fue comprobada automáticamente en desktop y viewport móvil de 375px. La estructura contempla 430, 768, 1024 y 1440 mediante grids fluidos y `clamp()`.

No se pudo realizar la inspección visual manual en el navegador integrado porque la sesión no tenía navegadores conectados. Esto no se presenta como validado visualmente; debe hacerse una pasada humana final en 375, 430, 768, 1024 y 1440 antes del deploy.

## Accesibilidad

- Labels y errores asociados por `aria-describedby`.
- `aria-invalid` y foco al primer campo inválido.
- Radios dentro de `fieldset`/`legend`.
- Estados success/error con roles semánticos.
- Focus visible global.
- Targets principales de 44px o más.
- Un H1 de contenido por página.
- Skip link y landmarks.
- `prefers-reduced-motion` detiene timers y muestra el estado final.

Pendiente recomendado: auditoría manual con teclado y lector de pantalla, más Lighthouse/Axe sobre el dominio de preproducción.

## Performance y Lighthouse

- Sin React/Vue ni hidratación global.
- Fuentes self-hosted y pesos acotados.
- Sin video eager ni imágenes sin dimensiones.
- Animaciones pequeñas, pausadas fuera de viewport.
- Assets hash con cache immutable; HTML dinámico sin cache compartida.

Lighthouse 13 se ejecutó sobre el proceso Node standalone generado por `npm run build`, con emulación mobile:

- Performance: **93**.
- Accessibility: **100**.
- Best Practices: **100**.
- SEO: **100**.
- FCP: 2,1 s.
- LCP: 2,3 s.
- CLS: 0,095.
- TBT: 0 ms.

Reportes: `reports/lighthouse-mobile.report.html` y `reports/lighthouse-mobile.report.json`.

La CLI terminó con un error `EPERM` al intentar borrar su directorio temporal de Windows después de escribir ambos reportes. Los JSON/HTML se generaron completos y los puntajes anteriores se extrajeron del JSON final. El error de limpieza no afectó la auditoría.

## Seguridad y datos

- Secrets sólo server-side.
- Configuración productiva fail-fast.
- CSP y headers defensivos.
- Body máximo 32 KiB.
- Zod strict, consentimiento expreso, honeypot, longitudes, normalización, rate limit e idempotencia.
- Timeout SMTP y respuesta genérica.
- Logs estructurados sin payload completo ni credenciales.

Limitación documentada: rate limit e idempotencia viven en memoria y requieren un store compartido al usar más de una instancia.

## Desviaciones mínimas respecto de V2.1

1. Legales y 404 conservan estructura/copy pero usan tokens V2.1, porque sus prototipos traían Manrope y paleta azul histórica prohibida.
2. El claim de continuidad en seguridad se acotó a “podés registrar ventas de contingencia” para no prometer funciones dependientes de conexión.
3. `reduced-motion` muestra el estado final real (incluido el sello ARCA) y los timers se pausan fuera de viewport; el prototipo no lo hacía correctamente.
4. Se agregaron metadata social completa, headers, sitemap/robots, health, consentimiento técnico y formularios productivos sin cambiar la composición.
5. Las cuatro guías SEO pendientes usan un layout editorial simple con contenido limitado a capacidades confirmadas; no alteran la landing.

## Antes de producción

- Completar dominio, app URL, email, WhatsApp, datos del responsable legal y SMTP/Resend reales.
- Integrar la UI/gestor definitivo de consentimiento.
- Revisión legal profesional.
- Confirmar características por plan y claims de backups/auditoría.
- Reemplazar foto/demo/mockups cuando existan assets reales.
- Ejecutar QA visual manual y repetir Lighthouse en preproducción detrás de Nginx/TLS.
