import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { SettingsProvider } from '../context/SettingsContext';

interface RenderOptions {
    /** Initial URL, e.g. `/news/2`. */
    route?: string;
    /** Route pattern to mount `ui` under so `useParams` works, e.g. `/news/:page`. */
    path?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/', path }: RenderOptions = {}) {
    return render(
        <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SettingsProvider>
                {path ? (
                    <Routes>
                        <Route path={path} element={ui} />
                    </Routes>
                ) : (
                    ui
                )}
            </SettingsProvider>
        </MemoryRouter>
    );
}

type Responder = (url: string) => { status?: number; body: unknown } | undefined;

/**
 * Stubs global fetch (unfetch is routed to it in setup.ts) with a URL -> JSON responder.
 * Unmatched URLs return 404. To hold a request open, stub fetch yourself with a gated promise.
 */
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
