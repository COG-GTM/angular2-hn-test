import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
    it('matches the Angular footer content and link', () => {
        const { container } = render(<Footer />);
        expect(container.querySelector('#footer')).toHaveTextContent('Show this project some ❤ on GitHub');
        const link = screen.getByRole('link', { name: 'GitHub' });
        expect(link).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener');
    });
});
