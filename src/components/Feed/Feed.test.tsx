import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Feed } from './Feed';
import { baseUrl } from '../../services/hackerNewsApi';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeFeed } from '../../test/fixtures';

function renderFeed(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/news/:page" element={<Feed feedType="news" />} />
            <Route path="/jobs/:page" element={<Feed feedType="jobs" />} />
        </Routes>,
        { route }
    );
}

describe('Feed', () => {
    it('renders a page of stories with a More link', async () => {
        mockFetch((url) => (url === `${baseUrl}/news?page=1` ? { body: makeFeed(30) } : undefined));
        const { container } = renderFeed('/news/1');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findByText('Story 1')).toBeInTheDocument();
        expect(container.querySelectorAll('li.post')).toHaveLength(30);
        expect(container.querySelector('ol')).toHaveAttribute('start', '1');
        expect(screen.getByRole('link', { name: 'More ›' })).toHaveAttribute('href', '/news/2');
        expect(screen.queryByRole('link', { name: '‹ Prev' })).not.toBeInTheDocument();
    });

    it('paginates and numbers later pages', async () => {
        const user = userEvent.setup();
        mockFetch((url) => {
            if (url === `${baseUrl}/news?page=1`) return { body: makeFeed(30) };
            if (url === `${baseUrl}/news?page=2`) return { body: makeFeed(5, 31) };
            return undefined;
        });
        const { container } = renderFeed('/news/1');
        await user.click(await screen.findByRole('link', { name: 'More ›' }));

        expect(await screen.findByText('Story 31')).toBeInTheDocument();
        expect(screen.queryByText('Story 1')).not.toBeInTheDocument();
        expect(container.querySelector('ol')).toHaveAttribute('start', '31');
        expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1');
        expect(screen.queryByRole('link', { name: 'More ›' })).not.toBeInTheDocument();
    });

    it('shows the jobs banner on the jobs feed', async () => {
        mockFetch(() => ({ body: makeFeed(2) }));
        renderFeed('/jobs/1');
        expect(await screen.findByText(/funded by Y Combinator/)).toBeInTheDocument();
    });

    it('shows an error when the feed request fails', async () => {
        mockFetch(() => ({ status: 503, body: {} }));
        renderFeed('/news/1');
        expect(await screen.findByText('Could not load news stories.')).toBeInTheDocument();
    });

    it('rejects non-numeric pages without fetching', () => {
        const fetchMock = mockFetch(() => ({ body: [] }));
        renderFeed('/news/abc');
        expect(screen.getByText('Could not load news stories.')).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
