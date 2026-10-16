import { describe, expect, it } from 'vitest';
import { hasExternalUrl, parsePositiveInt } from './story';
import { formatCommentCount } from './formatCommentCount';

describe('story utils', () => {
    it('hasExternalUrl matches Angular url.indexOf("http") === 0', () => {
        expect(hasExternalUrl({ url: 'https://example.com' })).toBe(true);
        expect(hasExternalUrl({ url: 'item?id=1' })).toBe(false);
        expect(hasExternalUrl({ url: '' })).toBe(false);
    });

    it('parsePositiveInt rejects invalid route params', () => {
        expect(parsePositiveInt('3')).toBe(3);
        expect(parsePositiveInt('0')).toBeNull();
        expect(parsePositiveInt('abc')).toBeNull();
        expect(parsePositiveInt('1.5')).toBeNull();
        expect(parsePositiveInt(undefined)).toBeNull();
        expect(parsePositiveInt('9007199254740993')).toBeNull();
        expect(parsePositiveInt('9'.repeat(400))).toBeNull();
    });

    it('formatCommentCount matches the Angular comment pipe', () => {
        expect(formatCommentCount(0)).toBe('discuss');
        expect(formatCommentCount(1)).toBe('1 comment');
        expect(formatCommentCount(5)).toBe('5 comments');
    });
});
