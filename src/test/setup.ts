import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement matchMedia or scrollTo; provide stubs so
// components/hooks that use them (e.g. SettingsContext theme detection,
// Feed/ItemDetails scroll reset) can run under the test environment.
if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

window.scrollTo = vi.fn();

afterEach(() => {
    cleanup();
    localStorage.clear();
});
