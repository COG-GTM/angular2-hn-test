export const mediaListeners: Array<(event: MediaQueryListEvent) => void> = [];
export const mediaState = { matches: false };

export function emitColorSchemeChange(matches: boolean) {
    mediaState.matches = matches;
    mediaListeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
}
