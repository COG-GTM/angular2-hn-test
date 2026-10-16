import fetch from 'unfetch';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { FeedName } from '../models/feed-type';

export const baseUrl = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/*; HNPWA returns the same user shape.
export const userFallbackUrl = 'https://api.hnpwa.com/v0';

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    const data = (await res.json()) as T | null;
    if (data === null || data === undefined) {
        throw new Error(`Request to ${url} returned no data`);
    }
    return data;
}

export function fetchFeed(feedType: FeedName, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const pollResults = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1)));
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
    const encodedId = encodeURIComponent(id);
    try {
        return await fetchJson<User>(`${baseUrl}/user/${encodedId}`);
    } catch {
        return fetchJson<User>(`${userFallbackUrl}/user/${encodedId}.json`);
    }
}
