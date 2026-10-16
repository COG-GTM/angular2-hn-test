import { describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ItemDetails } from './ItemDetails';
import { pollBarWidth } from './pollBarWidth';
import { SettingsProvider } from '../../context/SettingsContext';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeComment, makeStory } from '../../test/fixtures';

const API = 'https://node-hnapi.herokuapp.com';

function renderItem(id: string) {
    return renderWithProviders(<ItemDetails />, { route: `/item/${id}`, path: '/item/:id' });
}

function visibleTitle() {
    return screen.getAllByRole('link', { name: /./ }).find((el) => el.classList.contains('title'))!;
}

describe('ItemDetails', () => {
    it('shows the loader, then the story with title, domain, meta and comments', async () => {
        mockFetch((url) =>
            url === `${API}/item/1`
                ? {
                      body: makeStory({
                          id: 1,
                          title: 'Deep thread',
                          points: 99,
                          user: 'pg',
                          time_ago: '3 hours ago',
                          comments_count: 2,
                          comments: [makeComment({ id: 10, content: '<p>first</p>' }), makeComment({ id: 11, content: '<p>second</p>' })],
                      }),
                  }
                : undefined
        );
        renderItem('1');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(await screen.findByText('first')).toBeInTheDocument();
        expect(screen.getByText('second')).toBeInTheDocument();
        const titles = screen.getAllByRole('link', { name: 'Deep thread' });
        expect(titles).toHaveLength(2); // mobile + laptop variants
        titles.forEach((a) => expect(a).toHaveAttribute('href', 'https://example.com/post'));
        expect(screen.getByText('(example.com)')).toHaveClass('domain');
        // JSX keeps the space Angular rendered between the title and the domain.
        expect(titles[1].parentElement).toHaveTextContent('Deep thread (example.com)');
        const subtext = document.querySelector('.laptop .subtext') as HTMLElement;
        expect(subtext).toHaveTextContent('99 points by pg3 hours ago | 2 comments');
        expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg');
        expect(within(subtext).getByRole('link', { name: '2 comments' })).toHaveAttribute('href', '/item/1');
        expect(document.querySelector('.laptop')).toHaveClass('item-header');
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('opens external links in a new tab when the setting is on', async () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        mockFetch((url) => (url === `${API}/item/1` ? { body: makeStory({ id: 1, title: 'Ext' }) } : undefined));
        renderItem('1');
        const links = await screen.findAllByRole('link', { name: 'Ext' });
        links.forEach((a) => {
            expect(a).toHaveAttribute('target', '_blank');
            expect(a).toHaveAttribute('rel', 'noopener');
        });
    });

    it('links internal items (Ask HN) to /item/:id without a domain', async () => {
        mockFetch((url) =>
            url === `${API}/item/5`
                ? { body: makeStory({ id: 5, title: 'Ask HN: x', url: 'item?id=5', domain: '', content: '<p>Body text</p>' }) }
                : undefined
        );
        renderItem('5');
        const links = await screen.findAllByRole('link', { name: 'Ask HN: x' });
        links.forEach((a) => {
            expect(a).toHaveAttribute('href', '/item/5');
            expect(a).not.toHaveAttribute('target');
        });
        expect(document.querySelector('.domain')).toBeNull();
        expect(document.querySelector('.subject')).toHaveTextContent('Body text');
    });

    it('renders jobs without points/user/comments meta', async () => {
        mockFetch((url) =>
            url === `${API}/item/7`
                ? { body: makeStory({ id: 7, type: 'job', title: 'Acme is hiring', comments_count: 0, time_ago: '1 day ago' }) }
                : undefined
        );
        renderItem('7');
        await screen.findAllByRole('link', { name: 'Acme is hiring' });
        const subtext = document.querySelector('.laptop .subtext') as HTMLElement;
        expect(subtext).toHaveTextContent(/^1 day ago$/);
        expect(subtext.querySelector('.item-details')).toBeNull();
        expect(screen.queryByText(/points by/)).not.toBeInTheDocument();
        expect(document.querySelector('.laptop')).toHaveClass('item-header');
    });

    it('omits item-header on the laptop block for stories without comments', async () => {
        mockFetch((url) => (url === `${API}/item/8` ? { body: makeStory({ id: 8, comments_count: 0 }) } : undefined));
        renderItem('8');
        expect(await screen.findByText('discuss')).toBeInTheDocument();
        expect(document.querySelector('.laptop')).not.toHaveClass('item-header');
    });

    it('renders poll options with points and proportional bars', async () => {
        mockFetch((url) => {
            if (url === `${API}/item/100`) return { body: makeStory({ id: 100, type: 'poll', poll: [{}, {}] as never }) };
            if (url === `${API}/item/101`) return { body: { content: '<p>Option A</p>', points: 30 } };
            if (url === `${API}/item/102`) return { body: { content: '<p>Option B</p>', points: 10 } };
            return undefined;
        });
        renderItem('100');
        expect(await screen.findByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('30 points')).toBeInTheDocument();
        expect(screen.getByText('10 points')).toBeInTheDocument();
        const bars = document.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });

    it('renders 0% poll bars when nobody has voted', async () => {
        mockFetch((url) => {
            if (url === `${API}/item/200`) return { body: makeStory({ id: 200, type: 'poll', poll: [{}, {}] as never }) };
            if (url === `${API}/item/201` || url === `${API}/item/202`) return { body: { content: '<p>Opt</p>', points: 0 } };
            return undefined;
        });
        renderItem('200');
        await waitFor(() => expect(document.querySelectorAll('.pollBar')).toHaveLength(2));
        document.querySelectorAll<HTMLElement>('.pollBar').forEach((bar) => expect(bar.style.width).toBe('0%'));
        expect(pollBarWidth(5, 0)).toBe('0%');
        expect(pollBarWidth(1, 4)).toBe('25%');
    });

    it('shows the error state for an invalid id without fetching', async () => {
        const fetchMock = mockFetch(() => undefined);
        renderItem('abc');
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('shows the error state when the API fails', async () => {
        mockFetch(() => ({ status: 500, body: { error: 'boom' } }));
        renderItem('42');
        expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument();
    });

    it('sanitizes story text before rendering', async () => {
        mockFetch((url) =>
            url === `${API}/item/9`
                ? {
                      body: makeStory({
                          id: 9,
                          url: 'item?id=9',
                          content: '<p>hello</p><script>window.x=1</script><img src=x onerror="alert(1)">',
                      }),
                  }
                : undefined
        );
        renderItem('9');
        await waitFor(() => expect(document.querySelector('.subject')).toHaveTextContent('hello'));
        const subject = document.querySelector('.subject') as HTMLElement;
        expect(subject.querySelector('script, img')).toBeNull();
        expect(subject.innerHTML).not.toContain('onerror');
    });

    it('back button is a keyboard-operable span that navigates back', async () => {
        const user = userEvent.setup();
        mockFetch((url) => (url === `${API}/item/1` ? { body: makeStory({ id: 1, title: 'Back test' }) } : undefined));
        function Where() {
            return <span data-testid="where">{useLocation().pathname}</span>;
        }
        render(
            <MemoryRouter initialEntries={['/news/1', '/item/1']} initialIndex={1}>
                <SettingsProvider>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                        <Route path="/news/:page" element={<p>feed</p>} />
                    </Routes>
                    <Where />
                </SettingsProvider>
            </MemoryRouter>
        );
        const back = await screen.findByRole('button', { name: 'Go back' });
        expect(back.tagName).toBe('SPAN');
        expect(back).toHaveClass('back-button');
        back.focus();
        await user.keyboard('{Enter}');
        expect(screen.getByTestId('where')).toHaveTextContent('/news/1');
    });

    it('never shows the previous item while the next one loads', async () => {
        const user = userEvent.setup();
        let releaseSecond: () => void = () => {};
        const gate = new Promise<void>((resolve) => {
            releaseSecond = resolve;
        });
        const inner = mockFetch((url) => {
            if (url === `${API}/item/1`) return { body: makeStory({ id: 1, title: 'First item' }) };
            if (url === `${API}/item/2`) return { body: makeStory({ id: 2, title: 'Second item' }) };
            return undefined;
        });
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                if (String(input).endsWith('/item/2')) await gate;
                return inner(input);
            })
        );
        render(
            <MemoryRouter initialEntries={['/item/1']}>
                <SettingsProvider>
                    <Link to="/item/2">go to 2</Link>
                    <Routes>
                        <Route path="/item/:id" element={<ItemDetails />} />
                    </Routes>
                </SettingsProvider>
            </MemoryRouter>
        );
        await screen.findAllByRole('link', { name: 'First item' });
        await user.click(screen.getByRole('link', { name: 'go to 2' }));
        expect(screen.queryByRole('link', { name: 'First item' })).not.toBeInTheDocument();
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        await act(async () => releaseSecond());
        expect(await screen.findAllByRole('link', { name: 'Second item' })).toHaveLength(2);
        expect(visibleTitle()).toHaveTextContent('Second item');
    });
});
