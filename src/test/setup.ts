import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { mediaListeners, mediaState } from './matchMedia';

// unfetch uses XMLHttpRequest; route it through the (stubbable) global fetch in tests.
vi.mock('unfetch', () => ({
    default: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init),
}));

beforeEach(() => {
    localStorage.clear();
    mediaListeners.length = 0;
    mediaState.matches = false;
    vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
            media: query,
            get matches() {
                return mediaState.matches;
            },
            addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => mediaListeners.push(cb),
            removeEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => {
                const i = mediaListeners.indexOf(cb);
                if (i >= 0) mediaListeners.splice(i, 1);
            },
        }))
    );
    vi.stubGlobal('scrollTo', vi.fn());
});

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});
