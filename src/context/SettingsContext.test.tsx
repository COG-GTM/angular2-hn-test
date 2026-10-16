import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { SettingsProvider } from './SettingsContext';
import { useSettings, type SettingsContextType } from './useSettings';
import { emitColorSchemeChange, mediaListeners, mediaState } from '../test/matchMedia';

const seen: SettingsContextType[] = [];

function Probe() {
    seen.push(useSettings());
    return null;
}

function renderProvider() {
    seen.length = 0;
    const utils = render(
        <SettingsProvider>
            <Probe />
        </SettingsProvider>
    );
    return { ...utils, current: () => seen[seen.length - 1] };
}

describe('SettingsProvider (parity with SettingsService)', () => {
    it('uses the Angular defaults and persists the resolved theme like initTheme()', () => {
        const { current } = renderProvider();
        expect(current().settings).toEqual({
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(localStorage.getItem('theme')).toBe('default');
        expect(localStorage.getItem('openLinkInNewTab')).toBeNull();
        expect(localStorage.getItem('titleFontSize')).toBeNull();
        expect(localStorage.getItem('listSpacing')).toBeNull();
    });

    it('reads saved values from the same localStorage keys', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        localStorage.setItem('theme', 'amoledblack');
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '5');
        const { current } = renderProvider();
        expect(current().settings).toMatchObject({
            openLinkInNewTab: true,
            theme: 'amoledblack',
            titleFontSize: '20',
            listSpacing: '5',
        });
    });

    it('a saved theme wins over a dark system preference', () => {
        mediaState.matches = true;
        localStorage.setItem('theme', 'default');
        const { current } = renderProvider();
        expect(current().settings.theme).toBe('default');
        expect(seen.every((ctx) => ctx.settings.theme === 'default')).toBe(true);
    });

    it('follows prefers-color-scheme: dark on first render when nothing is saved, and persists it', () => {
        mediaState.matches = true;
        const { current } = renderProvider();
        expect(seen[0].settings.theme).toBe('night');
        expect(current().settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('applies live system colour-scheme changes', () => {
        localStorage.setItem('theme', 'amoledblack');
        const { current } = renderProvider();
        act(() => emitColorSchemeChange(true));
        expect(current().settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
        act(() => emitColorSchemeChange(false));
        expect(current().settings.theme).toBe('default');
        expect(localStorage.getItem('theme')).toBe('default');
    });

    it('removes the media listener on unmount', () => {
        const { unmount } = renderProvider();
        expect(mediaListeners).toHaveLength(1);
        unmount();
        expect(mediaListeners).toHaveLength(0);
    });

    it.each(['not json', '{', 'undefined', '"false"', '1', '{}'])('falls back to false for a corrupt or non-boolean openLinkInNewTab (%s)', (raw) => {
        localStorage.setItem('openLinkInNewTab', raw);
        const { current } = renderProvider();
        expect(current().settings.openLinkInNewTab).toBe(false);
    });

    it('setters update state and persist with the Angular keys/format', () => {
        const { current } = renderProvider();
        act(() => current().toggleOpenLinksInNewTab());
        expect(current().settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        act(() => current().toggleOpenLinksInNewTab());
        expect(localStorage.getItem('openLinkInNewTab')).toBe('false');

        act(() => current().setTheme('amoledblack'));
        expect(current().settings.theme).toBe('amoledblack');
        expect(localStorage.getItem('theme')).toBe('amoledblack');

        act(() => current().setFont('22'));
        expect(current().settings.titleFontSize).toBe('22');
        expect(localStorage.getItem('titleFontSize')).toBe('22');

        act(() => current().setSpacing('8'));
        expect(current().settings.listSpacing).toBe('8');
        expect(localStorage.getItem('listSpacing')).toBe('8');

        act(() => current().toggleSettings());
        expect(current().settings.showSettings).toBe(true);
        act(() => current().toggleSettings());
        expect(current().settings.showSettings).toBe(false);
    });

    it('memoizes the context value across provider re-renders', () => {
        const { rerender } = renderProvider();
        const before = seen[seen.length - 1];
        rerender(
            <SettingsProvider>
                <Probe />
            </SettingsProvider>
        );
        expect(seen[seen.length - 1]).toBe(before);
    });
});
