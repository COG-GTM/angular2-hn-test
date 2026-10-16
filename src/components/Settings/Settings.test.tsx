import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header/Header';
import { App } from '../../App';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeFeed } from '../../test/fixtures';

async function openSettings() {
    renderWithProviders(<Header />, { route: '/news/1' });
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    return screen.getByRole('dialog', { name: 'Settings' });
}

describe('Settings popup', () => {
    it('renders the Angular structure and moves focus to ×', async () => {
        await openSettings();
        const close = screen.getByRole('button', { name: 'Close settings' });
        expect(close.tagName).toBe('SPAN');
        expect(close).toHaveClass('close');
        expect(close).toHaveFocus();
        expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Links' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Select a theme' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Change Font' })).toBeInTheDocument();
    });

    it.each(['{Enter}', ' '])('× closes with the keyboard (%s)', async (key) => {
        const user = userEvent.setup();
        await openSettings();
        screen.getByRole('button', { name: 'Close settings' }).focus();
        await user.keyboard(key);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('returns focus to the cog when closed', async () => {
        const user = userEvent.setup();
        await openSettings();
        await user.keyboard('{Escape}');
        const cog = screen.getByRole('button', { name: 'Settings' });
        expect(cog).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        await user.keyboard('{Enter}');
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(cog).toHaveFocus();
    });

    it('keeps Tab and Shift+Tab inside the dialog', async () => {
        const user = userEvent.setup();
        const dialog = await openSettings();
        const close = screen.getByRole('button', { name: 'Close settings' });
        const inputs = dialog.querySelectorAll('input');
        const lastInput = inputs[inputs.length - 1];

        await user.tab({ shift: true });
        expect(lastInput).toHaveFocus();
        await user.tab();
        expect(close).toHaveFocus();
        for (let i = 0; i < inputs.length + 2; i++) {
            await user.tab();
            expect(dialog.contains(document.activeElement)).toBe(true);
        }
    });

    it('× closes on click and Escape closes', async () => {
        const user = userEvent.setup();
        await openSettings();
        await user.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(screen.queryByRole('dialog')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Settings' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('open-links checkbox toggles and persists', async () => {
        await openSettings();
        const box = screen.getByRole('checkbox', { name: 'Open links in a new tab' });
        expect(box).not.toBeChecked();
        await userEvent.click(box);
        expect(box).toBeChecked();
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('theme radios reflect and persist the theme', async () => {
        localStorage.setItem('theme', 'night');
        await openSettings();
        expect(screen.getByRole('radio', { name: 'Night' })).toBeChecked();
        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
        expect(screen.getByRole('radio', { name: 'Black (AMOLED)' })).toBeChecked();
        expect(localStorage.getItem('theme')).toBe('amoledblack');
        await userEvent.click(screen.getByRole('radio', { name: 'Default' }));
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('font size and list spacing persist on typing', async () => {
        await openSettings();
        const font = screen.getByRole('spinbutton', { name: 'Font size:' });
        const spacing = screen.getByRole('spinbutton', { name: 'List spacing:' });
        expect(font).toHaveValue(16);
        expect(spacing).toHaveValue(0);
        await userEvent.clear(font);
        await userEvent.type(font, '20');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        await userEvent.clear(spacing);
        await userEvent.type(spacing, '7');
        expect(localStorage.getItem('listSpacing')).toBe('7');
    });

    it('font size and list spacing persist on change without keyup (spinner / paste)', async () => {
        await openSettings();
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Font size:' }), { target: { value: '17' } });
        fireEvent.change(screen.getByRole('spinbutton', { name: 'List spacing:' }), { target: { value: '3' } });
        expect(localStorage.getItem('titleFontSize')).toBe('17');
        expect(localStorage.getItem('listSpacing')).toBe('3');
        expect(screen.getByRole('spinbutton', { name: 'Font size:' })).toHaveValue(17);
    });

    it('selecting a theme switches the class on the app root', async () => {
        mockFetch((url) => (url.includes('/news?page=1') ? { body: makeFeed(2) } : undefined));
        const { container } = renderWithProviders(<App />, { route: '/news/1' });
        const root = container.firstElementChild!;
        expect(root).toHaveClass('default');
        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await userEvent.click(screen.getByRole('radio', { name: 'Night' }));
        expect(root).toHaveClass('night');
        await userEvent.click(screen.getByRole('radio', { name: 'Black (AMOLED)' }));
        expect(root).toHaveClass('amoledblack');
        await waitFor(() => expect(screen.getAllByText('Story 1').length).toBeGreaterThan(0));
    });
});
