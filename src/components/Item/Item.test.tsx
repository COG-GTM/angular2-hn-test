import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Item } from './Item';
import { renderWithProviders } from '../../test/utils';
import { makeStory } from '../../test/fixtures';
import type { Story } from '../../models/story';

function renderItem(overrides: Partial<Story> = {}) {
    return renderWithProviders(<Item item={makeStory(overrides)} />);
}

describe('Item (feed list item)', () => {
    it('links external URLs directly with a space before "(domain)"', () => {
        const { container } = renderItem({ title: 'Hello', url: 'https://example.com/a', domain: 'example.com' });

        const title = screen.getByRole('link', { name: 'Hello' });
        expect(title).toHaveAttribute('href', 'https://example.com/a');
        expect(title).not.toHaveAttribute('target');
        expect(title).not.toHaveAttribute('rel');
        expect(container.querySelector('p')).toHaveTextContent(/^Hello \(example\.com\)$/);
    });

    it('omits the domain span when there is no domain', () => {
        const { container } = renderItem({ url: 'https://example.com', domain: '' });
        expect(container.querySelector('.domain')).toBeNull();
    });

    it('links internal (Ask HN style) URLs to /item/:id', () => {
        renderItem({ id: 42, title: 'Ask HN: x', url: 'item?id=42', domain: '' });

        expect(screen.getByRole('link', { name: 'Ask HN: x' })).toHaveAttribute('href', '/item/42');
        expect(screen.queryByText(/\(.*\)/)).not.toBeInTheDocument();
    });

    it('opens external links in a new tab with rel="noopener" when the setting is on', () => {
        localStorage.setItem('openLinkInNewTab', 'true');
        renderItem({ title: 'Hello' });

        const title = screen.getByRole('link', { name: 'Hello' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(title).toHaveAttribute('rel', 'noopener');
    });

    it('applies titleFontSize and listSpacing settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '12');
        const { container } = renderItem({ title: 'Hello' });

        expect(screen.getByRole('link', { name: 'Hello' })).toHaveStyle({ fontSize: '20px' });
        expect(container.querySelector('.item-block > div')).toHaveStyle({ marginBottom: '12px' });
    });

    it('renders mobile and laptop subtext with user, points, time and comment links', () => {
        const { container } = renderItem({ id: 9, user: 'pg', points: 42, time_ago: '2 hours ago', comments_count: 3 });

        const palm = container.querySelector('.subtext-palm')!;
        expect(palm.querySelector('.name a')).toHaveAttribute('href', '/user/pg');
        expect(palm.querySelector('.right')).toHaveTextContent('42 ★');
        expect(palm.querySelector('.comment-number')).toHaveAttribute('href', '/item/9');
        expect(palm.querySelectorAll('.details')[1]).toHaveTextContent(/^2 hours ago • 3 comments$/);

        const laptop = container.querySelector('.subtext-laptop')!;
        expect(laptop).toHaveTextContent(/^42 points by pg 2 hours ago \| 3 comments$/);
        expect(laptop.querySelector('.item-details')).not.toBeNull();
    });

    it.each([
        [0, 'discuss'],
        [1, '1 comment'],
        [7, '7 comments'],
    ])('formats %i comments as "%s" (Angular comment pipe)', (count, text) => {
        renderItem({ comments_count: count });
        expect(screen.getAllByRole('link', { name: new RegExp(`^(• )?${text}$`) })).toHaveLength(2);
    });

    it('hides user, points and comments for job items', () => {
        const { container } = renderItem({ type: 'job', time_ago: '1 day ago' });

        expect(container.querySelectorAll('.subtext-palm .details')).toHaveLength(1);
        expect(container.querySelector('.subtext-palm')).toHaveTextContent(/^1 day ago$/);
        expect(container.querySelector('.subtext-laptop')).toHaveTextContent(/^1 day ago$/);
        expect(container.querySelector('.item-details')).toBeNull();
    });
});
