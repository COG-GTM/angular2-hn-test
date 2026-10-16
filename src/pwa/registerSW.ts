import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
import { isRuntimeCachedUrl } from './runtime-cache';

export type RegisterSW = (options?: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>;

export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
export const IN_FLIGHT_WINDOW_MS = 60 * 1000;

type Logger = Pick<Console, 'info' | 'error'>;
type IsCached = (url: string) => Promise<boolean>;

const isInCacheStorage: IsCached = (url) =>
    typeof caches === 'undefined'
        ? Promise.resolve(false)
        : caches.match(url).then(
              (response) => response !== undefined,
              () => false
          );

export function warmRuntimeCache(
    entries: PerformanceEntryList,
    fetchFn: typeof fetch = fetch,
    warmed = new Set<string>(),
    isCached: IsCached = isInCacheStorage
) {
    const urls = [...new Set(entries.map((entry) => entry.name))].filter(
        (url) => isRuntimeCachedUrl(url, location.origin) && !warmed.has(url)
    );
    urls.forEach((url) => warmed.add(url));
    return Promise.allSettled(
        urls.map(async (url) => {
            if (!(await isCached(url))) {
                await fetchFn(url);
            }
        })
    );
}

// When a new SW takes control (first visit, or upgrade from an older SW without the runtime
// routes), the page's API/asset requests already went past it, so they are missing from its
// runtime caches and the page fails offline. Request them again through the new SW, including
// the ones still in flight at that moment, unless they are already cached.
export function warmRuntimeCacheOnControl(fetchFn: typeof fetch = fetch, isCached: IsCached = isInCacheStorage) {
    navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
            const controlledAt = performance.now();
            const warmed = new Set<string>();
            const startedBeforeControl = (entries: PerformanceEntryList) =>
                entries.filter((entry) => entry.startTime < controlledAt);

            void warmRuntimeCache(
                startedBeforeControl(performance.getEntriesByType('resource')),
                fetchFn,
                warmed,
                isCached
            );
            if (typeof PerformanceObserver === 'undefined') {
                return;
            }
            const observer = new PerformanceObserver(
                (list) => void warmRuntimeCache(startedBeforeControl(list.getEntries()), fetchFn, warmed, isCached)
            );
            observer.observe({ type: 'resource' });
            setTimeout(() => observer.disconnect(), IN_FLIGHT_WINDOW_MS);
        },
        { once: true }
    );
}

// The SW auto-updates (skipWaiting + clientsClaim); long-lived tabs also poll for a new SW.
export function registerServiceWorker(
    register: RegisterSW,
    { updateCheckIntervalMs = UPDATE_CHECK_INTERVAL_MS, logger = console as Logger } = {}
) {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
        return undefined;
    }
    warmRuntimeCacheOnControl();
    return register({
        immediate: true,
        onRegisteredSW(_swUrl, registration) {
            if (!registration) {
                return;
            }
            setInterval(() => {
                if (registration.installing || !navigator.onLine) {
                    return;
                }
                registration.update().catch((error: unknown) => logger.error('Service worker update failed', error));
            }, updateCheckIntervalMs);
        },
        onOfflineReady() {
            logger.info('App is ready to work offline.');
        },
        onRegisterError(error: unknown) {
            logger.error('Service worker registration failed', error);
        },
    });
}
