import { describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Feed } from './Feed';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeFeed, makeStory } from '../../test/fixtures';

const API = 'https://node-hnapi.herokuapp.com';

function renderFeed(route: string, feedType: 'news' | 'jobs' = 'news') {
    return renderWithProviders(<Feed feedType={feedType} />, { route, path: `/${feedType}/:page` });
}

describe('Feed', () => {
    it('shows the loader while fetching, then the list with numbering from 1 and only "More ›" on page 1', async () => {
        mockFetch((url) => (url === `${API}/news?page=1` ? { body: makeFeed(30) } : undefined));
        const { container } = renderFeed('/news/1');
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        expect(await screen.findAllByText('Story 1')).not.toHaveLength(0);
        const list = container.querySelector('ol')!;
        expect(list).toHaveAttribute('start', '1');
        expect(list).toHaveClass('list-margin');
        expect(list.querySelectorAll('li.post')).toHaveLength(30);
        expect(screen.queryByText(/Prev/)).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/2');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('numbers from (page-1)*30+1, links "‹ Prev" back, and hides "More ›" when fewer than 30 items came back', async () => {
        mockFetch((url) => (url === `${API}/news?page=3` ? { body: makeFeed(12, 61) } : undefined));
        const { container } = renderFeed('/news/3');

        expect(await screen.findAllByText('Story 61')).not.toHaveLength(0);
        expect(container.querySelector('ol')).toHaveAttribute('start', '61');
        expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/2');
        expect(screen.queryByText(/More/)).not.toBeInTheDocument();
    });

    it('shows both pagination links in the middle of a feed', async () => {
        mockFetch((url) => (url === `${API}/news?page=2` ? { body: makeFeed(30, 31) } : undefined));
        renderFeed('/news/2');

        expect(await screen.findByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: /More/ })).toHaveAttribute('href', '/news/3');
    });

    it.each(['abc', '0', '-1', '1.5'])('shows the error state (not an endless loader) for page "%s" without fetching', (page) => {
        const fetchMock = mockFetch(() => ({ body: makeFeed(30) }));
        renderFeed(`/news/${page}`);

        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows the Angular error message when the request fails', async () => {
        mockFetch(() => ({ status: 500, body: { error: 'boom' } }));
        renderFeed('/jobs/1', 'jobs');

        expect(await screen.findByText('Could not load jobs stories.')).toBeInTheDocument();
    });

    it('renders the jobs header without list-margin and hides user/points/comments on job items', async () => {
        const job = makeStory({ id: 7, title: 'Acme is hiring', type: 'job', user: 'acme', points: 0 });
        mockFetch((url) => (url === `${API}/jobs?page=1` ? { body: [job] } : undefined));
        const { container } = renderFeed('/jobs/1', 'jobs');

        expect(await screen.findByText(/These are jobs at startups that were funded by Y Combinator/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute('href', 'https://triplebyte.com/?ref=yc_jobs');
        expect(container.querySelector('ol')).not.toHaveClass('list-margin');
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(screen.queryByText(/discuss|comment/)).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'acme' })).not.toBeInTheDocument();
    });

    it('does not show the jobs header on other feeds', async () => {
        mockFetch(() => ({ body: makeFeed(2) }));
        renderFeed('/news/1');

        await screen.findAllByText('Story 1');
        expect(screen.queryByText(/funded by Y Combinator/)).not.toBeInTheDocument();
    });

    it('never shows the previous page while the next page is loading, and ignores late responses', async () => {
        const gates: Record<string, (body: unknown) => void> = {};
        vi.stubGlobal(
            'fetch',
            vi.fn(
                (input: RequestInfo | URL) =>
                    new Promise<Response>((resolve) => {
                        gates[String(input)] = (body) => resolve(new Response(JSON.stringify(body), { status: 200 }));
                    })
            )
        );
        renderFeed('/news/1');
        await act(async () => gates[`${API}/news?page=1`](makeFeed(30)));
        expect(await screen.findAllByText('Story 1')).not.toHaveLength(0);

        vi.mocked(window.scrollTo).mockClear();
        await userEvent.click(screen.getByRole('link', { name: /More/ }));
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();

        await act(async () => gates[`${API}/news?page=2`](makeFeed(30, 31)));
        await waitFor(() => expect(screen.getAllByText('Story 31')).not.toHaveLength(0));
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();
    });
});
