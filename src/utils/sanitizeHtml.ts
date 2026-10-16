const ALLOWED_TAGS = new Set(['A', 'P', 'I', 'EM', 'B', 'STRONG', 'PRE', 'CODE', 'BR', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'SPAN']);
const ALLOWED_ATTRIBUTES: Record<string, string[]> = { A: ['href', 'rel', 'title'] };
const SAFE_URL = /^(https?:|mailto:|\/|#)/i;

function cleanNode(node: Node, doc: Document): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
        return doc.createTextNode(node.textContent ?? '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    const element = node as Element;
    const children = Array.from(element.childNodes)
        .map((child) => cleanNode(child, doc))
        .filter((child): child is Node => child !== null);

    if (!ALLOWED_TAGS.has(element.tagName)) {
        if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
            return null;
        }
        const fragment = doc.createDocumentFragment();
        children.forEach((child) => fragment.appendChild(child));
        return fragment;
    }

    const clean = doc.createElement(element.tagName.toLowerCase());
    for (const name of ALLOWED_ATTRIBUTES[element.tagName] ?? []) {
        const value = element.getAttribute(name);
        if (value === null) continue;
        if (name === 'href' && !SAFE_URL.test(value.trim())) continue;
        clean.setAttribute(name, value);
    }
    children.forEach((child) => clean.appendChild(child));
    return clean;
}

/**
 * Allowlist sanitizer for HN-provided HTML, mirroring what Angular's DomSanitizer
 * did for `[innerHTML]` bindings.
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return '';
    const parsed = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    const container = document.createElement('div');
    Array.from(parsed.body.childNodes).forEach((child) => {
        const clean = cleanNode(child, document);
        if (clean) container.appendChild(clean);
    });
    return container.innerHTML;
}
