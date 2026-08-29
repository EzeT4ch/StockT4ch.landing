import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://127.0.0.1:4322/health/live',
    // La suite debe probar el build que acaba de generar; reutilizar un servidor
    // local puede ocultar regresiones o apuntar a una versión anterior.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { ...process.env, CI: '1', HOST: '127.0.0.1', PORT: '4322' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
