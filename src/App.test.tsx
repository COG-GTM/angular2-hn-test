import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { App } from './App';

vi.mock('./services/hackerNewsApi', () => ({
    fetchFeed: vi.fn(() => Promise.resolve([])),
    fetchItemContent: vi.fn(() => Promise.resolve(null)),
    fetchUser: vi.fn(() => Promise.resolve(null)),
}));

function LocationDisplay() {
    const location = useLocation();
    return <div data-testid="location">{location.pathname}</div>;
}

function renderApp(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SettingsProvider>
                <App />
                <LocationDisplay />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('App', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the app shell (header navigation) without crashing', () => {
        renderApp('/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'show' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'ask' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'jobs' })).toBeInTheDocument();
    });

    it('redirects the index route "/" to "/news/1"', async () => {
        renderApp('/');
        await waitFor(() => {
            expect(screen.getByTestId('location')).toHaveTextContent('/news/1');
        });
    });

    it('renders a feed route directly', async () => {
        renderApp('/show/1');
        await waitFor(() => {
            expect(screen.getByTestId('location')).toHaveTextContent('/show/1');
        });
    });
});
