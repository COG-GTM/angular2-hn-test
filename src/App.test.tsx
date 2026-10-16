import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { baseUrl, userFallbackUrl } from './services/hackerNewsApi';
import { mockFetch, renderWithProviders } from './test/utils';
import { makeFeed, makeStory, makeUser } from './test/fixtures';

function mockApi() {
    return mockFetch((url) => {
        if (/\/(news|newest|show|ask|jobs)\?page=\d+$/.test(url)) return { body: makeFeed(3) };
        if (url === `${baseUrl}/item/7`) return { body: makeStory({ id: 7, title: 'Item seven', url: 'item?id=7' }) };
        if (url === `${userFallbackUrl}/user/pg.json`) return { body: makeUser() };
        return undefined;
    });
}

describe('App routes', () => {
    it('redirects / to /news/1', async () => {
        const fetchMock = mockApi();
        renderWithProviders(<App />, { route: '/' });
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/news?page=1`, undefined);
    });

    it.each(['news', 'newest', 'show', 'ask', 'jobs'])('renders the %s feed', async (feed) => {
        const fetchMock = mockApi();
        renderWithProviders(<App />, { route: `/${feed}/2` });
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/${feed}?page=2`, undefined);
    });

    it('lazy-loads the item route', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/item/7' });
        expect(await screen.findAllByText('Item seven')).toHaveLength(2);
    });

    it('lazy-loads the user route', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/user/pg' });
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    });

    it('renders the header navigation and footer', async () => {
        mockApi();
        renderWithProviders(<App />, { route: '/news/1' });
        for (const name of ['new', 'show', 'ask', 'jobs']) {
            expect(screen.getByRole('link', { name })).toBeInTheDocument();
        }
        expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
    });
});
