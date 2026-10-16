import type { KeyboardEvent } from 'react';

/** Props that make a non-button element (kept for theme selectors) keyboard operable. */
export function buttonProps(onActivate: () => void, label?: string) {
    return {
        role: 'button',
        tabIndex: 0,
        'aria-label': label,
        onClick: onActivate,
        onKeyDown: (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivate();
            }
        },
    };
}
