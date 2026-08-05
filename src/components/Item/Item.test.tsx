import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SettingsProvider } from '../../context/SettingsContext';
import { Story } from '../../models/story';
import { Item } from './Item';

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com/post',
        domain: 'example.com',
        comments: [],
        comments_count: 2,
        content: '',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

function renderItem(item: Story) {
    return render(
        <MemoryRouter>
            <SettingsProvider>
                <Item item={item} />
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Item', () => {
    it('links externally and shows the domain for a story with a url', () => {
        renderItem(story());

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute(
            'href',
            'https://example.com/post'
        );
        expect(screen.getByText('(example.com)')).toBeInTheDocument();
    });

    it('links to the item details page when the story has no external url', () => {
        renderItem(story({ url: '', domain: '' }));

        expect(screen.getByRole('link', { name: 'A story' })).toHaveAttribute('href', '/item/1');
    });

    it('shows points, author and comment count for a story', () => {
        renderItem(story());

        expect(screen.getAllByRole('link', { name: 'pg' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/2 comments/).length).toBeGreaterThan(0);
        expect(screen.getByText('10 ★')).toBeInTheDocument();
    });

    it('hides points and comments for a job posting', () => {
        renderItem(story({ type: 'job', title: 'A job' }));

        expect(screen.queryByText('10 ★')).not.toBeInTheDocument();
        expect(screen.queryByText(/comments/)).not.toBeInTheDocument();
        expect(screen.getAllByText('1 hour ago').length).toBeGreaterThan(0);
    });
});
