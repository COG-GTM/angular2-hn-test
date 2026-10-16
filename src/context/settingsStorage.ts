export const STORAGE_KEYS = {
    openLinkInNewTab: 'openLinkInNewTab',
    theme: 'theme',
    titleFontSize: 'titleFontSize',
    listSpacing: 'listSpacing',
} as const;

export const DEFAULT_SETTINGS = {
    openLinkInNewTab: false,
    theme: 'default',
    titleFontSize: '16',
    listSpacing: '0',
} as const;

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function readItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function writeItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage unavailable (private mode / quota): keep the in-memory value.
    }
}

/** Like Angular's `JSON.parse(localStorage.getItem('openLinkInNewTab'))`, but a corrupt value can't crash the app. */
export function readOpenLinkInNewTab(): boolean {
    const raw = readItem(STORAGE_KEYS.openLinkInNewTab);
    if (!raw) return DEFAULT_SETTINGS.openLinkInNewTab;
    try {
        return Boolean(JSON.parse(raw));
    } catch {
        return DEFAULT_SETTINGS.openLinkInNewTab;
    }
}

export function getDarkColorSchemeMedia(): MediaQueryList | null {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(DARK_COLOR_SCHEME_QUERY)
        : null;
}

export function systemTheme(media: MediaQueryList | null): string {
    return media?.matches ? 'night' : 'default';
}
