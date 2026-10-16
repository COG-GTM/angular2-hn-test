import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { Settings } from '../models/settings';
import { SettingsContext, type SettingsContextType } from './useSettings';
import {
    DEFAULT_SETTINGS,
    STORAGE_KEYS,
    getDarkColorSchemeMedia,
    readItem,
    readOpenLinkInNewTab,
    systemTheme,
    writeItem,
} from './settingsStorage';

function initialSettings(): Settings {
    return {
        showSettings: false,
        openLinkInNewTab: readOpenLinkInNewTab(),
        // Resolved before the first paint (Angular's service did this in its constructor) so there is no theme flash.
        theme: readItem(STORAGE_KEYS.theme) || systemTheme(getDarkColorSchemeMedia()),
        titleFontSize: readItem(STORAGE_KEYS.titleFontSize) || DEFAULT_SETTINGS.titleFontSize,
        listSpacing: readItem(STORAGE_KEYS.listSpacing) || DEFAULT_SETTINGS.listSpacing,
    };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const setTheme = useCallback((theme: string) => {
        writeItem(STORAGE_KEYS.theme, theme);
        setSettings((prev) => (prev.theme === theme ? prev : { ...prev, theme }));
    }, []);

    // Mirrors SettingsService.initTheme() + subscribeToSystemPreferredColorScheme().
    useEffect(() => {
        const media = getDarkColorSchemeMedia();
        if (!readItem(STORAGE_KEYS.theme)) {
            setTheme(systemTheme(media));
        }
        if (!media) return;

        const handleChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'night' : 'default');
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [setTheme]);

    const toggleSettings = useCallback(() => {
        setSettings((prev) => ({ ...prev, showSettings: !prev.showSettings }));
    }, []);

    const toggleOpenLinksInNewTab = useCallback(() => {
        setSettings((prev) => {
            const openLinkInNewTab = !prev.openLinkInNewTab;
            writeItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(openLinkInNewTab));
            return { ...prev, openLinkInNewTab };
        });
    }, []);

    const setFont = useCallback((titleFontSize: string) => {
        writeItem(STORAGE_KEYS.titleFontSize, titleFontSize);
        setSettings((prev) => ({ ...prev, titleFontSize }));
    }, []);

    const setSpacing = useCallback((listSpacing: string) => {
        writeItem(STORAGE_KEYS.listSpacing, listSpacing);
        setSettings((prev) => ({ ...prev, listSpacing }));
    }, []);

    const value = useMemo<SettingsContextType>(
        () => ({ settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing }),
        [settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
