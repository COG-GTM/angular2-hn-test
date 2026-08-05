import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetch from 'unfetch';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';
import { Story } from '../models/story';

vi.mock('unfetch', () => ({ default: vi.fn() }));

const mockedFetch = vi.mocked(fetch);

type FetchResponse = Awaited<ReturnType<typeof fetch>>;

function jsonResponse(body: unknown): FetchResponse {
    return { json: () => Promise.resolve(body) } as FetchResponse;
}

function story(overrides: Partial<Story> = {}): Story {
    return {
        id: 1,
        title: 'A story',
        points: 10,
        user: 'pg',
        time: 0,
        time_ago: '1 hour ago',
        type: 'story',
        url: 'https://example.com',
        domain: 'example.com',
        comments: [],
        comments_count: 3,
        content: '',
        poll: [],
        poll_votes_count: 0,
        deleted: false,
        dead: false,
        ...overrides,
    };
}

describe('hackerNewsApi', () => {
    beforeEach(() => {
        mockedFetch.mockReset();
    });

    it('requests the feed for the given type and page', async () => {
        const stories = [story()];
        mockedFetch.mockResolvedValue(jsonResponse(stories));

        await expect(fetchFeed('news', 2)).resolves.toEqual(stories);
        expect(mockedFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/news?page=2');
    });

    it('requests a user by id', async () => {
        const user = { id: 'pg', crated_time: 0, created: '', karma: 1, avg: 0, about: '' };
        mockedFetch.mockResolvedValue(jsonResponse(user));

        await expect(fetchUser('pg')).resolves.toEqual(user);
        expect(mockedFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/user/pg');
    });

    it('returns a non-poll item without extra requests', async () => {
        mockedFetch.mockResolvedValue(jsonResponse(story({ id: 7 })));

        const result = await fetchItemContent(7);

        expect(result.id).toBe(7);
        expect(mockedFetch).toHaveBeenCalledTimes(1);
    });

    it('resolves poll options and totals their votes', async () => {
        const poll = story({
            id: 100,
            type: 'poll',
            poll: [
                { content: '', points: 0 },
                { content: '', points: 0 },
            ],
        });
        mockedFetch
            .mockResolvedValueOnce(jsonResponse(poll))
            .mockResolvedValueOnce(jsonResponse({ content: 'Option A', points: 30 }))
            .mockResolvedValueOnce(jsonResponse({ content: 'Option B', points: 12 }));

        const result = await fetchItemContent(100);

        expect(result.poll.map((option) => option.content)).toEqual(['Option A', 'Option B']);
        expect(result.poll_votes_count).toBe(42);
        expect(mockedFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/101');
        expect(mockedFetch).toHaveBeenCalledWith('https://node-hnapi.herokuapp.com/item/102');
    });
});
