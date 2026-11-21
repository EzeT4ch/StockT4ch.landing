// Genera public/social-card.png (1200x630) desde scripts/social-card.html.
// WhatsApp y Facebook no muestran og:image en SVG, por eso el PNG se versiona.
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(resolve('scripts/social-card.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/social-card.png', type: 'png' });
await browser.close();
