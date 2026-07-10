import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';

function wrapper({ children }: { children: ReactNode }) {
    return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('provides default settings through the provider', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings).toMatchObject({
            showSettings: false,
            openLinkInNewTab: false,
            titleFontSize: '16',
            listSpacing: '0',
        });
        expect(typeof result.current.toggleSettings).toBe('function');
    });

    it('throws when useSettings is used outside of a provider', () => {
        expect(() => renderHook(() => useSettings())).toThrow(
            'useSettings must be used within a SettingsProvider'
        );
    });

    it('toggleSettings flips the showSettings flag', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.showSettings).toBe(false);
        act(() => result.current.toggleSettings());
        expect(result.current.settings.showSettings).toBe(true);
    });

    it('setTheme updates settings and persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setTheme('night'));
        expect(result.current.settings.theme).toBe('night');
        expect(localStorage.getItem('theme')).toBe('night');
    });

    it('toggleOpenLinksInNewTab updates settings and persists to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    });

    it('setFont and setSpacing update settings and persist to localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => result.current.setFont('20'));
        act(() => result.current.setSpacing('5'));
        expect(result.current.settings.titleFontSize).toBe('20');
        expect(result.current.settings.listSpacing).toBe('5');
        expect(localStorage.getItem('titleFontSize')).toBe('20');
        expect(localStorage.getItem('listSpacing')).toBe('5');
    });
});
