import { expect, test } from '@playwright/test';

test('home carga y navega', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main#contenido h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Una venta entra una vez/ })).toBeVisible();
  await page.getByRole('link', { name: 'Privacidad', exact: true }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
});

test('permite forzar variante A', async ({ page }) => {
  await page.goto('/?exp_hero=A');
  await expect(page.locator('main#contenido h1')).toHaveText(/desde un solo lugar/);
});

test('permite forzar variante B', async ({ page }) => {
  await page.goto('/?exp_hero=B');
  await expect(page.locator('main#contenido h1')).toHaveText(/sin saltar entre sistemas/);
});

test('valida y envía el formulario con provider de desarrollo', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-real-ip': `e2e-${crypto.randomUUID()}` });
  await page.goto('/');
  await page.getByRole('button', { name: 'Quiero probar StockTech' }).click();
  await expect(page.locator('#nombre')).toBeFocused();
  await page.locator('#nombre').fill('Martina Gómez');
  await page.locator('#comercio').fill('Almacén Belgrano');
  await page.locator('#rubro').fill('Almacén');
  await page.locator('#whatsapp').fill('11 5555 5555');
  await page.locator('#email').fill('martina@example.com');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Quiero probar StockTech' }).click();
  await expect(page.getByRole('heading', { name: 'Listo, quedaste anotado' })).toBeVisible();
});

test('legales y 404 conservan identidad', async ({ page }) => {
  await page.goto('/terminos'); await expect(page.getByRole('heading', { name: 'Términos y condiciones', exact: true })).toBeVisible();
  await page.goto('/ruta-inexistente'); await expect(page.getByRole('heading', { name: 'Esta página no existe', exact: true })).toBeVisible();
});

test('mobile no tiene overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await expect(page.locator('.mobile-sticky')).toBeVisible();
});

const APP_LINKS_URL = 'http://127.0.0.1:4323';

test.describe('botones al producto', () => {
  test('escritorio: Ingresar y Registrarse apuntan a la app', async ({ page, isMobile }) => {
    test.skip(isMobile, 'escritorio');
    await page.goto(`${APP_LINKS_URL}/`);
    const nav = page.locator('header.site-header .header-inner');
    await expect(nav.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', 'https://app.stocktech.test/login');
    await expect(nav.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', 'https://app.stocktech.test/register');
  });

  test('mobile: el menú tiene Ingresar y Registrarse', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile');
    await page.goto(`${APP_LINKS_URL}/`);
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const menu = page.locator('#mobile-menu');
    await expect(menu.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', 'https://app.stocktech.test/login');
    await expect(menu.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', 'https://app.stocktech.test/register');
  });

  test('con el flag en false no hay links a la app', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="https://app.stocktech.test"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Ingresar' })).toHaveCount(0);
  });
});
