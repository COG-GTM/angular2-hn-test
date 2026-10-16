import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Item } from './Item';
import { renderWithProviders } from '../../test/utils';
import { makeStory } from '../../test/fixtures';

describe('Item', () => {
    it('links external stories to their URL and shows the domain', () => {
        renderWithProviders(<Item item={makeStory()} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', 'https://example.com/post');
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: '3 comments' })[0]).toHaveAttribute('href', '/item/1');
    });

    it('links self posts to the item page', () => {
        renderWithProviders(<Item item={makeStory({ url: 'item?id=1', domain: '' })} />);
        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
    });

    it('hides points, user and comments for jobs', () => {
        renderWithProviders(<Item item={makeStory({ type: 'job' })} />);
        expect(screen.queryByRole('link', { name: 'pg' })).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
    });

    it('applies the font size, spacing and new-tab settings', () => {
        localStorage.setItem('titleFontSize', '20');
        localStorage.setItem('listSpacing', '7');
        localStorage.setItem('openLinkInNewTab', 'true');
        const { container } = renderWithProviders(<Item item={makeStory()} />);
        const title = screen.getByRole('link', { name: 'A story' });
        expect(title).toHaveStyle({ fontSize: '20px' });
        expect(title).toHaveAttribute('target', '_blank');
        expect(container.querySelector('.item-block')).toHaveStyle({ marginBottom: '7px' });
    });
});
