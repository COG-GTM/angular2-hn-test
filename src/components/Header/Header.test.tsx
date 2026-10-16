import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { renderWithProviders } from '../../test/utils';

describe('Header', () => {
    it('renders the logo home link and nav links with Angular routes', () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        expect(document.querySelector('a.home-link')).toHaveAttribute('href', '/news/1');
        expect(screen.getByRole('link', { name: 'new' })).toHaveAttribute('href', '/newest/1');
        expect(screen.getByRole('link', { name: 'show' })).toHaveAttribute('href', '/show/1');
        expect(screen.getByRole('link', { name: 'ask' })).toHaveAttribute('href', '/ask/1');
        expect(screen.getByRole('link', { name: 'jobs' })).toHaveAttribute('href', '/jobs/1');
        expect(document.querySelector('.header-nav')).toHaveTextContent('new | show | ask | jobs');
    });

    it.each([
        ['/newest/1', 'new'],
        ['/show/1', 'show'],
        ['/ask/1', 'ask'],
        ['/jobs/1', 'jobs'],
    ])('marks the active route like routerLinkActive (%s)', (route, name) => {
        renderWithProviders(<Header />, { route });
        for (const link of screen.getAllByRole('link').filter((a) => a.closest('.header-nav'))) {
            if (link.textContent === name) {
                expect(link).toHaveClass('active');
                expect(link).toHaveAttribute('aria-current', 'page');
            } else {
                expect(link).not.toHaveClass('active');
            }
        }
        expect(document.querySelector('a.home-link')).not.toHaveClass('active');
    });

    it('marks the home link active on /news/1', () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        expect(document.querySelector('a.home-link')).toHaveClass('active');
    });

    it('scrolls to top when a nav link is clicked', async () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        await userEvent.click(screen.getByRole('link', { name: 'show' }));
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('settings cog stays an img and toggles the popup with the keyboard', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Header />, { route: '/news/1' });
        const cog = screen.getByRole('button', { name: 'Settings' });
        expect(cog.tagName).toBe('IMG');
        expect(cog).toHaveClass('settings');
        expect(cog).toHaveAttribute('aria-expanded', 'false');
        expect(document.querySelector('#popup1')).toBeNull();

        cog.focus();
        await user.keyboard('{Enter}');
        expect(document.querySelector('#popup1.overlay')).toBeInTheDocument();
        expect(cog).toHaveAttribute('aria-expanded', 'true');

        cog.focus();
        await user.keyboard(' ');
        expect(document.querySelector('#popup1')).toBeNull();
    });

    it('toggles the popup on click', async () => {
        renderWithProviders(<Header />, { route: '/news/1' });
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    });
});
