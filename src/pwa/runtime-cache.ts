// What the service worker caches at runtime (vite.config.ts builds its Workbox routes from these).

// HN APIs: NetworkFirst, so pages visited online still render offline.
export const API_CACHES = [
    { origin: 'https://node-hnapi.herokuapp.com', cacheName: 'hn-api', maxEntries: 200 },
    { origin: 'https://api.hnpwa.com', cacheName: 'hnpwa-api', maxEntries: 100 },
] as const;

export const API_NETWORK_TIMEOUT_SECONDS = 5;

// Same-origin static files that aren't precached (icons, images, fonts): CacheFirst, like the
// Angular ngsw `assets` group (installMode lazy). Same-origin only: Workbox RegExp routes only
// match cross-origin URLs from the first character.
export const STATIC_ASSET_PATTERN = /\.(?:eot|svg|cur|jpe?g|png|webp|gif|otf|ttf|woff2?|ani|ico)$/;
export const STATIC_ASSET_CACHE = 'assets';

export function isRuntimeCachedUrl(url: string, appOrigin: string) {
    if (API_CACHES.some(({ origin }) => url.startsWith(`${origin}/`))) {
        return true;
    }
    const parsed = new URL(url, appOrigin);
    return parsed.origin === appOrigin && STATIC_ASSET_PATTERN.test(parsed.pathname);
}
