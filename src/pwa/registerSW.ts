import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
import { isRuntimeCachedUrl } from './runtime-cache';

export type RegisterSW = (options?: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>;

export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
export const IN_FLIGHT_WINDOW_MS = 60 * 1000;

type Logger = Pick<Console, 'info' | 'error'>;

export function warmRuntimeCache(
    entries: PerformanceEntryList,
    fetchFn: typeof fetch = fetch,
    warmed = new Set<string>()
) {
    const urls = [...new Set(entries.map((entry) => entry.name))].filter(
        (url) => isRuntimeCachedUrl(url, location.origin) && !warmed.has(url)
    );
    urls.forEach((url) => warmed.add(url));
    return Promise.allSettled(urls.map((url) => fetchFn(url)));
}

// First visit: the API/asset requests start before the new SW controls the page, so they never
// reach its runtime caches and the landing page fails offline. Once the SW takes control,
// request them again through it, including the ones still in flight at that moment.
export function warmRuntimeCacheOnFirstControl(fetchFn: typeof fetch = fetch) {
    navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
            const controlledAt = performance.now();
            const warmed = new Set<string>();
            const startedBeforeControl = (entries: PerformanceEntryList) =>
                entries.filter((entry) => entry.startTime < controlledAt);

            void warmRuntimeCache(startedBeforeControl(performance.getEntriesByType('resource')), fetchFn, warmed);
            if (typeof PerformanceObserver === 'undefined') {
                return;
            }
            const observer = new PerformanceObserver(
                (list) => void warmRuntimeCache(startedBeforeControl(list.getEntries()), fetchFn, warmed)
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
    if (!navigator.serviceWorker.controller) {
        warmRuntimeCacheOnFirstControl();
    }
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
