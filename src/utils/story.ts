import { Story } from '../models/story';

/** Angular: `item.url.indexOf('http') === 0` decides external link vs. `/item/:id`. */
export function hasExternalUrl(item: Pick<Story, 'url'>): boolean {
    return !!item.url && item.url.indexOf('http') === 0;
}

/** Parses a positive integer route param (`:page`, `:id`); returns null when invalid. */
export function parsePositiveInt(value: string | undefined): number | null {
    if (!value || !/^\d+$/.test(value)) return null;
    const n = Number(value);
    return n > 0 ? n : null;
}
