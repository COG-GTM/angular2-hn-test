import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
import { registerServiceWorker, warmRuntimeCache, warmRuntimeCacheOnControl } from './registerSW';

const API = 'https://node-hnapi.herokuapp.com/news?page=1';
const entry = (name: string, startTime = 0) => ({ name, startTime }) as PerformanceEntry;

function stubServiceWorker(controller: object | null = null) {
    const target = new EventTarget();
    const sw = Object.assign(target, { controller });
    Object.defineProperty(navigator, 'serviceWorker', { value: sw, configurable: true });
    return sw;
}

afterEach(() => {
    // jsdom has no navigator.serviceWorker; remove the stub again.
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
    vi.useRealTimers();
});

describe('warmRuntimeCache', () => {
    it('re-requests runtime-cached URLs once each and skips everything else', async () => {
        const fetchFn = vi.fn<typeof fetch>(async () => new Response('[]'));
        const warmed = new Set<string>();
        await warmRuntimeCache(
            [
                entry(API),
                entry(API),
                entry(`${location.origin}/assets/assets-x.js`),
                entry('https://example.com/a.png'),
            ],
            fetchFn,
            warmed
        );
        await warmRuntimeCache(
            [entry(API), entry(`${location.origin}/assets/icons/favicon-16x16.png`)],
            fetchFn,
            warmed
        );
        expect(fetchFn.mock.calls.map(([url]) => url)).toEqual([
            API,
            `${location.origin}/assets/icons/favicon-16x16.png`,
        ]);
    });

    it('skips URLs that are already in the runtime cache', async () => {
        const fetchFn = vi.fn<typeof fetch>(async () => new Response('[]'));
        const user = 'https://api.hnpwa.com/v0/user/pg.json';
        await warmRuntimeCache([entry(API), entry(user)], fetchFn, new Set(), async (url) => url === API);
        expect(fetchFn.mock.calls.map(([url]) => url)).toEqual([user]);
    });

    it('does not reject when a request fails', async () => {
        const fetchFn = vi.fn<typeof fetch>(async () => Promise.reject(new Error('offline')));
        await expect(warmRuntimeCache([entry(API)], fetchFn)).resolves.toHaveLength(1);
    });
});

describe('warmRuntimeCacheOnControl', () => {
    beforeEach(() => {
        vi.stubGlobal('PerformanceObserver', undefined);
    });

    it('re-requests resources that started before the SW took control', async () => {
        const sw = stubServiceWorker();
        vi.spyOn(performance, 'now').mockReturnValue(100);
        vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
            entry(API, 10),
            entry('https://api.hnpwa.com/v0/user/pg.json', 150),
        ]);
        const fetchFn = vi.fn<typeof fetch>(async () => new Response('[]'));

        warmRuntimeCacheOnControl(fetchFn, async () => false);
        expect(fetchFn).not.toHaveBeenCalled();
        sw.dispatchEvent(new Event('controllerchange'));
        sw.dispatchEvent(new Event('controllerchange'));

        await vi.waitFor(() => expect(fetchFn).toHaveBeenCalled());
        expect(fetchFn.mock.calls.map(([url]) => url)).toEqual([API]);
    });
});

describe('registerServiceWorker', () => {
    it('warms the runtime cache when a new SW replaces an existing controller', async () => {
        vi.stubGlobal('PerformanceObserver', undefined);
        vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => new Response('[]')));
        const sw = stubServiceWorker({});
        vi.spyOn(performance, 'getEntriesByType').mockReturnValue([entry(API, 0)]);

        registerServiceWorker(vi.fn(() => async () => undefined));
        sw.dispatchEvent(new Event('controllerchange'));

        await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith(API));
    });

    it('does nothing without service worker support', () => {
        const register = vi.fn();
        expect(registerServiceWorker(register)).toBeUndefined();
        expect(register).not.toHaveBeenCalled();
    });

    it('registers immediately and polls for updates while online', () => {
        vi.useFakeTimers();
        stubServiceWorker({});
        const update = vi.fn(async () => undefined);
        const register = vi.fn<(options?: RegisterSWOptions) => () => Promise<void>>(() => async () => undefined);
        const logger = { info: vi.fn(), error: vi.fn() };

        registerServiceWorker(register, { updateCheckIntervalMs: 1000, logger });
        const options = register.mock.calls[0][0]!;
        expect(options.immediate).toBe(true);

        options.onRegisteredSW!('/sw.js', { installing: null, update } as unknown as ServiceWorkerRegistration);
        vi.advanceTimersByTime(1000);
        expect(update).toHaveBeenCalledTimes(1);

        vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
        vi.advanceTimersByTime(1000);
        expect(update).toHaveBeenCalledTimes(1);

        options.onOfflineReady!();
        expect(logger.info).toHaveBeenCalledWith('App is ready to work offline.');
        options.onRegisterError!(new Error('boom'));
        expect(logger.error).toHaveBeenCalledWith('Service worker registration failed', expect.any(Error));
    });
});
