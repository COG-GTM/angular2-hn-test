import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsProvider } from '../../context/SettingsContext';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeUser } from '../../test/fixtures';
import { UserProfile } from './UserProfile';

const userUrl = (id: string) => `https://api.hnpwa.com/v0/user/${id}.json`;

function LocationProbe() {
    return <span data-testid="location">{useLocation().pathname}</span>;
}

describe('UserProfile', () => {
    it('shows the loader, then the profile fields from HNPWA', async () => {
        const fetchMock = mockFetch((url) =>
            url === userUrl('pg')
                ? { body: makeUser({ id: 'pg', karma: 157316, created: '20 years ago', created_time: 1160418092 }) }
                : undefined
        );
        const { container } = renderWithProviders(<UserProfile />, { route: '/user/pg', path: '/user/:id' });

        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(await screen.findByText('157316 ★')).toBeInTheDocument();
        expect(container.querySelector('.main-details .name')).toHaveTextContent('pg');
        expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
        expect(container.querySelector('.title-block')).toHaveTextContent('Profile: pg');
        expect(container.querySelector('.other-details')).toHaveTextContent('Bug fixer.');
        expect(container.querySelector('.loader')).not.toBeInTheDocument();
        expect(fetchMock).toHaveBeenCalledWith(userUrl('pg'), undefined);
    });

    it('sanitizes the about HTML but keeps formatting and safe links', async () => {
        mockFetch(() => ({
            body: makeUser({
                about: '<i>Hi</i><script>alert(1)</script><img src=x onerror="alert(2)"><a href="javascript:alert(3)">bad</a><a href="https://example.com" onclick="x()">ok</a>',
            }),
        }));
        const { container } = renderWithProviders(<UserProfile />, { route: '/user/pg', path: '/user/:id' });

        await screen.findByText('Hi');
        const about = container.querySelector('.other-details p')!;
        expect(about.querySelector('i')).toHaveTextContent('Hi');
        expect(about.querySelector('script, img, [onerror], [onclick]')).toBeNull();
        expect(screen.getByText('bad')).not.toHaveAttribute('href');
        expect(screen.getByText('ok')).toHaveAttribute('href', 'https://example.com');
    });

    it.each([undefined, ''])('omits the about section when about is %j', async (about) => {
        mockFetch(() => ({ body: makeUser({ about }) }));
        const { container } = renderWithProviders(<UserProfile />, { route: '/user/pg', path: '/user/:id' });

        await screen.findByText('157316 ★');
        expect(container.querySelector('.other-details')).toBeNull();
    });

    it('shows Angular\'s error message for an unknown user (HNPWA 200 + null body)', async () => {
        mockFetch((url) => (url === userUrl('nobody') ? { body: null } : undefined));
        const { container } = renderWithProviders(<UserProfile />, { route: '/user/nobody', path: '/user/:id' });

        expect(await screen.findByText('Could not load user nobody.')).toBeInTheDocument();
        expect(container.querySelector('.loader')).toBeNull();
        expect(container.querySelector('.profile')).toBeNull();
    });

    it('shows the error message when HNPWA returns a plain-text body', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response("Cannot read property 'apply' of undefined", { status: 200 }))
        );
        renderWithProviders(<UserProfile />, { route: '/user/ghost', path: '/user/:id' });

        expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
    });

    it('never shows the previous user while the next id is loading', async () => {
        let releaseB: () => void = () => {};
        const gateB = new Promise<void>((resolve) => (releaseB = resolve));
        const respond = (id: string) =>
            new Response(JSON.stringify(makeUser({ id, karma: id === 'a' ? 1 : 2 })), { status: 200 });
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                if (String(input) === userUrl('b')) {
                    await gateB;
                    return respond('b');
                }
                return respond('a');
            })
        );
        const { container } = renderWithProviders(
            <>
                <UserProfile />
                <Link to="/user/b">go to b</Link>
            </>,
            { route: '/user/a', path: '/user/:id' }
        );

        expect(await screen.findByText('1 ★')).toBeInTheDocument();
        await userEvent.click(screen.getByText('go to b'));

        expect(screen.queryByText('1 ★')).toBeNull();
        expect(container.querySelector('.main-details')).toBeNull();
        expect(container.querySelector('.loader')).toBeInTheDocument();

        releaseB();
        expect(await screen.findByText('2 ★')).toBeInTheDocument();
        expect(container.querySelector('.main-details .name')).toHaveTextContent('b');
    });

    it('shows the loader, not the earlier result, when returning to a previously loaded id', async () => {
        let aCalls = 0;
        let releaseSecondA: () => void = () => {};
        const gate = new Promise<void>((resolve) => (releaseSecondA = resolve));
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input: RequestInfo | URL) => {
                if (String(input) === userUrl('b')) return new Promise<Response>(() => {});
                aCalls += 1;
                if (aCalls > 1) await gate;
                return new Response(JSON.stringify(makeUser({ id: 'a', karma: aCalls === 1 ? 10 : 11 })), { status: 200 });
            })
        );
        const { container } = renderWithProviders(
            <>
                <UserProfile />
                <Link to="/user/a">go to a</Link>
                <Link to="/user/b">go to b</Link>
            </>,
            { route: '/user/a', path: '/user/:id' }
        );

        expect(await screen.findByText('10 ★')).toBeInTheDocument();
        await userEvent.click(screen.getByText('go to b'));
        await userEvent.click(screen.getByText('go to a'));

        expect(screen.queryByText('10 ★')).toBeNull();
        expect(container.querySelector('.loader')).toBeInTheDocument();
        releaseSecondA();
        expect(await screen.findByText('11 ★')).toBeInTheDocument();
    });

    it.each(['{Enter}', ' '])('back button goes back in history via keyboard (%s)', async (key) => {
        mockFetch(() => ({ body: makeUser() }));
        render(
            <MemoryRouter
                initialEntries={['/news/2', '/user/pg']}
                initialIndex={1}
                future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
                <SettingsProvider>
                    <Routes>
                        <Route path="/user/:id" element={<UserProfile />} />
                        <Route path="*" element={null} />
                    </Routes>
                    <LocationProbe />
                </SettingsProvider>
            </MemoryRouter>
        );

        const back = await screen.findByRole('button', { name: 'Back' });
        expect(back.tagName).toBe('SPAN');
        expect(back).toHaveClass('back-button');
        back.focus();
        await userEvent.keyboard(key);
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/news/2'));
    });
});
