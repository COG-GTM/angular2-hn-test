import { describe, expect, it } from 'vitest';
import { STATIC_ASSET_PATTERN, isRuntimeCachedUrl } from './runtime-cache';

const APP = 'https://angular2-hn.firebaseapp.com';

describe('isRuntimeCachedUrl', () => {
    it.each([
        'https://node-hnapi.herokuapp.com/news?page=1',
        'https://node-hnapi.herokuapp.com/item/8863',
        'https://api.hnpwa.com/v0/user/pg.json',
        `${APP}/assets/icons/favicon-32x32.png`,
        `${APP}/assets/images/logo-header.png`,
        `${APP}/some-font.woff2`,
    ])('caches %s', (url) => {
        expect(isRuntimeCachedUrl(url, APP)).toBe(true);
    });

    it.each([
        'https://node-hnapi.herokuapp.com.evil.com/news',
        'https://example.com/logo.png',
        `${APP}/news/1`,
        `${APP}/assets/index-abc12345.js`,
        'https://www.google-analytics.com/analytics.js',
    ])('does not cache %s', (url) => {
        expect(isRuntimeCachedUrl(url, APP)).toBe(false);
    });
});

describe('STATIC_ASSET_PATTERN', () => {
    it('mirrors the Angular ngsw `assets` group extensions', () => {
        for (const ext of ['eot', 'svg', 'cur', 'jpg', 'png', 'webp', 'gif', 'otf', 'ttf', 'woff', 'woff2', 'ani']) {
            expect(STATIC_ASSET_PATTERN.test(`/x.${ext}`)).toBe(true);
        }
        expect(STATIC_ASSET_PATTERN.test('/x.js')).toBe(false);
    });
});
