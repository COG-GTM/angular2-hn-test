import fetch from 'unfetch';
import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { FeedName } from '../models/feed-type';
import { Comment } from '../models/comment';
import { sanitizeHtml } from '../utils/sanitizeHtml';

export const baseUrl = 'https://node-hnapi.herokuapp.com';
// node-hnapi returns 404 for every /user/* request; HNPWA serves the same User shape.
export const userBaseUrl = 'https://api.hnpwa.com/v0';

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Fetches JSON and rejects on non-2xx, non-JSON and `null` bodies, so callers can show
 * the error state instead of a loader that never resolves (Angular's `lazyFetch` never
 * checked `res.ok`).
 */
async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new ApiError(`Request to ${url} failed with status ${res.status}`, res.status);
    }
    let data: T | null;
    try {
        data = (await res.json()) as T | null;
    } catch {
        throw new ApiError(`Request to ${url} returned invalid JSON`, res.status);
    }
    if (data === null || data === undefined) {
        throw new ApiError(`Request to ${url} returned no data`, 404);
    }
    return data;
}

export function fetchFeed(feedType: FeedName, page: number): Promise<Story[]> {
    return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

// HN `content`/`about` fields are rendered with dangerouslySetInnerHTML, so they are
// sanitized here once rather than relying on every view to remember.
function sanitizeComments(comments: Comment[] | undefined): Comment[] {
    return (comments ?? []).map((c) => ({
        ...c,
        content: sanitizeHtml(c.content),
        comments: sanitizeComments(c.comments),
    }));
}

export async function fetchItemContent(id: number): Promise<Story> {
    const raw = await fetchJson<Story>(`${baseUrl}/item/${id}`);
    const story: Story = { ...raw, content: sanitizeHtml(raw.content), comments: sanitizeComments(raw.comments) };
    if (story.type === 'poll' && Array.isArray(story.poll)) {
        const pollResults = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1)));
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
    const result = await fetchJson<PollResult>(`${baseUrl}/item/${id}`);
    return { ...result, content: sanitizeHtml(result.content) };
}

export async function fetchUser(id: string): Promise<User> {
    const user = await fetchJson<User>(`${userBaseUrl}/user/${encodeURIComponent(id)}.json`);
    return user.about === undefined ? user : { ...user, about: sanitizeHtml(user.about) };
}
