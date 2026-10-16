import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
    it('keeps HN formatting markup', () => {
        const html = '<p>Hi <i>there</i> <a href="https://x.com" rel="nofollow">link</a></p><pre><code>x</code></pre>';
        expect(sanitizeHtml(html)).toBe(
            '<p>Hi <i>there</i> <a href="https://x.com" rel="nofollow noopener noreferrer">link</a></p><pre><code>x</code></pre>'
        );
    });

    it('strips scripts, event handlers and unsafe URLs', () => {
        const out = sanitizeHtml(
            '<img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)" onclick="x()">t</a>'
        );
        expect(out).toBe('<a>t</a>');
    });

    it('rejects protocol-relative links and overrides untrusted rel', () => {
        expect(sanitizeHtml('<a href="//evil.com">a</a><a href="/\\evil.com">b</a>')).toBe('<a>a</a><a>b</a>');
        expect(sanitizeHtml('<a href="/item/1" rel="opener">c</a>')).toBe(
            '<a href="/item/1" rel="nofollow noopener noreferrer">c</a>'
        );
    });

    it('unwraps unknown tags but keeps their text', () => {
        expect(sanitizeHtml('<div><font>hello</font></div>')).toBe('hello');
    });

    it('handles empty input', () => {
        expect(sanitizeHtml(undefined)).toBe('');
        expect(sanitizeHtml('')).toBe('');
    });
});
