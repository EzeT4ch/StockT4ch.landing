import { expect, test } from '@playwright/test';

const LAUNCHED_URL = 'http://127.0.0.1:4324';
const APP = 'https://app.stocktech.test';

test.describe('sitio lanzado', () => {
  test('todos los CTA de prueba llevan a /register y Ingresar a /login', async ({ page }) => {
    await page.goto(`${LAUNCHED_URL}/`);
    const placements = ['header', 'mobile_nav', 'hero', 'detras', 'sticky_mobile'];
    for (const placement of placements) {
      await expect(page.locator(`[data-track="CTA_CLICK"][data-placement="${placement}"]`), placement).toHaveAttribute('href', `${APP}/register`);
    }
    const plans = page.locator('[data-track="PLAN_CLICK"]');
    await expect(plans).toHaveCount(3);
    for (const link of await plans.all()) await expect(link).toHaveAttribute('href', `${APP}/register`);
    for (const link of await page.getByRole('link', { name: /^Probar( 15 días)? gratis$/ }).all()) await expect(link).toHaveAttribute('href', `${APP}/register`);
    for (const link of await page.getByRole('link', { name: 'Ingresar', includeHidden: true }).all()) await expect(link).toHaveAttribute('href', `${APP}/login`);
    await expect(page.getByRole('link', { name: 'Ingresar', includeHidden: true })).toHaveCount(2);
  });

  test('no muestra el pre-lanzamiento', async ({ page }) => {
    for (const path of ['/', '/terminos', '/privacidad']) {
      const html = await (await page.request.get(`${LAUNCHED_URL}${path}`)).text();
      expect(html, path).not.toMatch(/cliente(s)? fundador|lanzamiento|estimativ|pr[oó]ximamente|#fundadores/i);
    }
    await page.goto(`${LAUNCHED_URL}/`);
    await expect(page.locator('#fundadores')).toHaveCount(0);
  });

  test('el formulario de contacto sigue enviando y no habla de lanzamiento', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'x-real-ip': `e2e-${crypto.randomUUID()}` });
    await page.goto(`${LAUNCHED_URL}/`);
    const shell = page.locator('[data-lead-shell]');
    expect(await shell.innerText()).not.toMatch(/lanzamiento|lista de espera/i);
    await page.locator('#nombre').fill('Martina Gómez');
    await page.locator('#comercio').fill('Almacén Belgrano');
    await page.locator('#rubro').fill('Almacén');
    await page.locator('#whatsapp').fill('11 5555 5555');
    await page.locator('#email').fill('martina@example.com');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Quiero que me contacten' }).click();
    await expect(page.getByRole('heading', { name: 'Listo, quedaste anotado' })).toBeVisible();
    await expect(page.locator('[data-lead-success]')).not.toContainText(/lanzamiento|abramos el acceso/i);
  });

  test('Detrás de StockTech muestra la foto, el nombre, el rol y la frase', async ({ page }) => {
    await page.goto(`${LAUNCHED_URL}/`);
    const section = page.locator('#detras');
    const image = section.getByRole('img', { name: 'Ezequiel Benitez, Fundador de StockTech' });
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute('width', /\d+/);
    await expect(image).toHaveAttribute('height', /\d+/);
    await expect(image).toHaveAttribute('loading', 'lazy');
    expect(await image.getAttribute('src')).toMatch(/\.(webp|avif)(\?|$)/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(section).toContainText('Ezequiel Benitez');
    await expect(section).toContainText('Fundador de StockTech');
    await expect(section).toContainText('Los sistemas en favor de la productividad');
  });

  test('las tarjetas y el JSON-LD usan los precios configurados', async ({ page }) => {
    await page.goto(`${LAUNCHED_URL}/`);
    const cards = page.locator('.price-card .price strong');
    await expect(cards).toHaveCount(3);
    await expect(page.locator('#precios')).not.toContainText(/fundador|estimativ/i);
    const ld = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.flatMap((node) => JSON.parse(node.textContent ?? '[]')));
    const app = ld.find((item: { '@type': string }) => item['@type'] === 'SoftwareApplication');
    expect(app.offers.map((offer: { price: string }) => offer.price)).toEqual(['34900', '54900', '89900']);
  });

  test('og:image es un PNG de 1200x630', async ({ page, request }) => {
    await page.goto(`${LAUNCHED_URL}/`);
    const url = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(url).toMatch(/\.png$/);
    const response = await request.get(`${LAUNCHED_URL}${new URL(url!).pathname}`);
    expect(response.headers()['content-type']).toContain('image/png');
    const body = await response.body();
    expect(body.readUInt32BE(16)).toBe(1200);
    expect(body.readUInt32BE(20)).toBe(630);
  });
});
