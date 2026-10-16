import { createContext, useContext } from 'react';
import { Settings } from '../models/settings';

export interface SettingsContextType {
    settings: Settings;
    toggleSettings: () => void;
    toggleOpenLinksInNewTab: () => void;
    setTheme: (theme: string) => void;
    setFont: (fontSize: string) => void;
    setSpacing: (listSpace: string) => void;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings(): SettingsContextType {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
}
