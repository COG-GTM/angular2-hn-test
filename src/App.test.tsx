import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { App } from './App';
import { mockFetch } from './test/utils';
import { makeFeed, makeStory } from './test/fixtures';

function LocationProbe() {
    return <span data-testid="location">{useLocation().pathname}</span>;
}

function renderApp(route: string) {
    return render(
        <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SettingsProvider>
                <App />
                <LocationProbe />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('App route table (mirrors Angular app.routes.ts)', () => {
    it('redirects / to /news/1', async () => {
        mockFetch((url) => (url.includes('/news?page=1') ? { body: makeFeed(1) } : undefined));
        renderApp('/');
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/news/1'));
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('/%s/:page fetches that feed and page', async (feed) => {
        const fetchMock = mockFetch((url) =>
            url === `https://node-hnapi.herokuapp.com/${feed}?page=2` ? { body: makeFeed(1) } : undefined
        );
        renderApp(`/${feed}/2`);
        await waitFor(() =>
            expect(fetchMock).toHaveBeenCalledWith(`https://node-hnapi.herokuapp.com/${feed}?page=2`, undefined)
        );
    });

    it('/item/:id lazy-loads item details', async () => {
        const fetchMock = mockFetch((url) =>
            url.endsWith('/item/8863') ? { body: makeStory({ id: 8863, title: 'Dropbox' }) } : undefined
        );
        renderApp('/item/8863');
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/8863', undefined));
    });

    it('/user/:id lazy-loads the user profile', async () => {
        const fetchMock = mockFetch((url) =>
            url.endsWith('/user/pg.json') ? { body: { id: 'pg', karma: 1, created: 'x', about: '' } } : undefined
        );
        renderApp('/user/pg');
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('https://api.hnpwa.com/v0/user/pg.json', undefined));
    });
});
