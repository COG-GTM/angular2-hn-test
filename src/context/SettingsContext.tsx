import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { Settings } from '../models/settings';
import { SettingsContext } from './useSettings';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function initialSettings(): Settings {
    const openLinkInNewTab = localStorage.getItem('openLinkInNewTab');
    return {
        showSettings: false,
        openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
        theme: localStorage.getItem('theme') || 'default',
        titleFontSize: localStorage.getItem('titleFontSize') || '16',
        listSpacing: localStorage.getItem('listSpacing') || '0',
    };
}

/** React port of Angular's SettingsService: same defaults, localStorage keys and system theme sync. */
export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        localStorage.setItem('theme', theme);
        setSettings((prev) => ({ ...prev, theme }));
    }, []);

    useEffect(() => {
        const darkColorSchemeMedia = window.matchMedia(DARK_SCHEME_QUERY);
        const applySystemScheme = (matches: boolean) => setTheme(matches ? 'night' : 'default');
        const handleChange = (event: MediaQueryListEvent) => applySystemScheme(event.matches);

        darkColorSchemeMedia.addEventListener('change', handleChange);
        if (!localStorage.getItem('theme')) {
            applySystemScheme(darkColorSchemeMedia.matches);
        }
        return () => darkColorSchemeMedia.removeEventListener('change', handleChange);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            localStorage.setItem('openLinkInNewTab', JSON.stringify(openLinkInNewTab));
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        localStorage.setItem('titleFontSize', titleFontSize);
        setSettings((prev) => ({ ...prev, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        localStorage.setItem('listSpacing', listSpacing);
        setSettings((prev) => ({ ...prev, listSpacing }));
    }, []);

    const value = useMemo(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
