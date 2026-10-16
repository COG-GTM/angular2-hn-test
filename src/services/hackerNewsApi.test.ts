import { describe, expect, it, vi } from 'vitest';
import { fetchFeed, fetchItemContent, fetchUser } from './hackerNewsApi';
import { mockFetch } from '../test/utils';
import { makeFeed, makeStory } from '../test/fixtures';

describe('hackerNewsApi', () => {
    it('fetchFeed requests node-hnapi with the feed name and page', async () => {
        const fetchMock = mockFetch((url) =>
            url === 'https://node-hnapi.herokuapp.com/show?page=2' ? { body: makeFeed(3) } : undefined
        );
        await expect(fetchFeed('show', 2)).resolves.toHaveLength(3);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('rejects non-2xx responses', async () => {
        mockFetch(() => ({ status: 500, body: { error: 'boom' } }));
        await expect(fetchFeed('news', 1)).rejects.toMatchObject({ name: 'ApiError', status: 500 });
    });

    it('rejects null bodies and non-JSON bodies', async () => {
        mockFetch(() => ({ body: null }));
        await expect(fetchUser('nobody')).rejects.toThrow(/no data/);

        vi.stubGlobal('fetch', vi.fn(async () => new Response("Cannot read property 'apply' of undefined")));
        await expect(fetchUser('nobody')).rejects.toThrow(/invalid JSON/);
    });

    it('fetchUser uses HNPWA and encodes the id', async () => {
        const fetchMock = mockFetch((url) =>
            url === 'https://api.hnpwa.com/v0/user/a%2Fb.json' ? { body: { id: 'a/b', karma: 1, created: 'x' } } : undefined
        );
        await expect(fetchUser('a/b')).resolves.toMatchObject({ id: 'a/b' });
        expect(fetchMock).toHaveBeenCalledWith('https://api.hnpwa.com/v0/user/a%2Fb.json', undefined);
    });

    it('fetchItemContent resolves poll options before returning', async () => {
        const poll = makeStory({ id: 10, type: 'poll', poll: [{ points: 0, content: '' }, { points: 0, content: '' }] });
        mockFetch((url) => {
            if (url.endsWith('/item/10')) return { body: poll };
            if (url.endsWith('/item/11')) return { body: { points: 3, content: 'Yes' } };
            if (url.endsWith('/item/12')) return { body: { points: 1, content: 'No' } };
            return undefined;
        });
        const story = await fetchItemContent(10);
        expect(story.poll.map((p) => p.content)).toEqual(['Yes', 'No']);
        expect(story.poll_votes_count).toBe(4);
    });
});
