import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from './SettingsContext';
import { useSettings } from './useSettings';
import { Settings } from '../components/Settings/Settings';
import { emitColorSchemeChange, mediaState } from '../test/matchMedia';

function Probe() {
    const { settings } = useSettings();
    return <pre data-testid="settings">{JSON.stringify(settings)}</pre>;
}

function renderSettings() {
    render(
        <SettingsProvider>
            <Settings />
            <Probe />
        </SettingsProvider>
    );
    return () => JSON.parse(screen.getByTestId('settings').textContent ?? '{}');
}

describe('SettingsProvider', () => {
    it('uses the Angular SettingsService defaults', () => {
        const current = renderSettings();
        expect(current()).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
    });

    it('restores persisted settings from localStorage', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        const current = renderSettings();
        expect(current()).toMatchObject({ openLinkInNewTab: true, theme: 'amoledblack', titleFontSize: '20', listSpacing: '5' });
    });

    it('persists changes made in the settings popup', async () => {
        const user = userEvent.setup();
        const current = renderSettings();

        await user.click(screen.getByLabelText('Open links in a new tab'));
        await user.click(screen.getByLabelText('Night'));
        const font = screen.getByLabelText('Font size:');
        await user.clear(font);
        await user.type(font, '22');

        expect(current()).toMatchObject({ openLinkInNewTab: true, theme: 'night', titleFontSize: '22' });
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        expect(localStorage.getItem('theme')).toBe('night');
        expect(localStorage.getItem('titleFontSize')).toBe('22');
    });

    it('follows the system dark mode when no theme is saved', () => {
        mediaState.matches = true;
        const current = renderSettings();
        expect(current().theme).toBe('night');
        act(() => emitColorSchemeChange(false));
        expect(current().theme).toBe('default');
    });
});
