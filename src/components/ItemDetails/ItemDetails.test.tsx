import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ItemDetails } from './ItemDetails';
import { baseUrl } from '../../services/hackerNewsApi';
import { mockFetch, renderWithProviders } from '../../test/utils';
import { makeComment, makeStory } from '../../test/fixtures';

function renderItem(route: string) {
    return renderWithProviders(
        <Routes>
            <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>,
        { route }
    );
}

describe('ItemDetails', () => {
    it('renders story metadata, text and the comment tree', async () => {
        const story = makeStory({
            id: 5,
            title: 'Ask HN: Something?',
            url: 'item?id=5',
            content: '<p>Body text</p>',
            comments: [makeComment({ comments: [makeComment({ id: 101, content: 'Child' })] })],
        });
        mockFetch((url) => (url === `${baseUrl}/item/5` ? { body: story } : undefined));
        renderItem('/item/5');

        expect(await screen.findAllByText('Ask HN: Something?')).toHaveLength(2);
        expect(screen.getByText('Body text')).toBeInTheDocument();
        expect(screen.getByText('Top level comment')).toBeInTheDocument();
        expect(screen.getByText('Child')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    });

    it('renders poll results with proportional bars', async () => {
        const poll = makeStory({ id: 20, type: 'poll', poll: [{}, {}] as never });
        mockFetch((url) => {
            if (url === `${baseUrl}/item/20`) return { body: poll };
            if (url === `${baseUrl}/item/21`) return { body: { points: 3, content: 'Option A' } };
            if (url === `${baseUrl}/item/22`) return { body: { points: 1, content: 'Option B' } };
            return undefined;
        });
        const { container } = renderItem('/item/20');
        expect(await screen.findByText('Option A')).toBeInTheDocument();
        const bars = container.querySelectorAll<HTMLElement>('.pollBar');
        expect(bars[0].style.width).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });

    it('shows an error for invalid ids without fetching', async () => {
        const fetchMock = mockFetch(() => undefined);
        renderItem('/item/not-a-number');
        expect(screen.getByText('Could not load item comments.')).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
