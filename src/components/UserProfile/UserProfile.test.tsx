import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { UserProfile } from './UserProfile';
import { userFallbackUrl } from '../../services/hackerNewsApi';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeUser } from '../../test/fixtures';

function renderUser(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/user/:id" element={<UserProfile />} />
        </Routes>,
        { route }
    );
}

describe('UserProfile', () => {
    it('renders the profile', async () => {
        mockFetch((url) =>
            url === `${userFallbackUrl}/user/pg.json` ? { body: makeUser({ about: 'Bug <i>fixer</i>.' }) } : undefined
        );
        renderUser('/user/pg');
        expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
        expect(screen.getByText('157316 ★')).toBeInTheDocument();
        expect(screen.getByText('Created 18 years ago')).toBeInTheDocument();
        expect(screen.getByText('fixer').tagName).toBe('I');
    });

    it('shows an error when the user cannot be loaded', async () => {
        mockFetch(() => undefined);
        renderUser('/user/ghost');
        expect(await screen.findByText('Could not load user ghost.')).toBeInTheDocument();
    });
});
