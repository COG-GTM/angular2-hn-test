import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { HN_API, mockApi, story } from './fixtures';

const FEED_URL = `${HN_API}/news?page=1`;
const ITEM_URL = `${HN_API}/item/${story.id}`;

test.use({ serviceWorkers: 'allow' });

async function waitForServiceWorkerControl(page: Page) {
    await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            await new Promise((resolve) =>
                navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
            );
        }
    });
}

// setOffline doesn't cover the SW's own fetches and route mocks keep answering while offline,
// so replace the mocks with a route that fails every request (SW fetches included).
async function goOffline(context: BrowserContext) {
    await context.unrouteAll({ behavior: 'ignoreErrors' });
    await context.route('**/*', (route) => route.abort('internetdisconnected'));
    await context.setOffline(true);
}

function isCached(page: Page, cacheName: string, url: string) {
    return page.evaluate(async ([name, u]) => !!(await (await caches.open(name)).match(u)), [cacheName, url] as const);
}

const visibleTitle = (page: Page, title: string) => page.getByText(title).filter({ visible: true }).first();

test('precache has no duplicate URLs', async ({ page }) => {
    const sw = await (await page.request.get('/sw.js')).text();
    const urls = [...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]);
    expect(urls).toContain('index.html');
    expect(urls).toContain('manifest.webmanifest');
    expect(urls).not.toContain('ngsw-worker.js');
    expect(new Set(urls).size).toBe(urls.length);
});

test('first visit: app shell, deep links and visited API responses work offline', async ({ context, page }) => {
    // Slow enough that the first feed request is still in flight when the SW takes control.
    await mockApi(context, { latencyMs: 1500 });

    await page.goto('/news/1');
    await expect(visibleTitle(page, `${story.title} (news)`)).toBeVisible();
    await waitForServiceWorkerControl(page);

    // The feed request started before the SW took control; registerSW re-requests it through the SW.
    await expect.poll(() => isCached(page, 'hn-api', FEED_URL), { timeout: 15_000 }).toBe(true);
    // Visit the item page client-side (through the SW) so its response is cached too.
    await page
        .getByRole('link', { name: /1 comment/ })
        .first()
        .click();
    await expect(page).toHaveURL(new RegExp(`/item/${story.id}$`));
    await expect(visibleTitle(page, story.title)).toBeVisible();
    await page.goBack();
    await expect(visibleTitle(page, `${story.title} (news)`)).toBeVisible();

    await goOffline(context);

    const reload = await page.reload();
    expect(reload?.fromServiceWorker()).toBe(true);
    await expect(visibleTitle(page, `${story.title} (news)`)).toBeVisible();
    await expect(page.locator('a.home-link img')).toHaveJSProperty('complete', true);
    await expect(page).toHaveTitle('Angular 2 HN');

    // Deep link never loaded as a document: navigateFallback serves index.html, lazy chunk from precache.
    const deepLink = await page.goto(`/item/${story.id}`);
    expect(deepLink?.fromServiceWorker()).toBe(true);
    await expect(visibleTitle(page, story.title)).toBeVisible();
    expect(await isCached(page, 'hn-api', ITEM_URL)).toBe(true);

    // Pages never visited online have nothing cached and show the error state instead of hanging.
    await page.goto('/newest/1');
    await expect(page.getByText(`${story.title} (newest)`)).toHaveCount(0);

    // Route params containing a dot are app routes, not static files: they still get the app shell.
    const dottedUser = await page.goto('/user/some.name');
    expect(dottedUser?.fromServiceWorker()).toBe(true);
    await expect(page.locator('a.home-link')).toBeVisible();
});

test('serves a single installable web app manifest', async ({ page }) => {
    await page.goto('/news/1');
    const links = page.locator('link[rel="manifest"]');
    await expect(links).toHaveCount(1);
    expect(await links.getAttribute('href')).toBe('/manifest.webmanifest');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#b92b27');
    expect((await page.request.get('/manifest.json')).headers()['content-type']).toContain('text/html');

    const manifest = await (await page.request.get('/manifest.webmanifest')).json();
    expect(manifest).toMatchObject({
        name: 'Angular 2 HN',
        short_name: 'Angular 2 HN',
        theme_color: '#b92b27',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './?utm_source=web_app_manifest',
    });
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual([
        '144x144',
        '192x192',
        '256x256',
        '512x512',
    ]);
    for (const icon of manifest.icons) {
        const res = await page.request.get(icon.src);
        expect(res.ok()).toBe(true);
        expect(res.headers()['content-type']).toBe('image/png');
    }
});

test('ngsw-worker.js retires a previously installed Angular service worker', async ({ context, page }) => {
    await mockApi(context);
    await page.goto('/');
    await waitForServiceWorkerControl(page);

    // Simulate a returning Angular visitor: ngsw caches plus a registration for /ngsw-worker.js.
    // The safety worker reloads the page once it has cleaned up.
    const reloaded = page.waitForEvent('load');
    await page.evaluate(async () => {
        await (await caches.open('ngsw:/:db:control')).put('/x', new Response('x'));
        void navigator.serviceWorker.register('/ngsw-worker.js');
    });
    await reloaded;

    await expect
        .poll(() => page.evaluate(async () => (await caches.keys()).filter((key) => key.startsWith('ngsw:'))))
        .toEqual([]);
    // The reloaded page registers the React SW again.
    await expect
        .poll(() =>
            page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.scriptURL ?? '')
        )
        .toMatch(/\/sw\.js$/);
});
