import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { SettingsProvider } from '../context/SettingsContext';

export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SettingsProvider>{ui}</SettingsProvider>
        </MemoryRouter>
    );
}

type Responder = (url: string) => { status?: number; body: unknown } | undefined;

/** Stubs global fetch (used by unfetch) with a URL -> JSON responder. Unmatched URLs return 404. */
export function mockFetch(responder: Responder) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const res = responder(url);
        const status = res?.status ?? (res ? 200 : 404);
        const text = res ? JSON.stringify(res.body) : 'Not found';
        return new Response(text, { status, headers: { 'Content-Type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}
