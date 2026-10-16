import { describe, expect, it } from 'vitest';
import { baseUrl, fetchFeed, fetchItemContent, fetchUser, userFallbackUrl } from './hackerNewsApi';
import { mockFetch } from '../test/utils';
import { makeFeed, makeStory, makeUser } from '../test/fixtures';

describe('hackerNewsApi', () => {
    it('fetches a feed page from the same endpoint as the Angular service', async () => {
        const fetchMock = mockFetch((url) => (url === `${baseUrl}/newest?page=2` ? { body: makeFeed(2) } : undefined));
        await expect(fetchFeed('newest', 2)).resolves.toHaveLength(2);
        expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/newest?page=2`, undefined);
    });

    it('rejects on non-2xx responses and null bodies', async () => {
        mockFetch((url) => (url.includes('/item/') ? { body: null } : { status: 500, body: {} }));
        await expect(fetchFeed('news', 1)).rejects.toThrow(/500/);
        await expect(fetchItemContent(1)).rejects.toThrow(/no data/);
    });

    it('loads poll options and totals their votes', async () => {
        const poll = makeStory({ id: 10, type: 'poll', poll: [{}, {}] as never });
        mockFetch((url) => {
            if (url === `${baseUrl}/item/10`) return { body: poll };
            if (url === `${baseUrl}/item/11`) return { body: { points: 3, content: 'Yes' } };
            if (url === `${baseUrl}/item/12`) return { body: { points: 1, content: 'No' } };
            return undefined;
        });
        const story = await fetchItemContent(10);
        expect(story.poll.map((p) => p.content)).toEqual(['Yes', 'No']);
        expect(story.poll_votes_count).toBe(4);
    });

    it('falls back to HNPWA when node-hnapi has no user endpoint', async () => {
        const fetchMock = mockFetch((url) =>
            url === `${userFallbackUrl}/user/pg.json` ? { body: makeUser() } : undefined
        );
        await expect(fetchUser('pg')).resolves.toMatchObject({ id: 'pg', karma: 157316 });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(String(fetchMock.mock.calls[0][0])).toBe(`${baseUrl}/user/pg`);
    });

    it('rejects when no API knows the user', async () => {
        mockFetch((url) => (url.endsWith('.json') ? { body: null } : undefined));
        await expect(fetchUser('nobody')).rejects.toThrow();
    });
});
