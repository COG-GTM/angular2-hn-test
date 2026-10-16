// Let context.route see requests made by the service worker (offline/PWA tests).
process.env.PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS = '1';

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const DEVIN_CHROME_DIR = '/opt/.devin/chrome/chrome';
// Inside node_modules so test output never needs a .gitignore entry.
const OUTPUT_DIR = 'node_modules/.cache/playwright';

// Uses the machine's Chrome when `npx playwright install` isn't available (not in CI).
function systemChrome(): string | undefined {
    if (process.env.PLAYWRIGHT_CHROME_PATH) {
        return process.env.PLAYWRIGHT_CHROME_PATH;
    }
    if (process.env.CI || !existsSync(DEVIN_CHROME_DIR)) {
        return undefined;
    }
    return readdirSync(DEVIN_CHROME_DIR)
        .filter((dir) => dir.startsWith('linux-'))
        .map((dir) => join(DEVIN_CHROME_DIR, dir, 'chrome-linux64', 'chrome'))
        .find((path) => existsSync(path));
}

export default defineConfig({
    testDir: './e2e',
    outputDir: `${OUTPUT_DIR}/test-results`,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [['github'], ['html', { open: 'never', outputFolder: `${OUTPUT_DIR}/report` }]] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
        // Once a SW controls the page its fetches skip page.route mocks; PWA tests opt back in.
        serviceWorkers: 'block',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: systemChrome() } },
        },
    ],
    // Production build: the service worker only exists after `vite build`.
    webServer: {
        command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
    },
});
